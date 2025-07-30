'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { userPreferences } from '@/lib/user-preferences';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Send, 
  Eye, 
  ChevronRight,
  Lightbulb,
  CheckCircle,
  XCircle,
  Calculator,
  ArrowLeft
} from 'lucide-react';

interface AnswerPanelProps {
  onSubmit: (answer: string) => void;
  onRevealSolution: () => void;
  onNext: () => void;
  attempts: number;
  maxAttempts: number;
  showSolution: boolean;
  solution?: string;
  hint?: string;
  isLastExercise: boolean;
  autoCompensation?: boolean;
  feedback?: {
    isCorrect: boolean;
    message: string;
  };
  cardId: string;
  hasModalOpen?: boolean;
  isReviewMode?: boolean;
  userAnswer?: string;
  onBackToActive?: () => void;
  currentIndex?: number;
  onPrevious?: () => void;
  timerSeconds?: number;
  timerPercentage?: number;
}

export default function AnswerPanel({
  onSubmit,
  onRevealSolution,
  onNext,
  attempts,
  maxAttempts,
  showSolution,
  solution,
  hint,
  isLastExercise,
  autoCompensation,
  feedback,
  cardId,
  hasModalOpen = false,
  isReviewMode = false,
  userAnswer,
  onBackToActive,
  currentIndex = 0,
  onPrevious,
  timerSeconds,
  timerPercentage,
}: AnswerPanelProps) {
  const [answer, setAnswer] = useState('');
  const [showNumpad, setShowNumpad] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Use userAnswer when in review mode
  useEffect(() => {
    if (isReviewMode && userAnswer !== undefined) {
      setAnswer(userAnswer);
    }
  }, [isReviewMode, userAnswer]);

  // Load auto-advance preference on mount
  useEffect(() => {
    const savedPreference = userPreferences.getAutoAdvance(cardId);
    setAutoAdvance(savedPreference);
  }, [cardId]);

  // Handle auto-advance preference change
  const handleAutoAdvanceChange = (checked: boolean) => {
    setAutoAdvance(checked);
    userPreferences.setAutoAdvance(cardId, checked);
  };

  // Auto-advance logic
  useEffect(() => {
    if (showSolution && feedback?.isCorrect && autoAdvance && !hasModalOpen && !isLastExercise) {
      // Start countdown
      let timeLeft = 3;
      setCountdown(timeLeft);
      
      const interval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          setCountdown(null);
          onNext();
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        setCountdown(null);
      };
    } else {
      setCountdown(null);
    }
  }, [showSolution, feedback?.isCorrect, autoAdvance, hasModalOpen, isLastExercise, onNext]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (answer.trim() && !showSolution) {
      onSubmit(answer);
      if (!feedback?.isCorrect) {
        setAnswer('');
      }
    }
  };

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setAnswer('');
    } else if (value === '←') {
      setAnswer(prev => prev.slice(0, -1));
    } else {
      setAnswer(prev => prev + value);
    }
  };

  const numpadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '0', '.', '/',
    '+', '-', '×',
    'C', '=', '←'
  ];

  const remainingAttempts = maxAttempts - attempts;
  const canSubmit = remainingAttempts > 0 && !showSolution;

  return (
    <div className="space-y-4">
      {/* Answer Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tu Respuesta</span>
            {timerSeconds !== undefined && timerSeconds > 0 && (
              <Badge 
                variant="secondary" 
                className={
                  timerPercentage && timerPercentage > 50 ? "bg-green-500 hover:bg-green-600 text-white" :
                  timerPercentage && timerPercentage > 25 ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                  "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                }
              >
                ⏱️ {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </Badge>
            )}
            <Badge variant={remainingAttempts > 1 ? 'default' : 'destructive'}>
              {remainingAttempts} {remainingAttempts === 1 ? 'intento' : 'intentos'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Escribe tu respuesta usando el teclado o el panel numérico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí"
                className="text-2xl font-mono h-14 pr-12"
                disabled={showSolution || isReviewMode}
                autoFocus
              />
              <Calculator 
                className="absolute right-4 top-4 h-6 w-6 text-muted-foreground cursor-pointer"
                onClick={() => setShowNumpad(!showNumpad)}
              />
            </div>

            <div className="flex gap-2">
              {currentIndex > 0 && onPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                  size="sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}
              
              {!isReviewMode && (
                <>
                  {!showSolution && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConfirmDialog(true)}
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Revelar
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={!canSubmit || !answer.trim()}
                    className="flex-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Verificar
                  </Button>
                </>
              )}
            </div>
          </form>

          {/* Feedback */}
          {feedback && (
            <Alert className={feedback.isCorrect ? 'border-green-500' : 'border-red-500'}>
              {feedback.isCorrect ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Hint */}
          {hint && !showSolution && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>{hint}</AlertDescription>
            </Alert>
          )}

          {/* Solution */}
          {showSolution && solution && (
            <div className="space-y-3">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <span className="font-semibold">Respuesta correcta:</span> {solution}
                </AlertDescription>
              </Alert>
              
              {hint && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Explicación:</h4>
                    <p className="text-blue-800">{hint}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <div className="flex w-full shadow-sm">
                  {!isLastExercise && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="flex items-center gap-2 bg-white/95 px-4 py-2 h-10 border border-r-0 border-primary/20 rounded-l-md hover:bg-gray-50 transition-colors cursor-pointer group"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAutoAdvanceChange(!autoAdvance);
                            }}
                          >
                            <Checkbox
                              id="auto-advance"
                              checked={autoAdvance}
                              onCheckedChange={handleAutoAdvanceChange}
                              className="h-4 w-4 border-2 border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white pointer-events-none"
                            />
                            <label
                              htmlFor="auto-advance"
                              className="text-sm font-medium select-none text-gray-700 group-hover:text-gray-900 pointer-events-none"
                            >
                              Auto Continue
                            </label>
                            <div className="w-px h-6 bg-gray-300 ml-1" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Avanzar automáticamente después de 3 segundos en respuestas correctas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <Button 
                    onClick={onNext}
                    className={`flex-1 h-10 ${!isLastExercise ? 'rounded-l-none' : ''}`}
                    disabled={countdown !== null}
                  >
                    {countdown !== null ? (
                      <>Continuando en {countdown}...</>
                    ) : (
                      <>
                        {isLastExercise ? 'Finalizar Sesión' : 'Siguiente Ejercicio'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Active button for review mode */}
      {isReviewMode && onBackToActive && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={onBackToActive}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              <ChevronRight className="mr-2 h-5 w-5" />
              Volver al Activo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Numpad */}
      {showNumpad && !showSolution && !isReviewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teclado Numérico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {numpadButtons.map((btn) => (
                <Button
                  key={btn}
                  variant={btn === 'C' ? 'destructive' : btn === '←' ? 'secondary' : 'outline'}
                  size="lg"
                  onClick={() => handleNumpadClick(btn)}
                  className="h-14 text-lg font-mono"
                  type="button"
                >
                  {btn}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revelar respuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres revelar la respuesta? Esto contará como un intento fallido.
              {autoCompensation && ' Se agregará un ejercicio adicional para compensar.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, seguir intentando</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                onRevealSolution();
              }}
            >
              Sí, revelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}