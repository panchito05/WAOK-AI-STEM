import { MazeGameState, MazeStats, MazeSize, MazeDifficulty } from './types';

// Obtener perfil actual (helper)
function getCurrentProfile() {
  if (typeof window === 'undefined') return null;
  const profileData = localStorage.getItem('activeProfile');
  return profileData ? JSON.parse(profileData) : null;
}

// Obtener clave de almacenamiento para el perfil actual
function getStorageKey(baseKey: string): string {
  const profile = getCurrentProfile();
  if (!profile) return baseKey;
  return `${baseKey}_${profile.id}`;
}

// Claves de almacenamiento
const MAZE_STORAGE_KEY = 'maze_games';
const MAZE_STATS_KEY = 'maze_stats';

export const mazeStorage = {
  // Guardar juego activo
  saveGame(gameState: MazeGameState): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = getStorageKey(MAZE_STORAGE_KEY);
      localStorage.setItem(key, JSON.stringify(gameState));
    } catch (error) {
      console.error('Error saving maze game:', error);
    }
  },

  // Obtener juego activo
  getActiveGame(): MazeGameState | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const key = getStorageKey(MAZE_STORAGE_KEY);
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const game = JSON.parse(data) as MazeGameState;
      // Reconstruir Set desde array
      if (game.visitedCells && Array.isArray(game.visitedCells)) {
        game.visitedCells = new Set(game.visitedCells as any);
      }
      return game;
    } catch (error) {
      console.error('Error loading maze game:', error);
      return null;
    }
  },

  // Limpiar juego activo
  clearActiveGame(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = getStorageKey(MAZE_STORAGE_KEY);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing maze game:', error);
    }
  },

  // Obtener estadísticas
  getStats(): MazeStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }
    
    try {
      const key = getStorageKey(MAZE_STATS_KEY);
      const data = localStorage.getItem(key);
      if (!data) return this.getDefaultStats();
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading maze stats:', error);
      return this.getDefaultStats();
    }
  },

  // Estadísticas por defecto
  getDefaultStats(): MazeStats {
    return {
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalTime: 0,
      totalMoves: 0,
      bestTimeByConfig: {},
      leastMovesByConfig: {},
      perfectGames: 0,
      currentStreak: 0,
      longestStreak: 0,
      hintsUsed: 0
    };
  },

  // Actualizar estadísticas
  updateStats(updates: Partial<MazeStats>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = getStorageKey(MAZE_STATS_KEY);
      const currentStats = this.getStats();
      const newStats = { ...currentStats, ...updates };
      localStorage.setItem(key, JSON.stringify(newStats));
    } catch (error) {
      console.error('Error updating maze stats:', error);
    }
  },

  // Registrar finalización de juego
  recordGameCompletion(
    size: MazeSize,
    difficulty: MazeDifficulty,
    timeInSeconds: number,
    moves: number,
    hintsUsed: number,
    isOptimalPath: boolean
  ): void {
    try {
      const stats = this.getStats();
      const configKey = `${size}-${difficulty}`;
      
      // Actualizar contadores básicos
      stats.gamesPlayed++;
      stats.gamesCompleted++;
      stats.totalTime += timeInSeconds;
      stats.totalMoves += moves;
      stats.hintsUsed += hintsUsed;
      
      // Actualizar récords
      if (!stats.bestTimeByConfig[configKey] || timeInSeconds < stats.bestTimeByConfig[configKey]) {
        stats.bestTimeByConfig[configKey] = timeInSeconds;
      }
      
      if (!stats.leastMovesByConfig[configKey] || moves < stats.leastMovesByConfig[configKey]) {
        stats.leastMovesByConfig[configKey] = moves;
      }
      
      // Juego perfecto (sin pistas y camino óptimo)
      if (hintsUsed === 0 && isOptimalPath) {
        stats.perfectGames++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        stats.currentStreak = 0;
      }
      
      this.updateStats(stats);
    } catch (error) {
      console.error('Error recording maze completion:', error);
    }
  },

  // Obtener mejor tiempo para una configuración
  getBestTime(size: MazeSize, difficulty: MazeDifficulty): number | null {
    const stats = this.getStats();
    const configKey = `${size}-${difficulty}`;
    return stats.bestTimeByConfig[configKey] || null;
  },

  // Obtener menos movimientos para una configuración
  getLeastMoves(size: MazeSize, difficulty: MazeDifficulty): number | null {
    const stats = this.getStats();
    const configKey = `${size}-${difficulty}`;
    return stats.leastMovesByConfig[configKey] || null;
  },

  // Obtener total de juegos jugados
  getTotalGamesPlayed(): number {
    const stats = this.getStats();
    return stats.gamesPlayed;
  },

  // Serializar gameState para guardado (convertir Set a Array)
  serializeGameState(gameState: MazeGameState): any {
    return {
      ...gameState,
      visitedCells: Array.from(gameState.visitedCells)
    };
  }
};