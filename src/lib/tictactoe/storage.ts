import { TicTacToeStats, GameResult, Player } from './types';

const STORAGE_KEY = 'tictactoe_stats';

class TicTacToeStorage {
  private getDefaultStats(): TicTacToeStats {
    return {
      gamesPlayed: 0,
      wins: { X: 0, O: 0 },
      draws: 0,
      vsComputerWins: 0,
      vsComputerLosses: 0,
      vsHumanWins: 0,
      vsHumanLosses: 0,
      fastestWin: null,
      averageGameTime: 0,
      totalPlayTime: 0,
      winStreak: 0,
      bestWinStreak: 0,
      favoriteOpponent: null,
      lastPlayed: new Date().toISOString()
    };
  }

  getStats(): TicTacToeStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...this.getDefaultStats(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading TicTacToe stats:', error);
    }
    return this.getDefaultStats();
  }

  saveStats(stats: TicTacToeStats): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving TicTacToe stats:', error);
    }
  }

  recordGameResult(result: GameResult, playerSymbol: Player): void {
    const stats = this.getStats();
    
    stats.gamesPlayed++;
    stats.totalPlayTime += result.gameTime;
    stats.averageGameTime = Math.round(stats.totalPlayTime / stats.gamesPlayed);
    stats.lastPlayed = new Date().toISOString();

    // Registrar resultado
    if (result.winner === null) {
      stats.draws++;
      stats.winStreak = 0;
    } else {
      // Actualizar victorias por símbolo
      if (result.winner === 'X') stats.wins.X++;
      else if (result.winner === 'O') stats.wins.O++;

      // Actualizar estadísticas vs computadora o humano
      if (result.gameMode === 'pvc') {
        if (result.winner === playerSymbol) {
          stats.vsComputerWins++;
          stats.winStreak++;
        } else {
          stats.vsComputerLosses++;
          stats.winStreak = 0;
        }
      } else {
        // En PvP, contar como victoria si el jugador X gana (por convención)
        if (result.winner === 'X') {
          stats.vsHumanWins++;
          stats.winStreak++;
        } else {
          stats.vsHumanLosses++;
          stats.winStreak = 0;
        }
      }

      // Actualizar mejor racha
      if (stats.winStreak > stats.bestWinStreak) {
        stats.bestWinStreak = stats.winStreak;
      }

      // Actualizar victoria más rápida
      if (result.winner === playerSymbol) {
        if (stats.fastestWin === null || result.gameTime < stats.fastestWin) {
          stats.fastestWin = result.gameTime;
        }
      }
    }

    // Determinar oponente favorito
    const computerGames = stats.vsComputerWins + stats.vsComputerLosses;
    const humanGames = stats.vsHumanWins + stats.vsHumanLosses;
    
    if (computerGames > humanGames) {
      stats.favoriteOpponent = 'computer';
    } else if (humanGames > computerGames) {
      stats.favoriteOpponent = 'human';
    } else {
      stats.favoriteOpponent = null;
    }

    this.saveStats(stats);
  }

  resetStats(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting TicTacToe stats:', error);
    }
  }

  getWinRate(): number {
    const stats = this.getStats();
    const totalGames = stats.gamesPlayed;
    if (totalGames === 0) return 0;
    
    const totalWins = stats.wins.X + stats.wins.O;
    return Math.round((totalWins / totalGames) * 100);
  }

  getVsComputerWinRate(): number {
    const stats = this.getStats();
    const vsComputerGames = stats.vsComputerWins + stats.vsComputerLosses;
    if (vsComputerGames === 0) return 0;
    
    return Math.round((stats.vsComputerWins / vsComputerGames) * 100);
  }

  getVsHumanWinRate(): number {
    const stats = this.getStats();
    const vsHumanGames = stats.vsHumanWins + stats.vsHumanLosses;
    if (vsHumanGames === 0) return 0;
    
    return Math.round((stats.vsHumanWins / vsHumanGames) * 100);
  }
}

export const tictactoeStorage = new TicTacToeStorage();