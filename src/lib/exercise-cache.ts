// Exercise caching system for instant practice sessions
import { generatePracticeSessionAction } from '@/app/actions';

export interface Exercise {
  id: string;
  problem: string;
  solution: string;
  explanation: string;
}

export interface ExercisePool {
  cardId: string;
  exercises: Exercise[];
  lastGenerated: string;
}

const CACHE_KEY = 'mathminds_exercise_pools';
const TARGET_POOL_SIZE = 3;

export const exerciseCache = {
  // Get all exercise pools
  getAllPools(): Record<string, ExercisePool> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading exercise pools:', error);
      return {};
    }
  },

  // Get exercise pool for a specific card
  getPool(cardId: string): Exercise[] {
    const pools = this.getAllPools();
    return pools[cardId]?.exercises || [];
  },

  // Save all pools
  savePools(pools: Record<string, ExercisePool>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(pools));
    } catch (error) {
      console.error('Error saving exercise pools:', error);
    }
  },

  // Add exercises to pool
  addToPool(cardId: string, exercises: Exercise[]): void {
    const pools = this.getAllPools();
    
    if (!pools[cardId]) {
      pools[cardId] = {
        cardId,
        exercises: [],
        lastGenerated: new Date().toISOString()
      };
    }
    
    // Add new exercises to the pool
    pools[cardId].exercises.push(...exercises);
    pools[cardId].lastGenerated = new Date().toISOString();
    
    this.savePools(pools);
  },

  // Get exercises without consuming (for instant display)
  getWithoutConsuming(cardId: string, count: number): Exercise[] {
    const pools = this.getAllPools();
    const pool = pools[cardId];
    
    if (!pool || pool.exercises.length === 0) {
      return [];
    }
    
    // Return exercises without removing them
    return pool.exercises.slice(0, count);
  },

  // Consume exercises from pool (FIFO)
  consumeFromPool(cardId: string, count: number = 1): Exercise[] {
    const pools = this.getAllPools();
    const pool = pools[cardId];
    
    if (!pool || pool.exercises.length === 0) {
      return [];
    }
    
    // Take exercises from the beginning (FIFO)
    const consumed = pool.exercises.splice(0, count);
    
    // Save updated pool
    this.savePools(pools);
    
    // Trigger background regeneration if pool is getting low
    if (pool.exercises.length < TARGET_POOL_SIZE) {
      this.maintainPoolSize(cardId).catch(console.error);
    }
    
    return consumed;
  },

  // Preload exercises for a card
  async preloadExercises(card: {
    id: string;
    topic: string;
    difficulty: number;
    customInstructions: string;
  }): Promise<void> {
    try {
      console.log(`Preloading exercises for card ${card.id}...`);
      
      // Generate initial pool of exercises
      const result = await generatePracticeSessionAction({
        topic: card.topic,
        difficulty: card.difficulty,
        customInstructions: card.customInstructions,
        exerciseCount: TARGET_POOL_SIZE
      });
      
      if (result.data) {
        this.addToPool(card.id, result.data);
        console.log(`Preloaded ${result.data.length} exercises for card ${card.id}`);
      }
    } catch (error) {
      console.error('Error preloading exercises:', error);
    }
  },

  // Maintain pool size (generate more if needed)
  async maintainPoolSize(cardId: string, targetSize: number = TARGET_POOL_SIZE): Promise<void> {
    const currentPool = this.getPool(cardId);
    const needed = targetSize - currentPool.length;
    
    if (needed <= 0) return;
    
    // Get card info from storage to generate appropriate exercises
    const { cardStorage } = await import('./storage');
    const card = cardStorage.getById(cardId);
    
    if (!card) {
      console.error(`Card ${cardId} not found`);
      return;
    }
    
    // Generate in background without blocking
    setTimeout(async () => {
      try {
        console.log(`[Background] Generating ${needed} more exercises for card ${cardId}...`);
        
        const result = await generatePracticeSessionAction({
          topic: card.topic,
          difficulty: card.difficulty,
          customInstructions: card.customInstructions,
          exerciseCount: needed
        });
        
        if (result.data) {
          this.addToPool(cardId, result.data);
          console.log(`[Background] Added ${result.data.length} exercises to pool for card ${cardId}`);
        }
      } catch (error) {
        console.error('[Background] Error maintaining pool size:', error);
      }
    }, 100); // Small delay to ensure UI updates first
  },

  // Clear pool for a specific card
  clearPool(cardId: string): void {
    const pools = this.getAllPools();
    delete pools[cardId];
    this.savePools(pools);
  },

  // Clear all pools
  clearAllPools(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_KEY);
  },

  // Get pool status (for debugging/UI)
  getPoolStatus(cardId: string): {
    size: number;
    lastGenerated: string | null;
    ready: boolean;
  } {
    const pools = this.getAllPools();
    const pool = pools[cardId];
    
    return {
      size: pool?.exercises.length || 0,
      lastGenerated: pool?.lastGenerated || null,
      ready: (pool?.exercises.length || 0) >= TARGET_POOL_SIZE
    };
  },

  // Ensure exercises are available (generate synchronously if needed)
  async ensureExercisesAvailable(card: {
    id: string;
    topic: string;
    difficulty: number;
    customInstructions: string;
    exerciseCount: number;
  }): Promise<Exercise[]> {
    const currentPool = this.getWithoutConsuming(card.id, card.exerciseCount);
    
    if (currentPool.length >= card.exerciseCount) {
      // We have enough, return them immediately
      return currentPool;
    }
    
    // We need to generate more RIGHT NOW
    console.log(`Generating exercises synchronously for card ${card.id}...`);
    
    try {
      const result = await generatePracticeSessionAction({
        topic: card.topic,
        difficulty: card.difficulty,
        customInstructions: card.customInstructions,
        exerciseCount: card.exerciseCount
      });
      
      if (result.data) {
        // Add to pool for future use
        this.addToPool(card.id, result.data);
        return result.data;
      }
    } catch (error) {
      console.error('Error ensuring exercises:', error);
    }
    
    // If all else fails, return what we have
    return currentPool;
  }
};