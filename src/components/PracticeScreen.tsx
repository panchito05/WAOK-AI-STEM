'use client';

import { useState, useEffect } from 'react';
import { PracticeCard } from '@/lib/storage';
import DrawingCanvasSimple from './DrawingCanvasSimple';
import AnswerPanel from './AnswerPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  RotateCcw,
  Target,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { 
  generatePracticeSessionAction, 
  checkAnswerAction,
  getHintAction
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { exerciseCache } from '@/lib/exercise-cache';
import { parseExerciseProblem } from '@/lib/exercise-parser';

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

  // Load exercises once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadExercises = async () => {
      // Log para detectar doble renderizado
      console.log('[PracticeScreen] Loading exercises for card:', card.id, 'at', new Date().toISOString());
      
      try {
        // Usar consumeFromPool directamente para hacer la operación atómica
        let exercises = exerciseCache.consumeFromPool(card.id, card.exerciseCount);
        
        if (exercises.length >= card.exerciseCount) {
          // Tenemos suficientes ejercicios del caché
          console.log('[PracticeScreen] Using cached exercises:', exercises.length);
          if (isMounted) {
            setExercises(exercises);
            exerciseCache.maintainPoolSize(card.id);
            setIsLoading(false);
          }
          return;
        }
        
        // Si no tenemos suficientes, devolver los que consumimos al pool
        if (exercises.length > 0) {
          console.log('[PracticeScreen] Not enough cached exercises, returning to pool:', exercises.length);
          exerciseCache.addToPool(card.id, exercises);
        }
        
        // Generar nuevos ejercicios
        console.log('[PracticeScreen] Generating new exercises...');
        const newExercises = await exerciseCache.ensureExercisesAvailable(card);
        
        // Consumir los ejercicios necesarios
        exercises = exerciseCache.consumeFromPool(card.id, card.exerciseCount);
        
        if (isMounted && exercises.length > 0) {
          console.log('[PracticeScreen] Setting new exercises:', exercises.length);
          setExercises(exercises);
          exerciseCache.maintainPoolSize(card.id);
          setIsLoading(false);
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
        
        if (result.data.isCorrect) {
          setCorrectAnswers(prev => prev + 1);
          setShowSolution(true);
          setHint(currentExercise.explanation);
        } else if (newAttempts >= card.attemptsPerExercise) {
          // No more attempts
          setShowSolution(true);
          setHint(currentExercise.explanation);
          
          // Add compensation exercise if enabled
          if (card.autoCompensation) {
            await addCompensationExercise();
          }
        } else {
          // Get a hint for the next attempt
          const hintResult = await getHintAction(
            currentExercise.problem,
            currentExercise.solution,
            answer
          );
          if (hintResult.data) {
            setHint(hintResult.data);
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
    
    // Add compensation exercise if enabled
    if (card.autoCompensation) {
      addCompensationExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAttempts(0);
      setShowSolution(false);
      setHint('');
      setFeedback(undefined);
    } else {
      // Session complete
      setSessionComplete(true);
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
        exerciseCount: 1
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
          <Badge variant="secondary">
            {currentIndex + 1} / {exercises.length}
          </Badge>
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
            <h2 className="text-xl font-semibold">{card.name}</h2>
            <p className="text-sm text-muted-foreground">
              Tema: {card.topic} • Dificultad: {card.difficulty}/10
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
                    onClear={handleClearCanvas}
                    height={500}
                    operationText={parsed.operation || currentExercise?.problem}
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
          />
        </div>
      </div>
    </div>
  );
}