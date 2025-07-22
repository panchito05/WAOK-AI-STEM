import { PracticeSession, DailyStats, OperationStats } from './practice-history';

export interface WeeklyProgress {
  week: string;
  totalProblems: number;
  accuracy: number;
  improvement: number; // percentage change from previous week
}

export interface MonthlyTrend {
  month: string;
  avgProblemsPerDay: number;
  avgAccuracy: number;
  totalTime: number;
  mostPracticedOperation: string;
}

export interface ProgressAnalysis {
  isImproving: boolean;
  speedTrend: 'increasing' | 'decreasing' | 'stable';
  accuracyTrend: 'increasing' | 'decreasing' | 'stable';
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
}

export const progressStats = {
  // Calculate weekly progress
  getWeeklyProgress(sessions: PracticeSession[], weeks: number = 4): WeeklyProgress[] {
    const weeklyData: WeeklyProgress[] = [];
    const now = new Date();
    
    for (let i = 0; i < weeks; i++) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      
      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.startedAt);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      const totalProblems = weekSessions.reduce((sum, s) => sum + s.totalExercises, 0);
      const correctProblems = weekSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0;
      
      // Calculate improvement from previous week
      let improvement = 0;
      if (i < weeks - 1 && weeklyData.length > 0) {
        const prevWeek = weeklyData[weeklyData.length - 1];
        if (prevWeek.accuracy > 0) {
          improvement = ((accuracy - prevWeek.accuracy) / prevWeek.accuracy) * 100;
        }
      }
      
      weeklyData.push({
        week: `Semana ${i + 1}`,
        totalProblems,
        accuracy,
        improvement,
      });
    }
    
    return weeklyData.reverse();
  },

  // Calculate monthly trends
  getMonthlyTrends(sessions: PracticeSession[], months: number = 3): MonthlyTrend[] {
    const monthlyData: MonthlyTrend[] = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthSessions = sessions.filter(s => {
        const sessionDate = new Date(s.startedAt);
        return sessionDate >= monthStart && sessionDate <= monthEnd;
      });
      
      const totalProblems = monthSessions.reduce((sum, s) => sum + s.totalExercises, 0);
      const correctProblems = monthSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const totalTime = monthSessions.reduce((sum, s) => sum + s.totalTimeSpent, 0);
      const daysInMonth = monthEnd.getDate();
      
      // Find most practiced operation
      const operationCounts = new Map<string, number>();
      monthSessions.forEach(s => {
        operationCounts.set(s.operationType, (operationCounts.get(s.operationType) || 0) + s.totalExercises);
      });
      
      const mostPracticedOperation = Array.from(operationCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'ninguna';
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'long' }),
        avgProblemsPerDay: totalProblems / daysInMonth,
        avgAccuracy: totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0,
        totalTime,
        mostPracticedOperation,
      });
    }
    
    return monthlyData.reverse();
  },

  // Analyze progress and provide insights
  analyzeProgress(sessions: PracticeSession[]): ProgressAnalysis {
    if (sessions.length < 5) {
      return {
        isImproving: true,
        speedTrend: 'stable',
        accuracyTrend: 'stable',
        strengths: ['¡Estás empezando muy bien!'],
        areasToImprove: ['Practica más para ver tu progreso'],
        recommendations: ['Intenta practicar al menos 10 minutos al día'],
      };
    }

    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

    // Get recent vs older sessions
    const midPoint = Math.floor(sortedSessions.length / 2);
    const olderSessions = sortedSessions.slice(0, midPoint);
    const recentSessions = sortedSessions.slice(midPoint);

    // Calculate metrics for comparison
    const calculateMetrics = (sessionList: PracticeSession[]) => {
      const totalProblems = sessionList.reduce((sum, s) => sum + s.totalExercises, 0);
      const correctProblems = sessionList.reduce((sum, s) => sum + s.correctAnswers, 0);
      const avgTime = sessionList.reduce((sum, s) => sum + s.avgTimePerProblem, 0) / sessionList.length;
      const accuracy = totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0;
      
      return { accuracy, avgTime, totalProblems };
    };

    const olderMetrics = calculateMetrics(olderSessions);
    const recentMetrics = calculateMetrics(recentSessions);

    // Determine trends
    const accuracyDiff = recentMetrics.accuracy - olderMetrics.accuracy;
    const speedDiff = recentMetrics.avgTime - olderMetrics.avgTime;

    const accuracyTrend = accuracyDiff > 5 ? 'increasing' : 
                         accuracyDiff < -5 ? 'decreasing' : 'stable';
    const speedTrend = speedDiff < -1 ? 'increasing' : 
                      speedDiff > 1 ? 'decreasing' : 'stable';

    // Identify strengths and weaknesses by operation
    const operationStats = new Map<string, { correct: number; total: number; avgTime: number }>();
    
    sessions.forEach(session => {
      const op = session.operationType;
      const stats = operationStats.get(op) || { correct: 0, total: 0, avgTime: 0 };
      
      const prevTotal = stats.total;
      stats.correct += session.correctAnswers;
      stats.total += session.totalExercises;
      stats.avgTime = (stats.avgTime * prevTotal + session.avgTimePerProblem * session.totalExercises) / stats.total;
      
      operationStats.set(op, stats);
    });

    const strengths: string[] = [];
    const areasToImprove: string[] = [];
    
    operationStats.forEach((stats, operation) => {
      const accuracy = (stats.correct / stats.total) * 100;
      const opName = this.getOperationName(operation);
      
      if (accuracy >= 80) {
        strengths.push(`${opName} (${accuracy.toFixed(0)}% correcto)`);
      } else if (accuracy < 60) {
        areasToImprove.push(`${opName} (${accuracy.toFixed(0)}% correcto)`);
      }
      
      if (stats.avgTime < 5) {
        strengths.push(`Velocidad en ${opName.toLowerCase()}`);
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (accuracyTrend === 'decreasing') {
      recommendations.push('Tómate más tiempo para pensar cada respuesta');
    }
    
    if (speedTrend === 'decreasing') {
      recommendations.push('Practica ejercicios más simples para ganar confianza');
    }
    
    if (areasToImprove.length > 0) {
      recommendations.push(`Enfócate en practicar ${areasToImprove[0]}`);
    }
    
    const currentStreak = this.calculateStreak(sessions);
    if (currentStreak < 3) {
      recommendations.push('Intenta practicar todos los días para formar un hábito');
    }

    return {
      isImproving: accuracyTrend === 'increasing' || speedTrend === 'increasing',
      speedTrend,
      accuracyTrend,
      strengths: strengths.length > 0 ? strengths : ['¡Sigue practicando!'],
      areasToImprove: areasToImprove.length > 0 ? areasToImprove : ['Mantén el buen trabajo'],
      recommendations: recommendations.length > 0 ? recommendations : ['¡Excelente progreso! Sigue así'],
    };
  },

  // Helper to get operation name in Spanish
  getOperationName(operation: string): string {
    const names: Record<string, string> = {
      suma: 'Suma',
      resta: 'Resta',
      multiplicacion: 'Multiplicación',
      division: 'División',
      mixto: 'Ejercicios Mixtos',
      otro: 'Otros',
    };
    return names[operation] || operation;
  },

  // Calculate practice streak
  calculateStreak(sessions: PracticeSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) {
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

  // Format time for display
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)} seg`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  },

  // Get performance by time of day
  getPerformanceByTimeOfDay(sessions: PracticeSession[]) {
    const timeSlots = {
      morning: { start: 6, end: 12, sessions: 0, accuracy: 0 },
      afternoon: { start: 12, end: 18, sessions: 0, accuracy: 0 },
      evening: { start: 18, end: 24, sessions: 0, accuracy: 0 },
      night: { start: 0, end: 6, sessions: 0, accuracy: 0 },
    };

    sessions.forEach(session => {
      const hour = new Date(session.startedAt).getHours();
      const accuracy = (session.correctAnswers / session.totalExercises) * 100;

      let slot: keyof typeof timeSlots;
      if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 18) slot = 'afternoon';
      else if (hour >= 18 && hour < 24) slot = 'evening';
      else slot = 'night';

      const prevTotal = timeSlots[slot].sessions;
      timeSlots[slot].sessions++;
      timeSlots[slot].accuracy = 
        (timeSlots[slot].accuracy * prevTotal + accuracy) / timeSlots[slot].sessions;
    });

    return Object.entries(timeSlots)
      .filter(([_, data]) => data.sessions > 0)
      .map(([time, data]) => ({
        time: this.getTimeSlotName(time),
        sessions: data.sessions,
        accuracy: Math.round(data.accuracy),
      }));
  },

  // Helper to get time slot name in Spanish
  getTimeSlotName(slot: string): string {
    const names: Record<string, string> = {
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
      night: 'Madrugada',
    };
    return names[slot] || slot;
  },
};