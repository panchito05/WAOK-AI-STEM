'use client';

import { SudokuStats, SudokuVariant, SudokuDifficulty, SUDOKU_VARIANTS } from '@/lib/sudoku/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  Zap,
  AlertCircle,
  RotateCcw,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { sudokuStorage } from '@/lib/sudoku/storage';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

interface SudokuStatsProps {
  stats: SudokuStats;
  onStatsReset?: () => void;
}

export default function SudokuStats({ stats, onStatsReset }: SudokuStatsProps) {
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<SudokuVariant>('classic');

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionRate = (): number => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesCompleted / stats.gamesPlayed) * 100);
  };

  const getAverageHints = (): string => {
    if (stats.gamesCompleted === 0) return '0';
    return (stats.totalHintsUsed / stats.gamesCompleted).toFixed(1);
  };

  const getAverageErrors = (): string => {
    if (stats.gamesCompleted === 0) return '0';
    return (stats.totalErrors / stats.gamesCompleted).toFixed(1);
  };

  const handleReset = () => {
    sudokuStorage.resetStats();
    toast({
      title: 'Estadísticas reiniciadas',
      description: 'Todas tus estadísticas han sido borradas',
    });
    setShowResetDialog(false);
    onStatsReset?.();
  };

  const getDifficultyColor = (difficulty: SudokuDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
    }
  };

  const getStreakIcon = () => {
    if (stats.currentStreak >= 10) return '🔥';
    if (stats.currentStreak >= 5) return '⭐';
    if (stats.currentStreak >= 3) return '✨';
    return '🎯';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Estadísticas generales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Partidas Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gamesCompleted}</div>
              <Progress value={getCompletionRate()} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {getCompletionRate()}% de completación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Racha Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {stats.currentStreak} {getStreakIcon()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mejor racha: {stats.longestStreak}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Pistas Usadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHintsUsed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Promedio: {getAverageHints()} por partida
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Errores Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalErrors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Promedio: {getAverageErrors()} por partida
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mejores tiempos por variante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mejores Tiempos
            </CardTitle>
            <CardDescription>
              Tus récords personales por variante y dificultad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedVariant} onValueChange={(v) => setSelectedVariant(v as SudokuVariant)}>
              <TabsList className="grid w-full grid-cols-3">
                {Object.entries(SUDOKU_VARIANTS).map(([key, variant]) => (
                  <TabsTrigger key={key} value={key}>
                    {variant.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(SUDOKU_VARIANTS).map(([variantKey]) => (
                <TabsContent key={variantKey} value={variantKey} className="mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map((difficulty) => {
                      const bestTime = stats.bestTimes[variantKey as SudokuVariant][difficulty];
                      const avgTime = stats.averageTimes[variantKey as SudokuVariant][difficulty];
                      
                      return (
                        <Card key={difficulty} className="relative overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 w-full h-1 ${getDifficultyColor(difficulty)}`}
                          />
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm capitalize">{difficulty}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Mejor:</span>
                                <span className="font-mono font-bold">
                                  {formatTime(bestTime)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Promedio:</span>
                                <span className="font-mono text-sm">
                                  {formatTime(Math.round(avgTime))}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Logros y progreso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Logros
            </CardTitle>
            <CardDescription>
              Desbloquea logros completando desafíos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${stats.gamesCompleted >= 1 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Trophy className={`h-5 w-5 ${stats.gamesCompleted >= 1 ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">Primera Victoria</p>
                  <p className="text-xs text-muted-foreground">Completa tu primer sudoku</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${stats.gamesCompleted >= 10 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <BarChart3 className={`h-5 w-5 ${stats.gamesCompleted >= 10 ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">Veterano</p>
                  <p className="text-xs text-muted-foreground">Completa 10 sudokus</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${stats.longestStreak >= 5 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <Zap className={`h-5 w-5 ${stats.longestStreak >= 5 ? 'text-orange-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">En Racha</p>
                  <p className="text-xs text-muted-foreground">Mantén una racha de 5</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${stats.totalHintsUsed === 0 && stats.gamesCompleted > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Target className={`h-5 w-5 ${stats.totalHintsUsed === 0 && stats.gamesCompleted > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">Sin Ayuda</p>
                  <p className="text-xs text-muted-foreground">Completa sin usar pistas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${Object.values(stats.bestTimes.classic).some(t => t && t < 300) ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <Clock className={`h-5 w-5 ${Object.values(stats.bestTimes.classic).some(t => t && t < 300) ? 'text-purple-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">Veloz</p>
                  <p className="text-xs text-muted-foreground">Completa en menos de 5 min</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${stats.gamesCompleted >= 50 ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Award className={`h-5 w-5 ${stats.gamesCompleted >= 50 ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">Maestro Sudoku</p>
                  <p className="text-xs text-muted-foreground">Completa 50 sudokus</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Última partida */}
        {stats.lastPlayed && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Última Partida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(stats.lastPlayed).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Botón de reiniciar */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="text-red-600 hover:text-red-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar Estadísticas
          </Button>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reiniciar todas las estadísticas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará permanentemente todas tus estadísticas, mejores tiempos
              y logros. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
            >
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}