'use client';

import { useState, useEffect, useRef } from 'react';
import { PracticeCard } from '@/lib/storage';
import DrawingCanvasSimple from './DrawingCanvasSimple';
import AnswerPanel from './AnswerPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Target,
  Trophy,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { 
  generatePracticeSessionAction, 
  checkAnswerAction,
  getHintAction
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { exerciseCache } from '@/lib/exercise-cache';
import { parseExerciseProblem } from '@/lib/exercise-parser';
import { usePracticeHistory } from '@/hooks/use-practice-history';
import { ExerciseDetail } from '@/lib/practice-history';

interface Exercise {
  id: string;
  problem: string;
  solution: string;
  explanation: string;
}

interface PracticeScreenProps {
  card: PracticeCard;
  onBack: () => void;
}

export default function PracticeScreen({ card, onBack }: PracticeScreenProps) {
  const { toast } = useToast();
  const { startSession, updateSession, completeSession } = usePracticeHistory();
  
  // State management
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [hint, setHint] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | undefined>();
  const [sessionComplete, setSessionComplete] = useState(false);
  const [hasModalOpen, setHasModalOpen] = useState(false);
  
  // Adaptive difficulty states
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState(card.difficulty);
  
  // Navigation and review mode states
  const [userAnswers, setUserAnswers] = useState<Record<number, {
    answer: string;
    isCorrect: boolean;
    attempts: number;
  }>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // índice del problema activo (no en revisión)
  
  // Practice history tracking
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(Date.now());
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseDetail[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  
  // Ref for canvas to clear it when needed
  const canvasRef = useRef<{ clearCanvas: () => void }>(null);

  // Load exercises once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadExercises = async () => {
      // Log para detectar doble renderizado
      console.log('[PracticeScreen] Loading exercises for card:', card.id, 'at', new Date().toISOString());
      
      try {
        // Obtener ejercicios no usados del pool
        let exercises = exerciseCache.getUnusedExercises(card.id, card.exerciseCount);
        
        if (exercises.length >= card.exerciseCount) {
          // Tenemos suficientes ejercicios del caché
          console.log('[PracticeScreen] Using cached exercises:', exercises.length);
          if (isMounted) {
            setExercises(exercises);
            // Marcar ejercicios como usados
            const exerciseIds = exercises.map(ex => ex.id);
            exerciseCache.markAsUsed(card.id, exerciseIds);
            setIsLoading(false);
            
            // Start practice session for history tracking
            const newSessionId = startSession(card);
            setSessionId(newSessionId);
          }
          return;
        }
        
        // Si no tenemos suficientes, generar más
        console.log('[PracticeScreen] Not enough exercises, generating more...');
        await exerciseCache.ensureExercisesAvailable(card);
        
        // Intentar obtener ejercicios nuevamente
        exercises = exerciseCache.getUnusedExercises(card.id, card.exerciseCount);
        
        if (isMounted && exercises.length > 0) {
          console.log('[PracticeScreen] Setting exercises after generation:', exercises.length);
          setExercises(exercises);
          // Marcar ejercicios como usados
          const exerciseIds = exercises.map(ex => ex.id);
          exerciseCache.markAsUsed(card.id, exerciseIds);
          setIsLoading(false);
          
          // Start practice session for history tracking
          const newSessionId = startSession(card);
          setSessionId(newSessionId);
        }
      } catch (error) {
        console.error('[PracticeScreen] Error loading exercises:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los ejercicios.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      }
    };
    
    loadExercises();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Generate new exercises when difficulty changes (adaptive mode)
  useEffect(() => {
    if (card.adaptiveDifficulty && currentDifficulty !== card.difficulty) {
      const generateNewExercises = async () => {
        try {
          // Generate 5 new exercises for the new level
          const result = await generatePracticeSessionAction({
            ...card,
            difficulty: currentDifficulty,
            exerciseCount: 5
          });
          
          if (result.data && result.data.length > 0) {
            // Add new exercises to the end
            setExercises(prev => [...prev, ...result.data]);
            toast({
              title: "Nuevos ejercicios agregados",
              description: `Se agregaron ejercicios del nivel ${currentDifficulty}`,
            });
          }
        } catch (error) {
          console.error('Error generating new level exercises:', error);
        }
      };
      
      generateNewExercises();
    }
  }, [currentDifficulty, card]);


  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;
  
  // Log para detectar cambios no esperados en el ejercicio actual
  useEffect(() => {
    if (currentExercise) {
      console.log('[PracticeScreen] Current exercise changed:', {
        index: currentIndex,
        problem: currentExercise.problem,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentExercise?.problem, currentIndex]);

  const handleAnswer = async (answer: string) => {
    if (!currentExercise || showSolution) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    try {
      const result = await checkAnswerAction(
        currentExercise.problem,
        currentExercise.solution,
        answer,
        newAttempts
      );
      
      if (result.data) {
        setFeedback(result.data);
        
        // Guardar respuesta del usuario
        setUserAnswers(prev => ({
          ...prev,
          [currentIndex]: {
            answer: answer,
            isCorrect: result.data.isCorrect,
            attempts: newAttempts
          }
        }));
        
        // Track exercise completion for history
        if (result.data.isCorrect || newAttempts >= card.attemptsPerExercise) {
          const timeSpent = Math.round((Date.now() - exerciseStartTime) / 1000); // in seconds
          const exerciseDetail: ExerciseDetail = {
            problem: currentExercise.problem,
            userAnswer: answer,
            correctAnswer: currentExercise.solution,
            isCorrect: result.data.isCorrect,
            attempts: newAttempts,
            timeSpent,
            timestamp: new Date().toISOString(),
          };
          
          const updatedHistory = [...exerciseHistory, exerciseDetail];
          setExerciseHistory(updatedHistory);
          
          // Update session with current progress
          if (sessionId) {
            updateSession(sessionId, updatedHistory);
          }
        }
        
        if (result.data.isCorrect) {
          // Clear the canvas when answer is correct
          canvasRef.current?.clearCanvas();
          
          setCorrectAnswers(prev => prev + 1);
          setConsecutiveCorrect(prev => prev + 1);
          setShowSolution(true);
          setHint(currentExercise.explanation);
          
          // Check for adaptive difficulty level up
          if (card.adaptiveDifficulty && 
              consecutiveCorrect + 1 >= 10 && 
              currentDifficulty < 10) {
            setCurrentDifficulty(prev => prev + 1);
            setConsecutiveCorrect(0);
            // Block auto-advance temporarily when showing level-up notification
            setHasModalOpen(true);
            toast({
              title: "¡Nivel superado! 🎉",
              description: `Has subido al nivel ${currentDifficulty + 1}. ¡Sigue así!`,
            });
            // Reset modal state after toast duration
            setTimeout(() => {
              setHasModalOpen(false);
            }, 5000); // 5 seconds to ensure toast is fully shown
          }
        } else if (newAttempts >= card.attemptsPerExercise) {
          // No more attempts
          setConsecutiveCorrect(0); // Reset consecutive counter
          setShowSolution(true);
          setHint(currentExercise.explanation);
          
          // Add compensation exercise if enabled
          if (card.autoCompensation) {
            await addCompensationExercise();
          }
        } else {
          // Wrong answer but still have attempts
          setConsecutiveCorrect(0); // Reset consecutive counter
          
          // Get a hint for the next attempt
          const hintResult = await getHintAction(
            currentExercise.problem,
            currentExercise.solution,
            answer
          );
          if (hintResult.data) {
            setHint(hintResult.data);
            setHintsUsedCount(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo verificar tu respuesta',
        variant: 'destructive',
      });
    }
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
    setHint(currentExercise?.explanation || '');
    
    // Guardar que el usuario reveló la solución (respuesta incorrecta)
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        answer: '',
        isCorrect: false,
        attempts: attempts + 1
      }
    }));
    
    // Track exercise as failed when solution is revealed
    if (currentExercise) {
      const timeSpent = Math.round((Date.now() - exerciseStartTime) / 1000);
      const exerciseDetail: ExerciseDetail = {
        problem: currentExercise.problem,
        userAnswer: '',
        correctAnswer: currentExercise.solution,
        isCorrect: false,
        attempts: attempts + 1,
        timeSpent,
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [...exerciseHistory, exerciseDetail];
      setExerciseHistory(updatedHistory);
      
      // Update session with current progress
      if (sessionId) {
        updateSession(sessionId, updatedHistory);
      }
    }
    
    // Add compensation exercise if enabled
    if (card.autoCompensation) {
      addCompensationExercise();
    }
  };

  const handlePreviousExercise = () => {
    if (!isReviewMode) {
      setActiveIndex(currentIndex);
    }
    setIsReviewMode(true);
    setCurrentIndex(currentIndex - 1);
    // Limpiar estados temporales
    setAttempts(0);
    setShowSolution(true);
    setFeedback(undefined);
    setHint('');
  };

  const handleBackToActive = () => {
    setIsReviewMode(false);
    setCurrentIndex(activeIndex);
    // Restaurar estados del problema activo
    setShowSolution(false);
    setAttempts(0);
    setFeedback(undefined);
    setHint('');
  };

  const handleNextExercise = () => {
    // Clear the canvas when moving to next exercise
    canvasRef.current?.clearCanvas();
    
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAttempts(0);
      setShowSolution(false);
      setHint('');
      setFeedback(undefined);
      // Reset exercise start time for next exercise
      setExerciseStartTime(Date.now());
    } else {
      // Session complete
      setSessionComplete(true);
      
      // Complete the practice session in history
      if (sessionId) {
        const totalTime = Math.round((Date.now() - sessionStartTime) / 1000);
        completeSession(sessionId, {
          totalExercises: exercises.length,
          correctAnswers,
          totalTimeSpent: totalTime,
          avgTimePerProblem: totalTime / exercises.length,
          finalDifficulty: currentDifficulty,
          hintsUsed: hintsUsedCount,
          consecutiveCorrect,
        });
      }
      
      // Block auto-advance when showing session complete notification
      setHasModalOpen(true);
      toast({
        title: '¡Sesión completada!',
        description: `Has completado ${exercises.length} ejercicios con ${correctAnswers} respuestas correctas.`,
      });
    }
  };

  const addCompensationExercise = async () => {
    try {
      const result = await generatePracticeSessionAction({
        ...card,
        difficulty: currentDifficulty, // Use current difficulty for adaptive mode
        exerciseCount: 1,
        levelExamples: card.levelExamples
      });
      
      if (result.data && result.data.length > 0) {
        setExercises(prev => [...prev, result.data[0]]);
        toast({
          title: 'Ejercicio adicional agregado',
          description: 'Se ha agregado un ejercicio extra para compensar.',
        });
      }
    } catch (error) {
      console.error('Error adding compensation exercise:', error);
    }
  };

  const handleClearCanvas = () => {
    // This will be handled by DrawingCanvas
  };

  // Show loading state while exercises are being loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Preparando ejercicios</h3>
          <p className="text-muted-foreground mb-4">
            Los ejercicios se están preparando. Esto solo tomará un momento.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis tarjetas
        </Button>
        <div className="flex items-center gap-4">
          {isReviewMode && currentIndex < activeIndex - 1 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setCurrentIndex(currentIndex + 1);
                setAttempts(0);
                setShowSolution(true);
                setFeedback(undefined);
                setHint('');
              }}
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Badge variant="secondary">
            {currentIndex + 1} / {exercises.length}
          </Badge>
          {isReviewMode && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Modo Revisión
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{correctAnswers} correctas</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2" />

      {/* Card info */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{card.topic}</h2>
              {card.adaptiveDifficulty && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Adaptativa
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Dificultad: {card.adaptiveDifficulty && currentDifficulty !== card.difficulty 
                ? `${currentDifficulty}/10 (adaptativa desde ${card.difficulty}/10)` 
                : `${card.difficulty}/10`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Intentos restantes</p>
            <p className="text-2xl font-bold text-primary">
              {card.attemptsPerExercise - attempts}
            </p>
          </div>
        </div>
      </Card>

      {/* Main practice area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Drawing Canvas */}
        <div className="space-y-4">
          <Card className="p-6">
            {/* Parse the exercise to separate instruction from operation */}
            {(() => {
              const parsed = currentExercise ? parseExerciseProblem(currentExercise.problem) : { instruction: null, operation: null };
              return (
                <>
                  {/* Show instruction if exists */}
                  {parsed.instruction && (
                    <div className="mb-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-lg font-medium text-gray-800">
                        <span className="text-blue-600 mr-2">📝</span>
                        {parsed.instruction}
                      </p>
                    </div>
                  )}
                  
                  {/* Canvas with only the operation */}
                  <DrawingCanvasSimple
                    ref={canvasRef}
                    onClear={handleClearCanvas}
                    height={500}
                    operationText={parsed.operation || currentExercise?.problem}
                    onSubmitAnswer={handleAnswer}
                    attempts={attempts}
                    maxAttempts={card.attemptsPerExercise}
                    showSolution={showSolution}
                    feedback={feedback}
                    solution={currentExercise?.solution}
                    hint={hint}
                    onNext={handleNextExercise}
                    isLastExercise={currentIndex === exercises.length - 1}
                    cardId={card.id}
                    currentIndex={currentIndex}
                    totalExercises={exercises.length}
                    correctAnswers={correctAnswers}
                    topic={card.topic}
                    difficulty={card.adaptiveDifficulty ? currentDifficulty : card.difficulty}
                    onRevealSolution={handleRevealSolution}
                    isReviewMode={isReviewMode}
                    userAnswer={userAnswers[currentIndex]?.answer}
                    onBackToActive={handleBackToActive}
                  />
                </>
              );
            })()}
          </Card>
        </div>

        {/* Right: Answer Panel */}
        <div className="space-y-4">
          <AnswerPanel
            onSubmit={handleAnswer}
            onRevealSolution={handleRevealSolution}
            onNext={handleNextExercise}
            attempts={attempts}
            maxAttempts={card.attemptsPerExercise}
            showSolution={showSolution}
            solution={currentExercise?.solution}
            hint={hint}
            feedback={feedback}
            isLastExercise={currentIndex === exercises.length - 1}
            autoCompensation={card.autoCompensation}
            cardId={card.id}
            hasModalOpen={hasModalOpen}
            isReviewMode={isReviewMode}
            userAnswer={userAnswers[currentIndex]?.answer}
            onBackToActive={handleBackToActive}
            currentIndex={currentIndex}
            onPrevious={handlePreviousExercise}
          />
        </div>
      </div>
    </div>
  );
}