import { GameState, GameStats, ContinentsMode, ContinentsDifficulty } from './types';
import { profilesStorage } from '@/lib/profiles';

const STORAGE_KEY = 'continents_game_state';
const STATS_KEY = 'continents_stats';

class ContinentsStorage {
  // Guardar el juego activo
  saveGame(gameState: GameState): void {
    if (typeof window === 'undefined') return;
    
    const currentProfile = profilesStorage.getActiveProfile();
    if (!currentProfile) return;
    
    const key = `${STORAGE_KEY}_${currentProfile.id}`;
    localStorage.setItem(key, JSON.stringify(gameState));
  }
  
  // Obtener el juego activo
  getActiveGame(): GameState | null {
    if (typeof window === 'undefined') return null;
    
    const currentProfile = profilesStorage.getActiveProfile();
    if (!currentProfile) return null;
    
    const key = `${STORAGE_KEY}_${currentProfile.id}`;
    const savedGame = localStorage.getItem(key);
    
    if (!savedGame) return null;
    
    try {
      const gameState = JSON.parse(savedGame) as GameState;
      // Verificar que el juego no esté completado
      if (gameState.completed) {
        this.clearActiveGame();
        return null;
      }
      return gameState;
    } catch (error) {
      console.error('Error al cargar juego guardado:', error);
      return null;
    }
  }
  
  // Limpiar el juego activo
  clearActiveGame(): void {
    if (typeof window === 'undefined') return;
    
    const currentProfile = profilesStorage.getActiveProfile();
    if (!currentProfile) return;
    
    const key = `${STORAGE_KEY}_${currentProfile.id}`;
    localStorage.removeItem(key);
  }
  
  // Obtener estadísticas
  getStats(): GameStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }
    
    const currentProfile = profilesStorage.getActiveProfile();
    if (!currentProfile) return this.getDefaultStats();
    
    const key = `${STATS_KEY}_${currentProfile.id}`;
    const savedStats = localStorage.getItem(key);
    
    if (!savedStats) return this.getDefaultStats();
    
    try {
      return JSON.parse(savedStats) as GameStats;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      return this.getDefaultStats();
    }
  }
  
  // Guardar estadísticas
  saveStats(stats: GameStats): void {
    if (typeof window === 'undefined') return;
    
    const currentProfile = profilesStorage.getActiveProfile();
    if (!currentProfile) return;
    
    const key = `${STATS_KEY}_${currentProfile.id}`;
    localStorage.setItem(key, JSON.stringify(stats));
  }
  
  // Registrar finalización de juego
  recordGameCompletion(
    mode: ContinentsMode,
    difficulty: ContinentsDifficulty,
    timeInSeconds: number,
    hintsUsed: number,
    attempts: number,
    correctPlacements: number,
    score: number
  ): void {
    const stats = this.getStats();
    
    // Actualizar contadores generales
    stats.gamesPlayed++;
    stats.gamesCompleted++;
    stats.totalHintsUsed += hintsUsed;
    stats.totalAttempts += attempts;
    
    // Actualizar precisión
    const totalCorrect = (stats.accuracy * (stats.gamesCompleted - 1) + (correctPlacements / attempts * 100)) / stats.gamesCompleted;
    stats.accuracy = Math.round(totalCorrect);
    
    // Actualizar mejor tiempo
    const currentBest = stats.bestTimes[mode][difficulty];
    if (!currentBest || timeInSeconds < currentBest) {
      stats.bestTimes[mode][difficulty] = timeInSeconds;
    }
    
    // Actualizar tiempo promedio
    const currentAvg = stats.averageTimes[mode][difficulty];
    const gamesInMode = this.getGamesPlayedInMode(mode, difficulty);
    stats.averageTimes[mode][difficulty] = Math.round(
      (currentAvg * (gamesInMode - 1) + timeInSeconds) / gamesInMode
    );
    
    // Actualizar modo favorito
    stats.favoriteMode = this.calculateFavoriteMode(stats);
    
    // Actualizar última vez jugado
    stats.lastPlayed = new Date().toISOString();
    
    this.saveStats(stats);
  }
  
  // Obtener juegos jugados en un modo específico
  private getGamesPlayedInMode(mode: ContinentsMode, difficulty: ContinentsDifficulty): number {
    // Por simplicidad, asumimos distribución equitativa
    // En una implementación real, deberíamos trackear esto específicamente
    const stats = this.getStats();
    return Math.max(1, Math.floor(stats.gamesCompleted / 9)); // 3 modos x 3 dificultades
  }
  
  // Calcular modo favorito basado en juegos completados
  private calculateFavoriteMode(stats: GameStats): ContinentsMode {
    // Por ahora retornamos el modo con mejores tiempos promedio
    // En una implementación real, deberíamos trackear juegos por modo
    let bestMode: ContinentsMode = 'continents';
    let bestAvgTime = Infinity;
    
    const modes: ContinentsMode[] = ['continents', 'countries', 'subdivisions'];
    modes.forEach(mode => {
      const avgTime = (stats.averageTimes[mode].easy + 
                      stats.averageTimes[mode].medium + 
                      stats.averageTimes[mode].hard) / 3;
      if (avgTime > 0 && avgTime < bestAvgTime) {
        bestAvgTime = avgTime;
        bestMode = mode;
      }
    });
    
    return bestMode;
  }
  
  // Obtener estadísticas por defecto
  private getDefaultStats(): GameStats {
    return {
      gamesPlayed: 0,
      gamesCompleted: 0,
      bestTimes: {
        continents: { easy: null, medium: null, hard: null },
        countries: { easy: null, medium: null, hard: null },
        subdivisions: { easy: null, medium: null, hard: null }
      },
      averageTimes: {
        continents: { easy: 0, medium: 0, hard: 0 },
        countries: { easy: 0, medium: 0, hard: 0 },
        subdivisions: { easy: 0, medium: 0, hard: 0 }
      },
      totalHintsUsed: 0,
      totalAttempts: 0,
      accuracy: 0,
      favoriteMode: 'continents'
    };
  }
  
  // Limpiar todas las estadísticas
  clearStats(): void {
    if (typeof window === 'undefined') return;
    
    const currentProfile = profilesStorage.getActiveProfile();
    if (!currentProfile) return;
    
    const key = `${STATS_KEY}_${currentProfile.id}`;
    localStorage.removeItem(key);
  }
  
  // Exportar datos del perfil
  exportProfileData(): {
    activeGame: GameState | null;
    stats: GameStats;
  } {
    return {
      activeGame: this.getActiveGame(),
      stats: this.getStats()
    };
  }
  
  // Importar datos del perfil
  importProfileData(data: {
    activeGame?: GameState | null;
    stats?: GameStats;
  }): void {
    if (data.activeGame) {
      this.saveGame(data.activeGame);
    }
    if (data.stats) {
      this.saveStats(data.stats);
    }
  }
}

// Exportar instancia única
export const continentsStorage = new ContinentsStorage();