import { getCurrentProfileStorageKey } from './profiles';

// Define line structure matching DrawingCanvasSimple
export interface CanvasLine {
  points: number[];
  tool: 'pen' | 'eraser';
  color: string;
  strokeWidth: number;
}

export interface CanvasCapture {
  id: string;
  cardId: string;
  cardName: string;
  cardTopic: string;
  operationType: string;
  profileId: string;
  timestamp: string;
  exerciseProblem: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  attempts: number;
  lines: CanvasLine[];
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface CapturesByCard {
  [cardId: string]: CanvasCapture[];
}

const CAPTURES_STORAGE_KEY = 'waok_canvas_captures';
const MAX_CAPTURES_PER_CARD = 100;

export const canvasCapturesStorage = {
  // Get storage key for current profile
  getStorageKey(): string {
    return getCurrentProfileStorageKey(CAPTURES_STORAGE_KEY);
  },

  // Get all captures
  getAll(): CapturesByCard {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return {};
      
      return JSON.parse(stored) as CapturesByCard;
    } catch (error) {
      console.error('Error loading canvas captures:', error);
      return {};
    }
  },

  // Get captures for a specific card
  getByCard(cardId: string): CanvasCapture[] {
    const allCaptures = this.getAll();
    return allCaptures[cardId] || [];
  },

  // Get captures by operation type
  getByOperationType(operationType: string): CanvasCapture[] {
    const allCaptures = this.getAll();
    const captures: CanvasCapture[] = [];
    
    Object.values(allCaptures).forEach(cardCaptures => {
      captures.push(...cardCaptures.filter(c => c.operationType === operationType));
    });
    
    // Sort by timestamp (newest first)
    return captures.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Save a new capture
  save(capture: Omit<CanvasCapture, 'id'>): CanvasCapture {
    const newCapture: CanvasCapture = {
      ...capture,
      id: crypto.randomUUID(),
    };

    const allCaptures = this.getAll();
    
    // Initialize array for card if it doesn't exist
    if (!allCaptures[capture.cardId]) {
      allCaptures[capture.cardId] = [];
    }

    // Add new capture to the beginning
    allCaptures[capture.cardId].unshift(newCapture);

    // Trim to max captures per card (remove oldest)
    if (allCaptures[capture.cardId].length > MAX_CAPTURES_PER_CARD) {
      allCaptures[capture.cardId] = allCaptures[capture.cardId].slice(0, MAX_CAPTURES_PER_CARD);
    }

    this.saveAll(allCaptures);
    return newCapture;
  },

  // Get a specific capture
  getById(cardId: string, captureId: string): CanvasCapture | null {
    const cardCaptures = this.getByCard(cardId);
    return cardCaptures.find(c => c.id === captureId) || null;
  },

  // Delete a specific capture
  delete(cardId: string, captureId: string): boolean {
    const allCaptures = this.getAll();
    
    if (!allCaptures[cardId]) return false;
    
    const filtered = allCaptures[cardId].filter(c => c.id !== captureId);
    
    if (filtered.length === allCaptures[cardId].length) return false;
    
    allCaptures[cardId] = filtered;
    this.saveAll(allCaptures);
    return true;
  },

  // Delete all captures for a card
  deleteByCard(cardId: string): boolean {
    const allCaptures = this.getAll();
    
    if (!allCaptures[cardId]) return false;
    
    delete allCaptures[cardId];
    this.saveAll(allCaptures);
    return true;
  },

  // Save all captures
  saveAll(captures: CapturesByCard): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(captures));
    } catch (error) {
      console.error('Error saving canvas captures:', error);
    }
  },

  // Get statistics about captures
  getStats() {
    const allCaptures = this.getAll();
    const stats = {
      totalCaptures: 0,
      capturesByCard: {} as Record<string, number>,
      capturesByOperation: {} as Record<string, number>,
      correctVsIncorrect: { correct: 0, incorrect: 0 },
    };

    Object.entries(allCaptures).forEach(([cardId, captures]) => {
      stats.totalCaptures += captures.length;
      stats.capturesByCard[cardId] = captures.length;
      
      captures.forEach(capture => {
        // Count by operation
        if (!stats.capturesByOperation[capture.operationType]) {
          stats.capturesByOperation[capture.operationType] = 0;
        }
        stats.capturesByOperation[capture.operationType]++;
        
        // Count correct vs incorrect
        if (capture.isCorrect) {
          stats.correctVsIncorrect.correct++;
        } else {
          stats.correctVsIncorrect.incorrect++;
        }
      });
    });

    return stats;
  },

  // Clear all captures
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getStorageKey());
  },

  // Export captures for a card
  exportCard(cardId: string): string {
    const captures = this.getByCard(cardId);
    return JSON.stringify(captures, null, 2);
  },

  // Import captures (merge with existing)
  import(data: string): boolean {
    try {
      const imported = JSON.parse(data) as CanvasCapture[];
      const allCaptures = this.getAll();
      
      imported.forEach(capture => {
        if (!allCaptures[capture.cardId]) {
          allCaptures[capture.cardId] = [];
        }
        
        // Check if capture already exists
        const exists = allCaptures[capture.cardId].some(c => c.id === capture.id);
        if (!exists) {
          allCaptures[capture.cardId].push(capture);
        }
      });
      
      // Trim each card to max captures
      Object.keys(allCaptures).forEach(cardId => {
        if (allCaptures[cardId].length > MAX_CAPTURES_PER_CARD) {
          allCaptures[cardId] = allCaptures[cardId]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, MAX_CAPTURES_PER_CARD);
        }
      });
      
      this.saveAll(allCaptures);
      return true;
    } catch (error) {
      console.error('Error importing captures:', error);
      return false;
    }
  },
};