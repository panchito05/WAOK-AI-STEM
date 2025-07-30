import { SudokuGameState, SudokuStats, SudokuConfig, SudokuVariant, SudokuDifficulty } from './types';
import { getCurrentProfileStorageKey } from '../profiles';

const SUDOKU_STORAGE_KEY = 'waok_sudoku_games';
const SUDOKU_STATS_KEY = 'waok_sudoku_stats';
const SUDOKU_CONFIG_KEY = 'waok_sudoku_config';

// Helper to get current storage key with profile
const getStorageKey = (baseKey: string) => getCurrentProfileStorageKey(baseKey);

// Default configuration
const DEFAULT_CONFIG: SudokuConfig = {
  variant: 'classic',
  difficulty: 'easy',
  showTimer: true,
  showErrors: true,
  allowHints: true,
  autoCheck: true,
  highlightSameNumbers: true,
  soundEnabled: false,
};

// Default stats
const DEFAULT_STATS: SudokuStats = {
  gamesPlayed: 0,
  gamesCompleted: 0,
  bestTimes: {
    'classic': { easy: null, medium: null, hard: null },
    'dosdoku-4': { easy: null, medium: null, hard: null },
    'dosdoku-6': { easy: null, medium: null, hard: null },
  },
  averageTimes: {
    'classic': { easy: 0, medium: 0, hard: 0 },
    'dosdoku-4': { easy: 0, medium: 0, hard: 0 },
    'dosdoku-6': { easy: 0, medium: 0, hard: 0 },
  },
  totalHintsUsed: 0,
  totalErrors: 0,
  currentStreak: 0,
  longestStreak: 0,
};

