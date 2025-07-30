// Tipos de celdas del laberinto
export type MazeCellType = 'empty' | 'wall' | 'start' | 'end' | 'path';

// Tamaños disponibles
export type MazeSize = 'small' | 'medium' | 'large';

// Niveles de dificultad
export type MazeDifficulty = 'easy' | 'medium' | 'hard';

// Dirección de movimiento
export type Direction = 'up' | 'down' | 'left' | 'right';

// Celda del laberinto
export interface MazeCell {
  row: number;
  col: number;
  type: MazeCellType;
  visited: boolean; // Para marcar celdas visitadas por el jugador
  isPath?: boolean; // Para mostrar la solución
  isHint?: boolean; // Para mostrar pistas temporales
}

// Estado del juego
export interface MazeGameState {
  id: string;
  maze: MazeCell[][];
  size: MazeSize;
  difficulty: MazeDifficulty;
  playerPosition: { row: number; col: number };
  startPosition: { row: number; col: number };
  endPosition: { row: number; col: number };
  moveCount: number;
  hintsUsed: number;
  startTime: number;
  endTime?: number;
  isPaused: boolean;
  pausedTime: number;
  completed: boolean;
  solution: { row: number; col: number }[]; // Camino óptimo
  visitedCells: Set<string>; // Formato: "row,col"
  showingSolution: boolean;
  viewRadius?: number; // Radio de visión en modo difícil
  config: MazeConfig;
}

// Configuración del laberinto
export interface MazeConfig {
  size: MazeSize;
  difficulty: MazeDifficulty;
  showTimer: boolean;
  showMoveCount: boolean;
  showMinimap: boolean;
  allowHints: boolean;
  maxHints: number;
  animateMovement: boolean;
  showVisitedPath: boolean;
  fogOfWar: boolean; // Vista limitada en modo difícil
}

// Configuración de tamaños
export const MAZE_SIZES: Record<MazeSize, { gridSize: number; name: string; description: string }> = {
  small: { gridSize: 10, name: 'Pequeño', description: 'Perfecto para principiantes' },
  medium: { gridSize: 15, name: 'Mediano', description: 'Desafío equilibrado' },
  large: { gridSize: 45, name: 'Grande', description: 'Laberinto masivo para expertos' }
};

// Configuración de dificultades
export const MAZE_DIFFICULTIES: Record<MazeDifficulty, { 
  name: string; 
  description: string; 
  viewRadius?: number;
  pathComplexity: number; // 0-1, mayor = más complejo
}> = {
  easy: { 
    name: 'Fácil', 
    description: 'Pocos callejones sin salida',
    pathComplexity: 0.3
  },
  medium: { 
    name: 'Intermedio', 
    description: 'Varios caminos posibles',
    pathComplexity: 0.6
  },
  hard: { 
    name: 'Difícil', 
    description: 'Laberinto muy complejo con muchos caminos falsos',
    pathComplexity: 0.95
  }
};

// Estadísticas del laberinto
export interface MazeStats {
  gamesPlayed: number;
  gamesCompleted: number;
  totalTime: number;
  totalMoves: number;
  bestTimeByConfig: Record<string, number>; // "size-difficulty" -> seconds
  leastMovesByConfig: Record<string, number>; // "size-difficulty" -> moves
  perfectGames: number; // Sin pistas, camino óptimo
  currentStreak: number;
  longestStreak: number;
  hintsUsed: number;
}

// Movimiento del jugador
export interface PlayerMove {
  from: { row: number; col: number };
  to: { row: number; col: number };
  timestamp: number;
  moveNumber: number;
}

// Configuración por defecto
export const DEFAULT_MAZE_CONFIG: MazeConfig = {
  size: 'small',
  difficulty: 'easy',
  showTimer: true,
  showMoveCount: true,
  showMinimap: true,
  allowHints: true,
  maxHints: 3,
  animateMovement: true,
  showVisitedPath: true,
  fogOfWar: false
};