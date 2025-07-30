'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Target, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  FileText,
  Home,
  Star,
  Zap,
  Award
} from 'lucide-react';
import { Achievement } from '@/lib/practice-history';
import { cn } from '@/lib/utils';

interface SessionSummaryProps {
  totalExercises: number;
  correctAnswers: number;
  totalTime: number; // in seconds
  cardName: string;
  cardTopic: string;
  achievements?: Achievement[];
  onReviewErrors: () => void;
  onNewSession: () => void;
  onBackToCards: () => void;
  onViewProgress: () => void;
}

export default function SessionSummary({
  totalExercises,
  correctAnswers,
  totalTime,
  cardName,
  cardTopic,
  achievements = [],
  onReviewErrors,
  onNewSession,
  onBackToCards,
  onViewProgress
}: SessionSummaryProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const accuracy = totalExercises > 0 ? (correctAnswers / totalExercises) * 100 : 0;
  const avgTimePerProblem = totalExercises > 0 ? Math.round(totalTime / totalExercises) : 0;
  const hasErrors = totalExercises > correctAnswers;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Determine performance level
  const getPerformanceLevel = () => {
    if (accuracy === 100) return { level: 'perfect', message: '¡Perfecto! 🌟', color: 'text-green-600' };
    if (accuracy >= 90) return { level: 'excellent', message: '¡Excelente! 🎯', color: 'text-green-500' };
    if (accuracy >= 80) return { level: 'great', message: '¡Muy bien! 👏', color: 'text-blue-600' };
    if (accuracy >= 70) return { level: 'good', message: '¡Bien hecho! 👍', color: 'text-blue-500' };
    if (accuracy >= 60) return { level: 'ok', message: 'Sigue practicando 💪', color: 'text-orange-500' };
    return { level: 'needsWork', message: 'No te rindas 🌈', color: 'text-orange-600' };
  };

  const performance = getPerformanceLevel();

  // Show celebration animation on mount for good performance
  useEffect(() => {
    if (accuracy >= 80) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [accuracy]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-8xl">🎉</div>
          </div>
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#42A5F5', '#FFB74D', '#66BB6A', '#EF5350'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Summary Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-orange-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-orange-500" />
            ¡Sesión Completada!
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-2">
            {cardName} - {cardTopic}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Message */}
          <div className="text-center">
            <p className={cn("text-3xl font-bold", performance.color)}>
              {performance.message}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Accuracy */}
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">{Math.round(accuracy)}%</p>
                <p className="text-sm text-muted-foreground">Precisión</p>
                <Progress value={accuracy} className="mt-2 h-3" />
              </CardContent>
            </Card>

            {/* Correct Answers */}
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {correctAnswers}/{totalExercises}
                </p>
                <p className="text-sm text-muted-foreground">Respuestas Correctas</p>
              </CardContent>
            </Card>

            {/* Time */}
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatTime(totalTime)}</p>
                <p className="text-sm text-muted-foreground">Tiempo Total</p>
              </CardContent>
            </Card>

            {/* Speed */}
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{avgTimePerProblem}s</p>
                <p className="text-sm text-muted-foreground">Por Problema</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  ¡Nuevos Logros Desbloqueados!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/70">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Award className="h-3 w-3 mr-1" />
                        Nuevo
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onViewProgress}
          size="lg"
          className="min-h-[60px] text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <FileText className="h-5 w-5" />
          Ver Resumen Detallado
        </Button>

        <Button
          onClick={onNewSession}
          size="lg"
          variant="secondary"
          className="min-h-[60px] text-lg font-semibold bg-secondary hover:bg-secondary/80 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          Practicar Más
        </Button>

        {hasErrors && (
          <Button
            onClick={onReviewErrors}
            size="lg"
            variant="outline"
            className="min-h-[60px] text-lg font-semibold border-2 border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Target className="h-5 w-5" />
            Revisar Errores
          </Button>
        )}

        <Button
          onClick={onBackToCards}
          size="lg"
          variant="outline"
          className={cn(
            "min-h-[60px] text-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
            hasErrors ? "" : "col-span-2"
          )}
        >
          <Home className="h-5 w-5" />
          Volver a Mis Tarjetas
        </Button>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-lg font-medium text-gray-700">
            {accuracy === 100 
              ? "¡Increíble! Eres un genio de las matemáticas 🧮"
              : accuracy >= 90
              ? "¡Casi perfecto! Sigue así y serás imparable 🚀"
              : accuracy >= 80
              ? "¡Muy bien! Tu esfuerzo está dando frutos 🌱"
              : accuracy >= 70
              ? "¡Buen trabajo! Cada práctica te hace más fuerte 💪"
              : "¡No te preocupes! Los grandes matemáticos también practican mucho 📚"}
          </p>
        </CardContent>
      </Card>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}