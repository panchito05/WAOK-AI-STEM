'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  Calculator
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
}: AnswerPanelProps) {
  const [answer, setAnswer] = useState('');
  const [showNumpad, setShowNumpad] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
                disabled={showSolution}
                autoFocus
              />
              <Calculator 
                className="absolute right-4 top-4 h-6 w-6 text-muted-foreground cursor-pointer"
                onClick={() => setShowNumpad(!showNumpad)}
              />
            </div>

            <div className="flex gap-2">
              {!showSolution && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Revelar Respuesta
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!canSubmit || !answer.trim()}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                Verificar Respuesta
              </Button>
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

              <Button onClick={onNext} className="w-full">
                {isLastExercise ? 'Finalizar Sesión' : 'Siguiente Ejercicio'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Numpad */}
      {showNumpad && !showSolution && (
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