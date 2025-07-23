// Exercise caching system for instant practice sessions
import { api } from '@/lib/api-client';
import { getCurrentProfileStorageKey } from './profiles';

export interface Exercise {
  id: string;
  problem: string;
  solution: string;
  explanation: string;
  // Metadata para el sistema de caché inteligente
  usedAt?: string;      // Timestamp de último uso
  usageCount?: number;  // Veces que se ha usado
  createdAt: string;    // Cuándo se generó el ejercicio
}

export interface ExercisePool {
  cardId: string;
  exercises: Exercise[];
  lastGenerated: string;
}

const BASE_CACHE_KEY = 'mathminds_exercise_pools';

// Helper to get current cache key
const getCacheKey = () => getCurrentProfileStorageKey(BASE_CACHE_KEY);
const TARGET_POOL_SIZE = 30;  // Pool óptimo de ejercicios
const MINIMUM_POOL_SIZE = 10;  // Mínimo antes de regenerar
const ROTATION_DAYS = 7;       // Días antes de reutilizar ejercicios
const MAX_POOL_SIZE = 50;      // Máximo de ejercicios por tarjeta
const CLEANUP_DAYS = 30;       // Días antes de eliminar ejercicios muy antiguos

export const exerciseCache = {
  // Get all exercise pools
  getAllPools(): Record<string, ExercisePool> {
    if (typeof window === 'undefined') return {};
    
    try {
      // Migrate from old key if needed
      this.migrateFromOldKey();
      
      const stored = localStorage.getItem(getCacheKey());
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
      localStorage.setItem(getCacheKey(), JSON.stringify(pools));
    } catch (error) {
      console.error('Error saving exercise pools:', error);
    }
  },

  // Add exercises to pool
  async addToPool(cardId: string, exercises: Exercise[]): Promise<void> {
    const pools = this.getAllPools();
    
    if (!pools[cardId]) {
      pools[cardId] = {
        cardId,
        exercises: [],
        lastGenerated: new Date().toISOString()
      };
    }
    
    // Get card info to validate operation type
    const { cardStorage } = await import('./storage');
    const card = cardStorage.getById(cardId);
    
    // Validate exercises before adding to pool
    const { isValidExercise, diagnoseExercise, validateOperationType } = await import('./math-validator');
    const validExercises: Exercise[] = [];
    
    for (const exercise of exercises) {
      // Basic validation - ensure required fields exist
      if (!exercise || typeof exercise !== 'object') {
        console.error(`[Cache] Invalid exercise object:`, exercise);
        continue;
      }
      
      if (!exercise.problem || !exercise.solution || !exercise.explanation) {
        console.error(`[Cache] Exercise missing required fields:`, {
          hasId: !!exercise.id,
          hasProblem: !!exercise.problem,
          hasSolution: !!exercise.solution,
          hasExplanation: !!exercise.explanation,
          exercise: exercise
        });
        continue;
      }
      
      // Check if operation type matches the card topic
      if (card && card.topic) {
        const operationValidation = validateOperationType(exercise.problem, card.topic);
        if (!operationValidation.valid) {
          console.error(`[Cache] Exercise has wrong operation type:`, {
            problem: exercise.problem || 'undefined',
            topic: card.topic || 'undefined',
            expected: operationValidation.expectedOperation || 'none',
            actual: operationValidation.actualOperation || 'none',
            cardId: cardId
          });
          continue; // Skip this exercise completely
        }
      } else if (!card) {
        console.warn(`[Cache] Card not found for cardId: ${cardId}`);
      }
      
      const validation = isValidExercise(exercise);
      
      // Agregar metadata si no existe
      const exerciseWithMetadata: Exercise = {
        ...exercise,
        createdAt: exercise.createdAt || new Date().toISOString(),
        usageCount: exercise.usageCount || 0
      };
      
      if (validation.valid) {
        validExercises.push(exerciseWithMetadata);
      } else {
        const diagnosis = diagnoseExercise(exercise);
        console.warn(`[Cache] Exercise validation warnings:`, {
          problem: exercise.problem,
          solution: exercise.solution,
          errors: diagnosis.errors,
          suggestions: diagnosis.suggestions
        });
        // Add it anyway if it has all required fields
        validExercises.push(exerciseWithMetadata);
      }
    }
    
    if (validExercises.length === 0) {
      console.error(`[Cache] No exercises to add for card ${cardId} - all were missing required fields`);
      return;
    }
    
    // Add exercises to the pool
    pools[cardId].exercises.push(...validExercises);
    pools[cardId].lastGenerated = new Date().toISOString();
    
    console.log(`[Cache] Added ${validExercises.length} valid exercises (rejected ${exercises.length - validExercises.length} invalid)`);
    
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

  // Marcar ejercicios como usados (sin eliminarlos del pool)
  markAsUsed(cardId: string, exerciseIds: string[]): void {
    const pools = this.getAllPools();
    const pool = pools[cardId];
    
    if (!pool) return;
    
    const now = new Date().toISOString();
    pool.exercises = pool.exercises.map(exercise => {
      if (exerciseIds.includes(exercise.id)) {
        return {
          ...exercise,
          usedAt: now,
          usageCount: (exercise.usageCount || 0) + 1
        };
      }
      return exercise;
    });
    
    this.savePools(pools);
    
    // Verificar si necesitamos más ejercicios
    const unusedCount = pool.exercises.filter(ex => !ex.usedAt).length;
    if (unusedCount < MINIMUM_POOL_SIZE) {
      this.maintainPoolSize(cardId).catch(console.error);
    }
  },

  // Obtener ejercicios no usados (o los menos recientemente usados)
  getUnusedExercises(cardId: string, count: number): Exercise[] {
    const pools = this.getAllPools();
    const pool = pools[cardId];
    
    if (!pool || pool.exercises.length === 0) {
      return [];
    }
    
    const now = new Date();
    const rotationThreshold = new Date(now.getTime() - (ROTATION_DAYS * 24 * 60 * 60 * 1000));
    
    // Categorizar ejercicios
    const neverUsed = pool.exercises.filter(ex => !ex.usedAt);
    const recentlyUsed = pool.exercises.filter(ex => 
      ex.usedAt && new Date(ex.usedAt) > rotationThreshold
    );
    const readyToRotate = pool.exercises.filter(ex => 
      ex.usedAt && new Date(ex.usedAt) <= rotationThreshold
    );
    
    // Ordenar los que están listos para rotar por uso más antiguo primero
    readyToRotate.sort((a, b) => {
      const dateA = new Date(a.usedAt || 0).getTime();
      const dateB = new Date(b.usedAt || 0).getTime();
      return dateA - dateB;
    });
    
    // Ordenar los usados recientemente por uso más antiguo primero (en caso de emergencia)
    recentlyUsed.sort((a, b) => {
      const dateA = new Date(a.usedAt || 0).getTime();
      const dateB = new Date(b.usedAt || 0).getTime();
      return dateA - dateB;
    });
    
    // Prioridad: 1) Nunca usados, 2) Listos para rotar, 3) Usados recientemente
    const available = [...neverUsed, ...readyToRotate, ...recentlyUsed];
    
    // Log para debug
    console.log(`[Cache] Exercise selection for card ${cardId}:`, {
      neverUsed: neverUsed.length,
      readyToRotate: readyToRotate.length,
      recentlyUsed: recentlyUsed.length,
      requested: count
    });
    
    return available.slice(0, count);
  },

  // Consume exercises from pool (FIFO) - DEPRECATED, mantener por compatibilidad
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
    if (pool.exercises.length < MINIMUM_POOL_SIZE) {
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
    levelExamples?: { [level: number]: string[] };
    structuredExamples?: { [level: number]: { problem: string; solution: string; explanation: string }[] };
  }): Promise<void> {
    try {
      console.log(`Preloading exercises for card ${card.id}...`);
      
      // Generate initial pool of exercises
      const result = await api.generatePracticeSession({
        topic: card.topic,
        difficulty: card.difficulty,
        customInstructions: card.customInstructions,
        exerciseCount: TARGET_POOL_SIZE,
        levelExamples: card.levelExamples,
        structuredExamples: card.structuredExamples
      });
      
      if (result.data) {
        await this.addToPool(card.id, result.data);
        console.log(`Preloaded ${result.data.length} exercises for card ${card.id}`);
      }
    } catch (error) {
      console.error('Error preloading exercises:', error);
    }
  },

  // Maintain pool size (generate more if needed)
  async maintainPoolSize(cardId: string, targetSize: number = TARGET_POOL_SIZE): Promise<void> {
    const pools = this.getAllPools();
    const pool = pools[cardId];
    
    if (!pool) return;
    
    // Contar ejercicios no usados
    const unusedCount = pool.exercises.filter(ex => !ex.usedAt).length;
    const totalCount = pool.exercises.length;
    
    // Necesitamos más ejercicios si:
    // 1. Hay menos ejercicios no usados que el mínimo
    // 2. El pool total es menor que el objetivo
    const needsMore = unusedCount < MINIMUM_POOL_SIZE || totalCount < targetSize;
    
    if (!needsMore) return;
    
    // Calcular cuántos generar
    const needed = Math.max(
      targetSize - totalCount,  // Llenar hasta el objetivo
      MINIMUM_POOL_SIZE - unusedCount  // Asegurar mínimo de no usados
    );
    
    // Generar en lotes de 10 para eficiencia
    const batchSize = Math.max(10, needed);
    
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
        console.log(`[Background] Pool status for card "${card.name}":`, {
          total: totalCount,
          unused: unusedCount,
          generating: batchSize
        });
        
        const result = await api.generatePracticeSession({
          topic: card.topic,
          difficulty: card.difficulty,
          customInstructions: card.customInstructions,
          exerciseCount: batchSize,
          levelExamples: card.levelExamples,
          structuredExamples: card.structuredExamples
        });
        
        if (result.data) {
          await this.addToPool(cardId, result.data);
          console.log(`[Background] Successfully added ${result.data.length} exercises to pool for "${card.name}"`);
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
    localStorage.removeItem(getCacheKey());
  },
  
  // Migrate data from old key to profile-specific key
  migrateFromOldKey(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if there's data in the old key
      const oldData = localStorage.getItem(BASE_CACHE_KEY);
      const currentKey = getCacheKey();
      
      // If old data exists and new key doesn't have data, migrate
      if (oldData && !localStorage.getItem(currentKey)) {
        console.log('Migrating exercise pools to profile-specific storage');
        localStorage.setItem(currentKey, oldData);
        // Don't remove old data yet, keep for other profiles that might need migration
      }
    } catch (error) {
      console.error('Error migrating exercise pools:', error);
    }
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
      ready: (pool?.exercises.length || 0) >= MINIMUM_POOL_SIZE  // Ready si tiene el mínimo
    };
  },

  // Ensure exercises are available (generate synchronously if needed)
  async ensureExercisesAvailable(card: {
    id: string;
    topic: string;
    difficulty: number;
    customInstructions: string;
    exerciseCount: number;
    levelExamples?: { [level: number]: string[] };
    structuredExamples?: { [level: number]: { problem: string; solution: string; explanation: string }[] };
  }): Promise<Exercise[]> {
    const currentPool = this.getWithoutConsuming(card.id, card.exerciseCount);
    
    if (currentPool.length >= card.exerciseCount) {
      // We have enough, return them immediately
      return currentPool;
    }
    
    // We need to generate more RIGHT NOW
    console.log(`Generating exercises synchronously for card ${card.id}...`);
    
    try {
      const result = await api.generatePracticeSession({
        topic: card.topic,
        difficulty: card.difficulty,
        customInstructions: card.customInstructions,
        exerciseCount: card.exerciseCount,
        levelExamples: card.levelExamples,
        structuredExamples: card.structuredExamples
      });
      
      if (result.data) {
        // Add to pool for future use
        await this.addToPool(card.id, result.data);
        return result.data;
      }
    } catch (error) {
      console.error('Error ensuring exercises:', error);
    }
    
    // If all else fails, return what we have
    return currentPool;
  },

  // Limpiar ejercicios antiguos y mantener límites del pool
  cleanOldExercises(): void {
    const pools = this.getAllPools();
    const now = new Date();
    const cleanupThreshold = new Date(now.getTime() - (CLEANUP_DAYS * 24 * 60 * 60 * 1000));
    let totalCleaned = 0;
    
    for (const [cardId, pool] of Object.entries(pools)) {
      // Filtrar ejercicios muy antiguos que han sido usados
      const filtered = pool.exercises.filter(ex => {
        if (ex.usedAt) {
          const usedDate = new Date(ex.usedAt);
          // Mantener si fue usado recientemente o nunca ha sido usado
          return usedDate > cleanupThreshold;
        }
        return true; // Mantener ejercicios nunca usados
      });
      
      const removed = pool.exercises.length - filtered.length;
      
      // Si el pool es muy grande, eliminar los más antiguos
      if (filtered.length > MAX_POOL_SIZE) {
        // Ordenar por fecha de creación (más antiguos primero)
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
        
        // Mantener solo los más recientes
        pool.exercises = filtered.slice(-MAX_POOL_SIZE);
        totalCleaned += filtered.length - MAX_POOL_SIZE;
      } else {
        pool.exercises = filtered;
        totalCleaned += removed;
      }
    }
    
    if (totalCleaned > 0) {
      this.savePools(pools);
      console.log(`[Cache] Cleaned ${totalCleaned} old exercises`);
    }
  },

  // Obtener métricas de uso
  getUsageMetrics(cardId?: string): {
    totalExercises: number;
    unusedExercises: number;
    usedExercises: number;
    averageUsageCount: number;
    oldestUnused?: string;
    newestUsed?: string;
    poolHealth: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const pools = this.getAllPools();
    
    if (cardId) {
      // Métricas para una tarjeta específica
      const pool = pools[cardId];
      if (!pool || pool.exercises.length === 0) {
        return {
          totalExercises: 0,
          unusedExercises: 0,
          usedExercises: 0,
          averageUsageCount: 0,
          poolHealth: 'poor'
        };
      }
      
      const unused = pool.exercises.filter(ex => !ex.usedAt);
      const used = pool.exercises.filter(ex => ex.usedAt);
      const totalUsage = used.reduce((sum, ex) => sum + (ex.usageCount || 1), 0);
      const avgUsage = used.length > 0 ? totalUsage / used.length : 0;
      
      // Determinar salud del pool
      let poolHealth: 'excellent' | 'good' | 'fair' | 'poor';
      if (unused.length >= MINIMUM_POOL_SIZE && pool.exercises.length >= TARGET_POOL_SIZE) {
        poolHealth = 'excellent';
      } else if (unused.length >= MINIMUM_POOL_SIZE) {
        poolHealth = 'good';
      } else if (unused.length > 0) {
        poolHealth = 'fair';
      } else {
        poolHealth = 'poor';
      }
      
      return {
        totalExercises: pool.exercises.length,
        unusedExercises: unused.length,
        usedExercises: used.length,
        averageUsageCount: avgUsage,
        oldestUnused: unused.length > 0 ? 
          unused.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0].createdAt : 
          undefined,
        newestUsed: used.length > 0 ?
          used.sort((a, b) => new Date(b.usedAt || 0).getTime() - new Date(a.usedAt || 0).getTime())[0].usedAt :
          undefined,
        poolHealth
      };
    } else {
      // Métricas globales
      let totalExercises = 0;
      let unusedExercises = 0;
      let usedExercises = 0;
      let totalUsageCount = 0;
      
      for (const pool of Object.values(pools)) {
        totalExercises += pool.exercises.length;
        pool.exercises.forEach(ex => {
          if (ex.usedAt) {
            usedExercises++;
            totalUsageCount += ex.usageCount || 1;
          } else {
            unusedExercises++;
          }
        });
      }
      
      const avgUsage = usedExercises > 0 ? totalUsageCount / usedExercises : 0;
      const poolHealth = unusedExercises >= Object.keys(pools).length * MINIMUM_POOL_SIZE ? 'good' : 'fair';
      
      return {
        totalExercises,
        unusedExercises,
        usedExercises,
        averageUsageCount: avgUsage,
        poolHealth
      };
    }
  }
};