'use client';

import { useState, useEffect, useRef } from 'react';
import { useCards } from '@/hooks/use-cards';
import { multiPracticeStorage } from '@/lib/multi-practice-storage';
import { MultiPracticeSession, MultiPracticeExercise } from '@/lib/storage';
import { exerciseCache } from '@/lib/exercise-cache';
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
  AlertCircle,
  Shuffle,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { parseExerciseProblem } from '@/lib/exercise-parser';
import DynamicIcon from './DynamicIcon';

interface MultiPracticeScreenProps {
  type: 'favorites' | 'all';
  onBack: () => void;
}

export default function MultiPracticeScreen({ type, onBack }: MultiPracticeScreenProps) {
  const { toast } = useToast();
  const { cards, isLoading: cardsLoading } = useCards();
  
  // State management
  const [session, setSession] = useState<MultiPracticeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [hint, setHint] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | undefined>();
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Ref for canvas to clear it when needed
  const canvasRef = useRef<{ clearCanvas: () => void }>(null);

  // Load or create session
  useEffect(() => {
    const loadSession = async () => {
      // Wait for cards to load
      if (cardsLoading) return;
      
      try {
        // Check for existing session
        const existingSession = multiPracticeStorage.getActiveSession();
        if (existingSession && existingSession.type === type) {
          setSession(existingSession);
          setCurrentIndex(existingSession.currentIndex);
          setIsLoading(false);
          return;
        }

        // Filter cards based on type
        const selectedCards = type === 'favorites' 
          ? cards.filter(c => c.isFavorite)
          : cards;

        if (selectedCards.length === 0) {
          toast({
            title: 'No hay tarjetas disponibles',
            description: type === 'favorites' 
              ? 'No tienes tarjetas marcadas como favoritas'
              : 'No hay tarjetas disponibles para practicar',
            variant: 'destructive'
          });
          onBack();
          return;
        }

        // Collect exercises from all selected cards
        const allExercises: MultiPracticeExercise[] = [];
        
        for (const card of selectedCards) {
          // Get exercises from cache
          const exercises = exerciseCache.getUnusedExercises(card.id, card.exerciseCount);
          
          if (exercises.length < card.exerciseCount) {
            // Generate more if needed
            await exerciseCache.ensureExercisesAvailable(card);
            const newExercises = exerciseCache.getUnusedExercises(card.id, card.exerciseCount);
            
            // Add to multi-practice exercises
            newExercises.forEach(exercise => {
              allExercises.push({
                cardId: card.id,
                cardName: card.name,
                cardTopic: card.topic,
                cardColor: card.color,
                cardIcon: card.icon,
                exercise,
                difficulty: card.difficulty,
                attemptsPerExercise: card.attemptsPerExercise,
                autoCompensation: card.autoCompensation
              });
            });
            
            // Mark as used
            exerciseCache.markAsUsed(card.id, newExercises.map(e => e.id));
          } else {
            // Add to multi-practice exercises
            exercises.forEach(exercise => {
              allExercises.push({
                cardId: card.id,
                cardName: card.name,
                cardTopic: card.topic,
                cardColor: card.color,
                cardIcon: card.icon,
                exercise,
                difficulty: card.difficulty,
                attemptsPerExercise: card.attemptsPerExercise,
                autoCompensation: card.autoCompensation
              });
            });
            
            // Mark as used
            exerciseCache.markAsUsed(card.id, exercises.map(e => e.id));
          }
        }

        // Mix exercises for variety
        const mixedExercises = mixExercises(allExercises);

        // Create new session
        const newSession = multiPracticeStorage.createSession(type, mixedExercises);
        setSession(newSession);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading multi-practice session:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la sesión de práctica',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    };

    loadSession();
  }, [cards, type, toast, onBack, cardsLoading]);

  // Mix exercises to ensure variety
  const mixExercises = (exercises: MultiPracticeExercise[]): MultiPracticeExercise[] => {
    const mixed: MultiPracticeExercise[] = [];
    const byCard: { [cardId: string]: MultiPracticeExercise[] } = {};
    
    // Group by card
    exercises.forEach(ex => {
      if (!byCard[ex.cardId]) byCard[ex.cardId] = [];
      byCard[ex.cardId].push(ex);
    });
    
    // Round-robin selection
    let hasMore = true;
    let round = 0;
    
    while (hasMore) {
      hasMore = false;
      const cardIds = Object.keys(byCard).sort(() => Math.random() - 0.5);
      
      for (const cardId of cardIds) {
        if (byCard[cardId].length > round) {
          mixed.push(byCard[cardId][round]);
          hasMore = true;
        }
      }
      round++;
    }
    
    return mixed;
  };

  const currentExercise = session?.exercises[currentIndex];
  const progress = session ? ((currentIndex + 1) / session.exercises.length) * 100 : 0;

  const handleAnswer = async (answer: string) => {
    if (!currentExercise || !session || showSolution) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    try {
      const result = await api.checkAnswer({
        problem: currentExercise.exercise.problem,
        correctAnswer: currentExercise.exercise.solution,
        userAnswer: answer,
        attemptNumber: newAttempts
      });
      
      if (result.data) {
        setFeedback(result.data);
        
        if (result.data.isCorrect) {
          // Clear the canvas when answer is correct
          canvasRef.current?.clearCanvas();
          
          multiPracticeStorage.updateProgress(
            session.id,
            currentIndex,
            currentExercise.cardId,
            true
          );
          setShowSolution(true);
          setHint(currentExercise.exercise.explanation);
        } else if (newAttempts >= currentExercise.attemptsPerExercise) {
          // No more attempts
          multiPracticeStorage.updateProgress(
            session.id,
            currentIndex,
            currentExercise.cardId,
            false
          );
          setShowSolution(true);
          setHint(currentExercise.exercise.explanation);
        } else {
          // Wrong answer but still have attempts
          // Note: getHintAction is not available in the API client
          // We'll need to handle hints differently or add it to the API
          const hintResult = { data: null };
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
    if (!currentExercise || !session) return;
    
    setShowSolution(true);
    setHint(currentExercise.exercise.explanation || '');
    
    // Update progress as incorrect
    multiPracticeStorage.updateProgress(
      session.id,
      currentIndex,
      currentExercise.cardId,
      false
    );
  };

  const handleNextExercise = () => {
    if (!session) return;
    
    // Clear the canvas when moving to next exercise
    canvasRef.current?.clearCanvas();
    
    if (currentIndex < session.exercises.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setAttempts(0);
      setShowSolution(false);
      setHint('');
      setFeedback(undefined);
      
      // Update session index
      multiPracticeStorage.updateProgress(session.id, newIndex, '', false);
    } else {
      // Session complete
      const completedSession = multiPracticeStorage.completeSession(session.id);
      if (completedSession) {
        setSession(completedSession);
        setSessionComplete(true);
        setShowStats(true);
      }
    }
  };

  const handleClearCanvas = () => {
    // This will be handled by DrawingCanvas
  };

  // Calculate session statistics
  const getSessionStats = () => {
    if (!session) return null;
    
    const totalTime = session.completedAt 
      ? Math.floor((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
      : 0;
      
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    return {
      totalExercises: session.exercises.length,
      totalCorrect: session.totalCorrect,
      totalIncorrect: session.totalIncorrect,
      accuracy: session.exercises.length > 0 
        ? Math.round((session.totalCorrect / session.exercises.length) * 100)
        : 0,
      timeFormatted: `${minutes}:${seconds.toString().padStart(2, '0')}`
    };
  };

  // Show loading state
  if (isLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="p-8 text-center max-w-md">
          <Shuffle className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Preparando práctica múltiple</h3>
          <p className="text-muted-foreground mb-4">
            Mezclando ejercicios de {type === 'favorites' ? 'tus favoritas' : 'todas las operaciones'}...
          </p>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </Card>
      </div>
    );
  }

  // Show statistics when session is complete
  if (sessionComplete && showStats && session) {
    const stats = getSessionStats();
    
    return (
      <div className="space-y-4">
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Sesión Completada!</h2>
            <p className="text-muted-foreground">
              Has completado tu práctica de {type === 'favorites' ? 'operaciones favoritas' : 'todas las operaciones'}
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 text-center">
                <BarChart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalExercises}</p>
                <p className="text-sm text-muted-foreground">Ejercicios totales</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Precisión</p>
              </Card>
              
              <Card className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalCorrect}</p>
                <p className="text-sm text-muted-foreground">Respuestas correctas</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.timeFormatted}</p>
                <p className="text-sm text-muted-foreground">Tiempo total</p>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Resultados por operación:</h3>
            {Object.entries(session.results).map(([cardId, result]) => (
              <Card key={cardId} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{result.cardName}</p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {result.correct} correctas
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        {result.incorrect} incorrectas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {result.correct + result.incorrect > 0
                        ? Math.round((result.correct / (result.correct + result.incorrect)) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                multiPracticeStorage.clearSession();
                window.location.reload();
              }}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Nueva sesión
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!session || !currentExercise) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ejercicios disponibles</h3>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
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
          <Badge variant="secondary" className="gap-1">
            {type === 'favorites' ? <Star className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {type === 'favorites' ? 'Favoritas' : 'Todas'}
          </Badge>
          <Badge variant="secondary">
            {currentIndex + 1} / {session.exercises.length}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{session.totalCorrect} correctas</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2" />

      {/* Card info */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentExercise.cardColor && (
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: currentExercise.cardColor }}
              >
                <DynamicIcon 
                  name={currentExercise.cardIcon} 
                  className="text-white" 
                  size={20} 
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{currentExercise.cardTopic}</h2>
              <p className="text-sm text-muted-foreground">
                Dificultad: {currentExercise.difficulty}/10
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Intentos restantes</p>
            <p className="text-2xl font-bold text-primary">
              {currentExercise.attemptsPerExercise - attempts}
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
              const parsed = parseExerciseProblem(currentExercise.exercise.problem);
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
                    operationText={parsed.operation || currentExercise.exercise.problem}
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
            maxAttempts={currentExercise.attemptsPerExercise}
            showSolution={showSolution}
            solution={currentExercise.exercise.solution}
            hint={hint}
            feedback={feedback}
            isLastExercise={currentIndex === session.exercises.length - 1}
            autoCompensation={currentExercise.autoCompensation}
            cardId={currentExercise.cardId}
            hasModalOpen={false}
          />
        </div>
      </div>
    </div>
  );
}