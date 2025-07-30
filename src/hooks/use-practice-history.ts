import { useState, useEffect, useCallback } from 'react';
import { 
  practiceHistoryStorage, 
  PracticeSession, 
  ExerciseDetail,
  DailyStats,
  OperationStats,
  Achievement
} from '@/lib/practice-history';
import { progressStats } from '@/lib/progress-stats';
import { useToast } from '@/hooks/use-toast';
import { PracticeCard } from '@/lib/storage';
import { profilesStorage } from '@/lib/profiles';

interface UsePracticeHistoryReturn {
  // Data
  recentSessions: PracticeSession[];
  dailyStats: DailyStats[];
  operationStats: OperationStats[];
  totalStats: ReturnType<typeof practiceHistoryStorage.getTotalStats>;
  achievements: Achievement[];
  
  // Actions
  startSession: (card: PracticeCard) => string;
  saveSession: (sessionData: Partial<PracticeSession>) => void;
  updateSession: (sessionId: string, exercises: ExerciseDetail[]) => void;
  completeSession: (sessionId: string, finalData: Partial<PracticeSession>) => void;
  deleteSession: (sessionId: string) => void;
  exportHistory: (format: 'json' | 'csv') => void;
  clearHistory: () => void;
  
  // Loading state
  isLoading: boolean;
  refresh: () => void;
}

export function usePracticeHistory(): UsePracticeHistoryReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [operationStats, setOperationStats] = useState<OperationStats[]>([]);
  const [totalStats, setTotalStats] = useState(practiceHistoryStorage.getTotalStats());
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Load data
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      setRecentSessions(practiceHistoryStorage.getRecent(20));
      setDailyStats(practiceHistoryStorage.getDailyStats(7));
      setOperationStats(practiceHistoryStorage.getOperationStats());
      setTotalStats(practiceHistoryStorage.getTotalStats());
      setAchievements(practiceHistoryStorage.getAchievements());
    } catch (error) {
      console.error('Error loading practice history:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial de práctica',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load and refresh on storage changes
  useEffect(() => {
    loadData();
    
    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('practice_history')) {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  // Start a new practice session
  const startSession = useCallback((card: PracticeCard): string => {
    const profile = profilesStorage.getActiveProfile();
    if (!profile) {
      throw new Error('No active profile');
    }

    const sessionId = crypto.randomUUID();
    const operationType = determineOperationType(card.topic);
    
    const session: Omit<PracticeSession, 'id'> = {
      profileId: profile.id,
      cardId: card.id,
      cardName: card.name,
      cardTopic: card.topic,
      operationType,
      startedAt: new Date().toISOString(),
      totalExercises: 0,
      correctAnswers: 0,
      totalTimeSpent: 0,
      avgTimePerProblem: 0,
      difficulty: card.difficulty,
      adaptiveDifficulty: card.adaptiveDifficulty,
      exercises: [],
      consecutiveCorrect: 0,
      hintsUsed: 0,
    };

    // Store temporarily in session storage
    sessionStorage.setItem(`practice_session_${sessionId}`, JSON.stringify(session));
    
    return sessionId;
  }, []);

  // Save/update session
  const saveSession = useCallback((sessionData: Partial<PracticeSession>) => {
    try {
      const saved = practiceHistoryStorage.save(sessionData as Omit<PracticeSession, 'id'>);
      
      // Check for new achievements
      const newAchievements = practiceHistoryStorage.checkAchievements(saved);
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast({
            title: '¡Nuevo Logro! 🎉',
            description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
          });
        });
        setAchievements(prev => [...prev, ...newAchievements]);
      }
      
      loadData();
    } catch (error) {
      console.error('Error saving practice session:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la sesión de práctica',
        variant: 'destructive',
      });
    }
  }, [loadData, toast]);

  // Update session with new exercises
  const updateSession = useCallback((sessionId: string, exercises: ExerciseDetail[]) => {
    try {
      const sessionKey = `practice_session_${sessionId}`;
      const sessionData = sessionStorage.getItem(sessionKey);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.exercises = exercises;
        session.totalExercises = exercises.length;
        session.correctAnswers = exercises.filter(e => e.isCorrect).length;
        
        // Calculate time stats
        const totalTime = exercises.reduce((sum, e) => sum + e.timeSpent, 0);
        session.totalTimeSpent = totalTime;
        session.avgTimePerProblem = exercises.length > 0 ? totalTime / exercises.length : 0;
        
        // Update consecutive correct count
        let consecutive = 0;
        for (let i = exercises.length - 1; i >= 0; i--) {
          if (exercises[i].isCorrect) {
            consecutive++;
          } else {
            break;
          }
        }
        session.consecutiveCorrect = consecutive;
        
        sessionStorage.setItem(sessionKey, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }, []);

  // Complete session
  const completeSession = useCallback((sessionId: string, finalData: Partial<PracticeSession>) => {
    try {
      const sessionKey = `practice_session_${sessionId}`;
      const sessionData = sessionStorage.getItem(sessionKey);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const completedSession = {
          ...session,
          ...finalData,
          completedAt: new Date().toISOString(),
        };
        
        // Save to permanent storage
        saveSession(completedSession);
        
        // Clear from session storage
        sessionStorage.removeItem(sessionKey);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la sesión',
        variant: 'destructive',
      });
    }
  }, [saveSession, toast]);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    if (practiceHistoryStorage.delete(sessionId)) {
      loadData();
      toast({
        title: 'Sesión eliminada',
        description: 'La sesión se eliminó correctamente',
      });
    }
  }, [loadData, toast]);

  // Export history
  const exportHistory = useCallback((format: 'json' | 'csv') => {
    try {
      const data = practiceHistoryStorage.exportData(format);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waok_history_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Historial exportado',
        description: `El historial se exportó como ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting history:', error);
      toast({
        title: 'Error',
        description: 'No se pudo exportar el historial',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Clear history
  const clearHistory = useCallback(() => {
    practiceHistoryStorage.clearAll();
    loadData();
    toast({
      title: 'Historial borrado',
      description: 'Todo el historial fue eliminado',
    });
  }, [loadData, toast]);

  return {
    // Data
    recentSessions,
    dailyStats,
    operationStats,
    totalStats,
    achievements,
    
    // Actions
    startSession,
    saveSession,
    updateSession,
    completeSession,
    deleteSession,
    exportHistory,
    clearHistory,
    
    // State
    isLoading,
    refresh: loadData,
  };
}

// Helper function to determine operation type from topic
function determineOperationType(topic: string): PracticeSession['operationType'] {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes('suma') || lowerTopic.includes('adición')) {
    return 'suma';
  } else if (lowerTopic.includes('resta') || lowerTopic.includes('sustracción')) {
    return 'resta';
  } else if (lowerTopic.includes('multiplicación') || lowerTopic.includes('multiplicacion')) {
    return 'multiplicacion';
  } else if (lowerTopic.includes('división') || lowerTopic.includes('division')) {
    return 'division';
  } else if (lowerTopic.includes('mixto') || lowerTopic.includes('combinado')) {
    return 'mixto';
  } else {
    return 'otro';
  }
}