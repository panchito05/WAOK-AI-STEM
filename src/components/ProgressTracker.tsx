'use client';

import { Award, BarChart, Flame, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { usePracticeHistory } from '@/hooks/use-practice-history';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  problems: {
    label: 'Problemas Resueltos',
    color: 'hsl(var(--accent))',
  },
};

export default function ProgressTracker() {
  const { dailyStats, totalStats, isLoading } = usePracticeHistory();

  // Transform daily stats for the chart
  const chartData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return dailyStats.map((stat, index) => {
      const date = new Date(stat.date);
      const dayIndex = date.getDay();
      return {
        day: days[dayIndex === 0 ? 6 : dayIndex - 1], // Adjust for Sunday
        problems: stat.totalProblems,
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      };
    });
  }, [dailyStats]);

  if (isLoading) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-xl">
            <Award className="h-6 w-6 text-primary" />
            Tu Progreso Increíble
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg col-span-2" />
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Calculate points (10 points per correct answer + bonuses)
  const points = totalStats.correctProblems * 10 + 
    (totalStats.currentStreak >= 7 ? 50 : 0) + 
    (totalStats.accuracy >= 90 ? 100 : 0);

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          <Award className="h-6 w-6 text-primary" />
          Tu Progreso Increíble
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between gap-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg border bg-card p-3 relative overflow-hidden">
            <div className="absolute top-1 right-1">
              <Target className="h-4 w-4 text-primary/30" />
            </div>
            <p className="text-2xl font-bold text-primary">{totalStats.totalProblems}</p>
            <p className="text-xs text-muted-foreground">Problemas Resueltos</p>
          </div>
          <div className="rounded-lg border bg-card p-3 relative overflow-hidden">
            <div className="absolute top-1 right-1">
              <Flame className="h-4 w-4 text-orange-500/30" />
            </div>
            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
              {totalStats.currentStreak}
              {totalStats.currentStreak >= 7 && <Trophy className="h-4 w-4 text-yellow-500" />}
            </p>
            <p className="text-xs text-muted-foreground">Días Seguidos</p>
          </div>
          <div className="rounded-lg border bg-card p-3 col-span-2 relative overflow-hidden">
            <div className="absolute top-1 right-1">
              <TrendingUp className="h-4 w-4 text-green-500/30" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <div>
                <p className="text-2xl font-bold text-primary flex items-center gap-1">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" /> {points}
                </p>
                <p className="text-xs text-muted-foreground">Puntos Ganados</p>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-green-600">{totalStats.accuracy.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Precisión</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="mb-2 text-sm font-semibold text-center">Actividad Semanal</h3>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="#888888" 
                    fontSize={12} 
                  />
                  <YAxis hide={true} />
                  <Tooltip 
                    cursor={false} 
                    content={<ChartTooltipContent hideLabel />} 
                    formatter={(value: number) => [`${value} problemas`, 'Resueltos']}
                  />
                  <Bar 
                    dataKey="problems" 
                    fill="var(--color-problems)" 
                    radius={4}
                    animationDuration={1000}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
              ¡Comienza a practicar para ver tu progreso!
            </div>
          )}
        </div>
        
        {/* Achievement hints */}
        {totalStats.currentStreak > 0 && totalStats.currentStreak < 7 && (
          <div className="text-xs text-center text-muted-foreground">
            ¡{7 - totalStats.currentStreak} días más para desbloquear el logro de semana completa! 🔥
          </div>
        )}
      </CardContent>
    </Card>
  );
}