export type Player = 'X' | 'O' | null;
export type BoardSize = 3 | 4 | 5;
export type GameMode = 'pvp' | 'pvc'; // Player vs Player, Player vs Computer
export type AIDifficulty = 'easy' | 'hard';
export type GameStatus = 'playing' | 'win' | 'draw' | 'paused';

export interface TicTacToeConfig {
  boardSize: BoardSize;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  firstPlayer: 'X' | 'O' | 'random';
  timerEnabled: boolean;
  timerSeconds: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface Cell {
  row: number;
  col: number;
  value: Player;
}

export interface Move {
  row: number;
  col: number;
  player: Player;
  timestamp: number;
}

export interface TicTacToeGameState {
  id: string;
  board: Player[][];
  boardSize: BoardSize;
  currentPlayer: Player;
  gameMode: GameMode;
  gameStatus: GameStatus;
  winner: Player;
  winningLine: Cell[] | null;
  moves: Move[];
  startTime: number;
  endTime?: number;
  pausedTime: number;
  isPaused: boolean;
  config: TicTacToeConfig;
  turnStartTime?: number;
  selectedCell?: { row: number; col: number };
}

export interface TicTacToeStats {
  gamesPlayed: number;
  wins: {
    X: number;
    O: number;
  };
  draws: number;
  vsComputerWins: number;
  vsComputerLosses: number;
  vsHumanWins: number;
  vsHumanLosses: number;
  fastestWin: number | null;
  averageGameTime: number;
  totalPlayTime: number;
  winStreak: number;
  bestWinStreak: number;
  favoriteOpponent: 'human' | 'computer' | null;
  lastPlayed?: string;
}

export interface GameResult {
  winner: Player;
  winningLine: Cell[] | null;
  gameTime: number;
  moves: number;
  gameMode: GameMode;
  boardSize: BoardSize;
  aiDifficulty?: AIDifficulty;
}