'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PracticeSession, ExerciseDetail } from '@/lib/practice-history';
import { progressStats } from '@/lib/progress-stats';
import { Badge } from '@/components/ui/badge';

interface SessionHistoryProps {
  sessions: PracticeSession[];
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  const toggleExpanded = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const getOperationColor = (operation: string) => {
    const colors: Record<string, string> = {
      suma: 'bg-blue-100 text-blue-800',
      resta: 'bg-red-100 text-red-800',
      multiplicacion: 'bg-purple-100 text-purple-800',
      division: 'bg-orange-100 text-orange-800',
      mixto: 'bg-green-100 text-green-800',
      otro: 'bg-gray-100 text-gray-800',
    };
    return colors[operation] || colors.otro;
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            No hay sesiones de práctica registradas aún. ¡Comienza a practicar para ver tu historial!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sessions.map((session) => {
          const accuracy = session.totalExercises > 0 
            ? (session.correctAnswers / session.totalExercises) * 100 
            : 0;
          const isExpanded = expandedSession === session.id;

          return (
            <Card key={session.id}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleExpanded(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {session.cardName}
                        <Badge className={getOperationColor(session.operationType)} variant="secondary">
                          {progressStats.getOperationName(session.operationType)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startedAt).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{session.totalExercises}</p>
                      <p className="text-muted-foreground">Ejercicios</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                        {accuracy.toFixed(0)}%
                      </p>
                      <p className="text-muted-foreground">Precisión</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {progressStats.formatTime(session.totalTimeSpent)}
                      </p>
                      <p className="text-muted-foreground">Duración</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Nivel de Dificultad</p>
                      <p className="font-medium">
                        {session.difficulty}
                        {session.adaptiveDifficulty && session.finalDifficulty && session.finalDifficulty !== session.difficulty && 
                          ` → ${session.finalDifficulty}`
                        }
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Tiempo Promedio</p>
                      <p className="font-medium">{session.avgTimePerProblem.toFixed(1)} seg/problema</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Mejor Racha</p>
                      <p className="font-medium">{session.consecutiveCorrect || 0} correctos</p>
                    </div>
                    {session.hintsUsed !== undefined && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Pistas Usadas</p>
                        <p className="font-medium">{session.hintsUsed}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedSession(session)}
                    className="w-full"
                  >
                    Ver Detalles Completos
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Exercise Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Detalles de la Sesión - {selectedSession?.cardName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Session Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {new Date(selectedSession.startedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duración</p>
                      <p className="font-medium">
                        {progressStats.formatTime(selectedSession.totalTimeSpent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Precisión</p>
                      <p className="font-medium">
                        {((selectedSession.correctAnswers / selectedSession.totalExercises) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dificultad</p>
                      <p className="font-medium">Nivel {selectedSession.difficulty}</p>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Ejercicios Realizados</h4>
                  {selectedSession.exercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-3 ${
                        exercise.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium flex items-center gap-2">
                            {exercise.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            Ejercicio {index + 1}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Problema:</span> {exercise.problem}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Tu respuesta:</span> {exercise.userAnswer || 'Sin respuesta'}
                          </p>
                          {!exercise.isCorrect && (
                            <p className="text-sm">
                              <span className="font-medium">Respuesta correcta:</span> {exercise.correctAnswer}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {exercise.attempts} {exercise.attempts === 1 ? 'intento' : 'intentos'}
                          </p>
                          <p className="text-muted-foreground">
                            {exercise.timeSpent} seg
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}