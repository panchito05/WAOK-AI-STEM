import { getCurrentProfileStorageKey } from './profiles';

// Interfaces for practice history
export interface ExerciseDetail {
  problem: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  attempts: number;
  timeSpent: number; // in seconds
  timestamp: string;
}

export interface PracticeSession {
  id: string;
  profileId: string;
  cardId: string;
  cardName: string;
  cardTopic: string;
  operationType: 'suma' | 'resta' | 'multiplicacion' | 'division' | 'mixto' | 'otro';
  startedAt: string;
  completedAt?: string;
  totalExercises: number;
  correctAnswers: number;
  totalTimeSpent: number; // in seconds
  avgTimePerProblem: number; // in seconds
  difficulty: number;
  adaptiveDifficulty?: boolean;
  finalDifficulty?: number; // if adaptive difficulty was used
  exercises: ExerciseDetail[];
  consecutiveCorrect?: number; // for streak tracking
  hintsUsed?: number;
}

export interface DailyStats {
  date: string;
  totalSessions: number;
  totalProblems: number;
  correctProblems: number;
  totalTime: number;
  operationBreakdown: {
    [key: string]: {
      problems: number;
      correct: number;
      avgTime: number;
    };
  };
}

export interface OperationStats {
  operationType: string;
  totalExercises: number;
  correctAnswers: number;
  accuracy: number;
  avgTimePerProblem: number;
  bestStreak: number;
  lastPracticed: string;
  difficultyProgress: number[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  type: 'milestone' | 'streak' | 'speed' | 'accuracy' | 'special';
}

const HISTORY_STORAGE_KEY = 'mathminds_practice_history';
const ACHIEVEMENTS_STORAGE_KEY = 'mathminds_achievements';

export const practiceHistoryStorage = {
  // Get storage key for current profile
  getStorageKey(): string {
    return getCurrentProfileStorageKey(HISTORY_STORAGE_KEY);
  },

  // Get all practice sessions
  getAll(): PracticeSession[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];
      
      return JSON.parse(stored) as PracticeSession[];
    } catch (error) {
      console.error('Error loading practice history:', error);
      return [];
    }
  },

  // Get sessions by date range
  getByDateRange(startDate: Date, endDate: Date): PracticeSession[] {
    const sessions = this.getAll();
    return sessions.filter(session => {
      const sessionDate = new Date(session.startedAt);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  },

  // Get sessions by card
  getByCard(cardId: string): PracticeSession[] {
    const sessions = this.getAll();
    return sessions.filter(session => session.cardId === cardId);
  },

  // Get recent sessions
  getRecent(limit: number = 10): PracticeSession[] {
    const sessions = this.getAll();
    return sessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  },

  // Save a new practice session
  save(session: Omit<PracticeSession, 'id'>): PracticeSession {
    const newSession: PracticeSession = {
      ...session,
      id: crypto.randomUUID(),
    };

    const sessions = this.getAll();
    sessions.push(newSession);
    this.saveAll(sessions);

    // Check for achievements
    this.checkAchievements(newSession);

    return newSession;
  },

  // Update an existing session
  update(id: string, updates: Partial<PracticeSession>): PracticeSession | null {
    const sessions = this.getAll();
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    sessions[index] = { ...sessions[index], ...updates };
    this.saveAll(sessions);
    
    return sessions[index];
  },

  // Delete a session
  delete(id: string): boolean {
    const sessions = this.getAll();
    const filtered = sessions.filter(s => s.id !== id);
    
    if (filtered.length === sessions.length) return false;
    
    this.saveAll(filtered);
    return true;
  },

  // Save all sessions
  saveAll(sessions: PracticeSession[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving practice history:', error);
    }
  },

  // Get daily stats for the last N days
  getDailyStats(days: number = 7): DailyStats[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const sessions = this.getByDateRange(startDate, endDate);
    const dailyStatsMap = new Map<string, DailyStats>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStatsMap.set(dateStr, {
        date: dateStr,
        totalSessions: 0,
        totalProblems: 0,
        correctProblems: 0,
        totalTime: 0,
        operationBreakdown: {},
      });
    }

    // Aggregate session data
    sessions.forEach(session => {
      const dateStr = new Date(session.startedAt).toISOString().split('T')[0];
      const stats = dailyStatsMap.get(dateStr);
      
      if (stats) {
        stats.totalSessions++;
        stats.totalProblems += session.totalExercises;
        stats.correctProblems += session.correctAnswers;
        stats.totalTime += session.totalTimeSpent;

        // Update operation breakdown
        const op = session.operationType;
        if (!stats.operationBreakdown[op]) {
          stats.operationBreakdown[op] = {
            problems: 0,
            correct: 0,
            avgTime: 0,
          };
        }
        
        const opStats = stats.operationBreakdown[op];
        const prevTotal = opStats.problems;
        opStats.problems += session.totalExercises;
        opStats.correct += session.correctAnswers;
        
        // Calculate running average for time
        opStats.avgTime = 
          (opStats.avgTime * prevTotal + session.avgTimePerProblem * session.totalExercises) / 
          opStats.problems;
      }
    });

    return Array.from(dailyStatsMap.values());
  },

  // Get stats by operation type
  getOperationStats(): OperationStats[] {
    const sessions = this.getAll();
    const statsMap = new Map<string, OperationStats>();

    sessions.forEach(session => {
      const op = session.operationType;
      
      if (!statsMap.has(op)) {
        statsMap.set(op, {
          operationType: op,
          totalExercises: 0,
          correctAnswers: 0,
          accuracy: 0,
          avgTimePerProblem: 0,
          bestStreak: 0,
          lastPracticed: session.startedAt,
          difficultyProgress: [],
        });
      }

      const stats = statsMap.get(op)!;
      const prevTotal = stats.totalExercises;
      
      stats.totalExercises += session.totalExercises;
      stats.correctAnswers += session.correctAnswers;
      stats.accuracy = (stats.correctAnswers / stats.totalExercises) * 100;
      
      // Calculate running average for time
      stats.avgTimePerProblem = 
        (stats.avgTimePerProblem * prevTotal + session.avgTimePerProblem * session.totalExercises) / 
        stats.totalExercises;
      
      // Update best streak
      if (session.consecutiveCorrect && session.consecutiveCorrect > stats.bestStreak) {
        stats.bestStreak = session.consecutiveCorrect;
      }
      
      // Update last practiced
      if (new Date(session.startedAt) > new Date(stats.lastPracticed)) {
        stats.lastPracticed = session.startedAt;
      }
      
      // Track difficulty progress
      if (session.difficulty) {
        stats.difficultyProgress.push(session.difficulty);
      }
    });

    return Array.from(statsMap.values());
  },

  // Get total stats
  getTotalStats() {
    const sessions = this.getAll();
    const totalProblems = sessions.reduce((sum, s) => sum + s.totalExercises, 0);
    const correctProblems = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.totalTimeSpent, 0);
    const bestStreak = Math.max(...sessions.map(s => s.consecutiveCorrect || 0), 0);

    return {
      totalSessions: sessions.length,
      totalProblems,
      correctProblems,
      accuracy: totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0,
      totalTime,
      avgTimePerProblem: totalProblems > 0 ? totalTime / totalProblems : 0,
      bestStreak,
      currentStreak: this.getCurrentStreak(),
    };
  },

  // Calculate current practice streak
  getCurrentStreak(): number {
    const sessions = this.getAll();
    if (sessions.length === 0) return 0;

    // Sort sessions by date (newest first)
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) { // Check up to a year
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasSession = sortedSessions.some(s => 
        s.startedAt.startsWith(dateStr)
      );

      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        // If no session today, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    return streak;
  },

  // Check and unlock achievements
  checkAchievements(newSession: PracticeSession): Achievement[] {
    const unlockedAchievements: Achievement[] = [];
    const allSessions = this.getAll();
    const totalStats = this.getTotalStats();

    // Define achievement criteria
    const achievementChecks = [
      {
        id: 'first-session',
        check: () => allSessions.length === 1,
        achievement: {
          name: '¡Primera Sesión!',
          description: 'Completaste tu primera sesión de práctica',
          icon: '🌟',
          type: 'milestone' as const,
        },
      },
      {
        id: 'perfect-session',
        check: () => newSession.correctAnswers === newSession.totalExercises && newSession.totalExercises >= 5,
        achievement: {
          name: 'Sesión Perfecta',
          description: 'Respondiste todo correctamente en una sesión',
          icon: '💯',
          type: 'accuracy' as const,
        },
      },
      {
        id: 'speed-demon',
        check: () => newSession.avgTimePerProblem < 5 && newSession.totalExercises >= 10,
        achievement: {
          name: 'Rayo Veloz',
          description: 'Completaste 10 ejercicios con menos de 5 segundos por problema',
          icon: '⚡',
          type: 'speed' as const,
        },
      },
      {
        id: 'week-streak',
        check: () => totalStats.currentStreak >= 7,
        achievement: {
          name: 'Semana Completa',
          description: 'Practicaste 7 días seguidos',
          icon: '🔥',
          type: 'streak' as const,
        },
      },
      {
        id: '100-problems',
        check: () => totalStats.totalProblems >= 100,
        achievement: {
          name: 'Centenario',
          description: 'Resolviste 100 problemas en total',
          icon: '🎯',
          type: 'milestone' as const,
        },
      },
    ];

    // Get existing achievements
    const existingAchievements = this.getAchievements();

    // Check each achievement
    achievementChecks.forEach(({ id, check, achievement }) => {
      if (check() && !existingAchievements.find(a => a.id === id)) {
        const newAchievement: Achievement = {
          id,
          ...achievement,
          unlockedAt: new Date().toISOString(),
        };
        unlockedAchievements.push(newAchievement);
      }
    });

    // Save new achievements
    if (unlockedAchievements.length > 0) {
      this.saveAchievements([...existingAchievements, ...unlockedAchievements]);
    }

    return unlockedAchievements;
  },

  // Get achievements
  getAchievements(): Achievement[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const key = getCurrentProfileStorageKey(ACHIEVEMENTS_STORAGE_KEY);
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      return JSON.parse(stored) as Achievement[];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  },

  // Save achievements
  saveAchievements(achievements: Achievement[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = getCurrentProfileStorageKey(ACHIEVEMENTS_STORAGE_KEY);
      localStorage.setItem(key, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  },

  // Export data
  exportData(format: 'json' | 'csv' = 'json'): string {
    const sessions = this.getAll();
    
    if (format === 'json') {
      return JSON.stringify(sessions, null, 2);
    }
    
    // CSV format
    const headers = [
      'Fecha',
      'Tarjeta',
      'Operación',
      'Total Ejercicios',
      'Respuestas Correctas',
      'Precisión %',
      'Tiempo Total (min)',
      'Tiempo Promedio (seg)',
      'Dificultad',
    ];
    
    const rows = sessions.map(s => [
      new Date(s.startedAt).toLocaleString(),
      s.cardName,
      s.operationType,
      s.totalExercises,
      s.correctAnswers,
      ((s.correctAnswers / s.totalExercises) * 100).toFixed(1),
      (s.totalTimeSpent / 60).toFixed(1),
      s.avgTimePerProblem.toFixed(1),
      s.difficulty,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    return csvContent;
  },

  // Clear all history (with confirmation)
  clearAll(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.getStorageKey());
    localStorage.removeItem(getCurrentProfileStorageKey(ACHIEVEMENTS_STORAGE_KEY));
  },
};