// Estructura para ejemplos con formato completo
export interface StructuredExample {
  problem: string;
  solution: string;
  explanation: string;
}

import { migrateAllCards } from './migrate-cards';

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
  color?: string; // Color del header
  icon?: string; // Nombre del icono de lucide-react
  levelExamples?: {
    [level: number]: string[]; // Nivel 1-10 con array de ejemplos - Mantener para compatibilidad
  };
  structuredExamples?: {
    [level: number]: StructuredExample[]; // Nueva estructura con formato completo
  };
}

const STORAGE_KEY = 'mathminds_practice_cards';

// Función para calcular la solución de un problema matemático simple
function calculateSolution(problem: string): string {
  try {
    // Intentar extraer números y operación de problemas simples
    // Patterns como: "45 + 90 = ?", "35 + 105 = ?", etc.
    const patterns = [
      /^(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      /^(\d+(?:\.\d+)?)\s*[×x\*]\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      /^(\d+(?:\.\d+)?)\s*[÷/]\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
    ];
    
    for (const pattern of patterns) {
      const match = problem.match(pattern);
      if (match) {
        const num1 = parseFloat(match[1]);
        const num2 = parseFloat(match[2]);
        let result: number;
        
        if (problem.includes('+')) {
          result = num1 + num2;
        } else if (problem.includes('-')) {
          result = num1 - num2;
        } else if (problem.match(/[×x\*]/)) {
          result = num1 * num2;
        } else if (problem.match(/[÷/]/)) {
          result = num1 / num2;
        } else {
          return ''; // No se pudo determinar la operación
        }
        
        // Retornar como entero si no tiene decimales
        return result % 1 === 0 ? result.toString() : result.toFixed(2);
      }
    }
  } catch (error) {
    console.error('Error calculating solution:', error);
  }
  
  return ''; // No se pudo calcular
}

// Función para migrar ejemplos de string[] a StructuredExample[]
function migrateExamples(levelExamples: { [level: number]: string[] }): { [level: number]: StructuredExample[] } {
  const migrated: { [level: number]: StructuredExample[] } = {};
  
  for (const [level, examples] of Object.entries(levelExamples)) {
    migrated[Number(level)] = examples.map(example => {
      // Intentar parsear diferentes formatos de ejemplos legacy
      const matches = example.match(/^(.+?)\s*(?:\(Respuesta:\s*(.+?)\))?$/);
      
      if (matches) {
        const problem = matches[1].trim();
        let solution = matches[2]?.trim() || '';
        
        // Si no hay solución o es "Ver solución", intentar calcularla
        if (!solution || solution === 'Ver solución') {
          solution = calculateSolution(problem);
        }
        
        // Si aún no hay solución, intentar extraer números del problema
        if (!solution) {
          const numbers = problem.match(/\d+/g);
          if (numbers && numbers.length >= 2) {
            const num1 = parseInt(numbers[0]);
            const num2 = parseInt(numbers[1]);
            // Asumir suma si no se puede determinar la operación
            solution = (num1 + num2).toString();
          }
        }
        
        // Generar una explicación básica
        let explanation = `Para resolver ${problem}`;
        if (solution) {
          explanation = `Para resolver ${problem}, ${problem.includes('+') ? 'sumamos' : 
                        problem.includes('-') ? 'restamos' : 
                        problem.match(/[×x\*]/) ? 'multiplicamos' : 
                        problem.match(/[÷/]/) ? 'dividimos' : 'calculamos'}: ${problem.replace('= ?', `= ${solution}`)}`;
        }
        
        return {
          problem,
          solution: solution || 'Calcular',
          explanation
        };
      }
      
      // Fallback para formatos no reconocidos
      const calculatedSolution = calculateSolution(example);
      return {
        problem: example,
        solution: calculatedSolution || 'Calcular',
        explanation: calculatedSolution ? 
          `Para resolver ${example}, obtenemos ${calculatedSolution}` : 
          'Ejemplo migrado del formato anterior'
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
      let migratedCards = cards.map(card => {
        if (card.levelExamples && !card.structuredExamples) {
          return {
            ...card,
            structuredExamples: migrateExamples(card.levelExamples)
          };
        }
        return card;
      });
      
      // Migrar tarjetas con "Ver solución" a soluciones reales
      const fullyMigratedCards = migrateAllCards(migratedCards);
      
      // Si hubo cambios, guardar las tarjetas actualizadas
      const hasChanges = fullyMigratedCards.some((migrated, index) => 
        migrated.updatedAt !== migratedCards[index].updatedAt
      );
      
      if (hasChanges) {
        this.saveAll(fullyMigratedCards);
        migratedCards = fullyMigratedCards;
      }
      
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