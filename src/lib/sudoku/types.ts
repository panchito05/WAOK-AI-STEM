export type SudokuVariant = 'classic' | 'dosdoku-4' | 'dosdoku-6';
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export interface SudokuConfig {
  variant: SudokuVariant;
  difficulty: SudokuDifficulty;
  showTimer: boolean;
  showErrors: boolean;
  allowHints: boolean;
  autoCheck: boolean; // Verificación automática de errores
  highlightSameNumbers: boolean; // Resaltar números iguales al seleccionado
  soundEnabled: boolean; // Efectos de sonido
}

export interface SudokuCell {
  value: number | null;
  isPreFilled: boolean; // Números iniciales que no se pueden cambiar
  isValid: boolean; // Si el valor actual es válido
  notes: number[]; // Notas/candidatos para la celda
  row: number;
  col: number;
}

export interface Move {
  row: number;
  col: number;
  previousValue: number | null;
  newValue: number | null;
  timestamp: number;
  isNote?: boolean; // Si fue una modificación de nota
}

export interface SudokuGameState {
  id: string;
  board: SudokuCell[][];
  variant: SudokuVariant;
  difficulty: SudokuDifficulty;
  startTime: number;
  endTime?: number;
  pausedTime: number; // Tiempo total pausado
  isPaused: boolean;
  moveHistory: Move[];
  hintsUsed: number;
  errorsCount: number;
  completed: boolean;
  solution: number[][]; // Tablero con la solución completa
  selectedCell?: { row: number; col: number };
  config: SudokuConfig;
}

export interface SudokuStats {
  gamesPlayed: number;
  gamesCompleted: number;
  bestTimes: {
    [key in SudokuVariant]: {
      [key in SudokuDifficulty]: number | null;
    };
  };
  averageTimes: {
    [key in SudokuVariant]: {
      [key in SudokuDifficulty]: number;
    };
  };
  totalHintsUsed: number;
  totalErrors: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayed?: string;
}

// Configuración de las variantes
export const SUDOKU_VARIANTS = {
  'classic': {
    size: 9,
    boxSize: 3,
    name: 'Sudoku Clásico',
    description: 'El sudoku tradicional de 9x9',
    icon: 'Grid3x3',
    color: '#3b82f6', // blue-500
  },
  'dosdoku-4': {
    size: 4,
    boxSize: 2,
    name: 'Dosdoku Fácil',
    description: 'Perfecto para principiantes (4x4)',
    icon: 'Grid2x2',
    color: '#10b981', // green-500
  },
  'dosdoku-6': {
    size: 6,
    boxSize: 2, // 2x3 boxes
    name: 'Dosdoku Intermedio',
    description: 'Desafío moderado (6x6)',
    icon: 'LayoutGrid',
    color: '#f59e0b', // amber-500
  }
} as const;

// Número de celdas a remover según dificultad
export const CELLS_TO_REMOVE = {
  'classic': {
    'easy': 30,
    'medium': 40,
    'hard': 50,
  },
  'dosdoku-4': {
    'easy': 4,
    'medium': 6,
    'hard': 8,
  },
  'dosdoku-6': {
    'easy': 10,
    'medium': 15,
    'hard': 20,
  }
} as const;