export const sudokuStorage = {
  // Game State Management
  saveGame(gameState: SudokuGameState): void {
    try {
      const key = getStorageKey(SUDOKU_STORAGE_KEY);
      const games = this.getAllGames();
      const index = games.findIndex(g => g.id === gameState.id);
      
      if (index >= 0) {
        games[index] = gameState;
      } else {
        games.push(gameState);
      }
      
      // Keep only last 10 games
      const recentGames = games
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, 10);
      
      localStorage.setItem(key, JSON.stringify(recentGames));
    } catch (error) {
      console.error('Error saving sudoku game:', error);
    }
  },

  getGame(id: string): SudokuGameState | null {
    try {
      const games = this.getAllGames();
      return games.find(g => g.id === id) || null;
    } catch (error) {
      console.error('Error getting sudoku game:', error);
      return null;
    }
  },

  getAllGames(): SudokuGameState[] {
    try {
      const key = getStorageKey(SUDOKU_STORAGE_KEY);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all sudoku games:', error);
      return [];
    }
  },

  deleteGame(id: string): void {
    try {
      const key = getStorageKey(SUDOKU_STORAGE_KEY);
      const games = this.getAllGames().filter(g => g.id !== id);
      localStorage.setItem(key, JSON.stringify(games));
    } catch (error) {
      console.error('Error deleting sudoku game:', error);
    }
  },

  getActiveGame(): SudokuGameState | null {
    try {
      const games = this.getAllGames();
      // Find the most recent uncompleted game
      return games
        .filter(g => !g.completed)
        .sort((a, b) => b.startTime - a.startTime)[0] || null;
    } catch (error) {
      console.error('Error getting active sudoku game:', error);
      return null;
    }
  },

  // Configuration Management
  getConfig(): SudokuConfig {
    try {
      const key = getStorageKey(SUDOKU_CONFIG_KEY);
      const data = localStorage.getItem(key);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error getting sudoku config:', error);
      return DEFAULT_CONFIG;
    }
  },

  saveConfig(config: Partial<SudokuConfig>): void {
    try {
      const key = getStorageKey(SUDOKU_CONFIG_KEY);
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(key, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Error saving sudoku config:', error);
    }
  },

  // Statistics Management
  getStats(): SudokuStats {
    try {
      const key = getStorageKey(SUDOKU_STATS_KEY);
      const data = localStorage.getItem(key);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch (error) {
      console.error('Error getting sudoku stats:', error);
      return DEFAULT_STATS;
    }
  },

  updateStats(updates: Partial<SudokuStats>): void {
    try {
      const key = getStorageKey(SUDOKU_STATS_KEY);
      const currentStats = this.getStats();
      const newStats = { ...currentStats, ...updates };
      localStorage.setItem(key, JSON.stringify(newStats));
    } catch (error) {
      console.error('Error updating sudoku stats:', error);
    }
  },

  recordGameCompletion(
    variant: SudokuVariant,
    difficulty: SudokuDifficulty,
    timeInSeconds: number,
    hintsUsed: number,
    errors: number
  ): void {
    try {
      const stats = this.getStats();
      
      // Update basic counts
      stats.gamesPlayed++;
      stats.gamesCompleted++;
      stats.totalHintsUsed += hintsUsed;
      stats.totalErrors += errors;
      stats.lastPlayed = new Date().toISOString();
      
      // Update streaks
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
      
      // Update best time
      const currentBest = stats.bestTimes[variant][difficulty];
      if (!currentBest || timeInSeconds < currentBest) {
        stats.bestTimes[variant][difficulty] = timeInSeconds;
      }
      
      // Update average time
      const currentAvg = stats.averageTimes[variant][difficulty];
      const gamesOfType = this.getAllGames()
        .filter(g => g.variant === variant && g.difficulty === difficulty && g.completed)
        .length;
      
      stats.averageTimes[variant][difficulty] = 
        (currentAvg * (gamesOfType - 1) + timeInSeconds) / gamesOfType;
      
      this.updateStats(stats);
    } catch (error) {
      console.error('Error recording game completion:', error);
    }
  },

  resetStats(): void {
    try {
      const key = getStorageKey(SUDOKU_STATS_KEY);
      localStorage.setItem(key, JSON.stringify(DEFAULT_STATS));
    } catch (error) {
      console.error('Error resetting sudoku stats:', error);
    }
  },

  // Utility functions
  clearAllData(): void {
    try {
      const gameKey = getStorageKey(SUDOKU_STORAGE_KEY);
      const statsKey = getStorageKey(SUDOKU_STATS_KEY);
      const configKey = getStorageKey(SUDOKU_CONFIG_KEY);
      
      localStorage.removeItem(gameKey);
      localStorage.removeItem(statsKey);
      localStorage.removeItem(configKey);
    } catch (error) {
      console.error('Error clearing sudoku data:', error);
    }
  },

  exportData(): string {
    try {
      const data = {
        games: this.getAllGames(),
        stats: this.getStats(),
        config: this.getConfig(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting sudoku data:', error);
      return '';
    }
  },

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.games) {
        const key = getStorageKey(SUDOKU_STORAGE_KEY);
        localStorage.setItem(key, JSON.stringify(data.games));
      }
      
      if (data.stats) {
        const key = getStorageKey(SUDOKU_STATS_KEY);
        localStorage.setItem(key, JSON.stringify(data.stats));
      }
      
      if (data.config) {
        const key = getStorageKey(SUDOKU_CONFIG_KEY);
        localStorage.setItem(key, JSON.stringify(data.config));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing sudoku data:', error);
      return false;
    }
  },

  clearActiveGame(): void {
    const currentProfile = getCurrentProfile();
    if (!currentProfile) return;
    
    try {
      const key = getStorageKey(SUDOKU_STORAGE_KEY);
      const games = this.getAllGames();
      // Filtrar juegos no completados del perfil actual
      const filteredGames = games.filter(game => 
        game.id !== currentProfile.id || game.completed
      );
      localStorage.setItem(key, JSON.stringify(filteredGames));
    } catch (error) {
      console.error('Error clearing active game:', error);
    }
  },
};