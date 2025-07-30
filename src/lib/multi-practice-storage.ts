import { MultiPracticeSession } from './storage';
import { getCurrentProfileStorageKey } from './profiles';

const BASE_MULTI_PRACTICE_KEY = 'waok_multi_practice_session';

// Helper to get current storage key
const getStorageKey = () => getCurrentProfileStorageKey(BASE_MULTI_PRACTICE_KEY);

export const multiPracticeStorage = {
  // Guardar sesión activa
  saveSession: (session: MultiPracticeSession): void => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(session));
    } catch (error) {
      console.error('Error saving multi-practice session:', error);
    }
  },

  // Obtener sesión activa
  getActiveSession: (): MultiPracticeSession | null => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (!stored) return null;
      
      const session = JSON.parse(stored) as MultiPracticeSession;
      
      // Si la sesión ya está completada, no la retornamos
      if (session.completedAt) return null;
      
      return session;
    } catch (error) {
      console.error('Error loading multi-practice session:', error);
      return null;
    }
  },

  // Actualizar progreso de sesión
  updateProgress: (
    sessionId: string,
    currentIndex: number,
    cardId: string,
    isCorrect: boolean
  ): MultiPracticeSession | null => {
    try {
      const session = multiPracticeStorage.getActiveSession();
      if (!session || session.id !== sessionId) return null;

      // Actualizar índice actual
      session.currentIndex = currentIndex;

      // Inicializar resultados para la tarjeta si no existe
      if (!session.results[cardId]) {
        const exercise = session.exercises.find(ex => ex.cardId === cardId);
        session.results[cardId] = {
          cardName: exercise?.cardName || '',
          correct: 0,
          incorrect: 0,
          timeSpent: 0,
          startedAt: new Date().toISOString()
        };
      }

      // Actualizar contadores
      if (isCorrect) {
        session.results[cardId].correct++;
        session.totalCorrect++;
      } else {
        session.results[cardId].incorrect++;
        session.totalIncorrect++;
      }

      // Guardar sesión actualizada
      multiPracticeStorage.saveSession(session);
      return session;
    } catch (error) {
      console.error('Error updating multi-practice progress:', error);
      return null;
    }
  },

  // Completar sesión
  completeSession: (sessionId: string): MultiPracticeSession | null => {
    try {
      const session = multiPracticeStorage.getActiveSession();
      if (!session || session.id !== sessionId) return null;

      // Marcar como completada
      session.completedAt = new Date().toISOString();

      // Calcular tiempo total por tarjeta
      const now = new Date();
      Object.keys(session.results).forEach(cardId => {
        const startedAt = new Date(session.results[cardId].startedAt);
        session.results[cardId].timeSpent = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      });

      // Guardar sesión completada
      multiPracticeStorage.saveSession(session);
      return session;
    } catch (error) {
      console.error('Error completing multi-practice session:', error);
      return null;
    }
  },

  // Limpiar sesión
  clearSession: (): void => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Error clearing multi-practice session:', error);
    }
  },

  // Crear nueva sesión
  createSession: (
    type: 'favorites' | 'all',
    exercises: MultiPracticeSession['exercises']
  ): MultiPracticeSession => {
    const session: MultiPracticeSession = {
      id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      exercises,
      currentIndex: 0,
      results: {},
      startedAt: new Date().toISOString(),
      totalCorrect: 0,
      totalIncorrect: 0
    };

    multiPracticeStorage.saveSession(session);
    return session;
  }
};