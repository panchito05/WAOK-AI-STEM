// Estructura para ejemplos con formato completo
export interface StructuredExample {
  problem: string;
  solution: string;
  explanation: string;
}

export interface PracticeCard {
  id: string;
  name: string;
  topic: string;
  difficulty: number; // 1-10
  customInstructions: string;
  exerciseCount: number;
  attemptsPerExercise: number;
  autoCompensation: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  levelExamples?: {
    [level: number]: string[]; // Nivel 1-10 con array de ejemplos - Mantener para compatibilidad
  };
  structuredExamples?: {
    [level: number]: StructuredExample[]; // Nueva estructura con formato completo
  };
}

const STORAGE_KEY = 'mathminds_practice_cards';

// Función para migrar ejemplos de string[] a StructuredExample[]
function migrateExamples(levelExamples: { [level: number]: string[] }): { [level: number]: StructuredExample[] } {
  const migrated: { [level: number]: StructuredExample[] } = {};
  
  for (const [level, examples] of Object.entries(levelExamples)) {
    migrated[Number(level)] = examples.map(example => {
      // Intentar parsear diferentes formatos de ejemplos legacy
      const matches = example.match(/^(.+?)\s*(?:\(Respuesta:\s*(.+?)\))?$/);
      
      if (matches) {
        const problem = matches[1].trim();
        const solution = matches[2]?.trim() || '';
        
        // Generar una explicación básica si no hay una
        let explanation = `Para resolver ${problem}`;
        if (solution) {
          explanation += `, la respuesta es ${solution}`;
        }
        
        return {
          problem,
          solution: solution || 'Ver solución',
          explanation
        };
      }
      
      // Fallback para formatos no reconocidos
      return {
        problem: example,
        solution: 'Ver solución',
        explanation: 'Ejemplo migrado del formato anterior'
      };
    });
  }
  
  return migrated;
}

export const cardStorage = {
  // Get all cards
  getAll(): PracticeCard[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const cards = JSON.parse(stored) as PracticeCard[];
      
      // Migrar ejemplos si es necesario
      const migratedCards = cards.map(card => {
        if (card.levelExamples && !card.structuredExamples) {
          return {
            ...card,
            structuredExamples: migrateExamples(card.levelExamples)
          };
        }
        return card;
      });
      
      // Sort by favorites first, then by updated date
      return migratedCards.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    } catch (error) {
      console.error('Error loading cards:', error);
      return [];
    }
  },

  // Get single card
  getById(id: string): PracticeCard | null {
    const cards = this.getAll();
    return cards.find(card => card.id === id) || null;
  },

  // Save a new card
  create(card: Omit<PracticeCard, 'id' | 'createdAt' | 'updatedAt'>): PracticeCard {
    const newCard: PracticeCard = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const cards = this.getAll();
    cards.push(newCard);
    this.saveAll(cards);
    
    return newCard;
  },

  // Update existing card
  update(id: string, updates: Partial<Omit<PracticeCard, 'id' | 'createdAt'>>): PracticeCard | null {
    const cards = this.getAll();
    const index = cards.findIndex(card => card.id === id);
    
    if (index === -1) return null;
    
    cards[index] = {
      ...cards[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveAll(cards);
    return cards[index];
  },

  // Delete a card
  delete(id: string): boolean {
    const cards = this.getAll();
    const filtered = cards.filter(card => card.id !== id);
    
    if (filtered.length === cards.length) return false;
    
    this.saveAll(filtered);
    return true;
  },

  // Toggle favorite status
  toggleFavorite(id: string): PracticeCard | null {
    const card = this.getById(id);
    if (!card) return null;
    
    return this.update(id, { isFavorite: !card.isFavorite });
  },

  // Save all cards to localStorage
  saveAll(cards: PracticeCard[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  },

  // Clear all cards (useful for testing)
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Default card templates
export const DEFAULT_CARDS: Omit<PracticeCard, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Suma Básica',
    topic: 'addition',
    difficulty: 2,
    customInstructions: '',
    exerciseCount: 10,
    attemptsPerExercise: 3,
    autoCompensation: false,
    isFavorite: false,
  },
  {
    name: 'Multiplicación Intermedia',
    topic: 'multiplication',
    difficulty: 5,
    customInstructions: 'Incluir tablas del 6 al 9',
    exerciseCount: 15,
    attemptsPerExercise: 2,
    autoCompensation: true,
    isFavorite: false,
  },
  {
    name: 'Fracciones',
    topic: 'fracciones',
    difficulty: 7,
    customInstructions: 'Solo fracciones propias',
    exerciseCount: 10,
    attemptsPerExercise: 3,
    autoCompensation: true,
    isFavorite: true,
  },
];