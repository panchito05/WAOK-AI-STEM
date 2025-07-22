'use client';

import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { usePracticeHistory } from '@/hooks/use-practice-history';
import { progressStats } from '@/lib/progress-stats';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProgressCharts() {
  const { recentSessions, dailyStats, operationStats } = usePracticeHistory();

  // Calculate weekly progress
  const weeklyProgress = useMemo(() => {
    return progressStats.getWeeklyProgress(recentSessions, 4);
  }, [recentSessions]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    return progressStats.getMonthlyTrends(recentSessions, 3);
  }, [recentSessions]);

  // Performance by time of day
  const timeOfDayPerformance = useMemo(() => {
    return progressStats.getPerformanceByTimeOfDay(recentSessions);
  }, [recentSessions]);

  // Operation distribution for pie chart
  const operationDistribution = useMemo(() => {
    return operationStats.map(stat => ({
      name: progressStats.getOperationName(stat.operationType),
      value: stat.totalExercises,
      accuracy: stat.accuracy
    }));
  }, [operationStats]);

  const chartConfig = {
    problems: {
      label: 'Problemas',
      color: 'hsl(var(--primary))',
    },
    accuracy: {
      label: 'Precisión',
      color: 'hsl(var(--accent))',
    },
  };

  return (
    <div className="space-y-6">
      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Diaria (Últimos 7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
                  }}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                  }}
                />
                <Bar 
                  dataKey="totalProblems" 
                  fill="var(--color-problems)" 
                  name="Problemas"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="correctProblems" 
                  fill="var(--color-accuracy)" 
                  name="Correctos"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalProblems" 
                    stroke="var(--color-problems)" 
                    strokeWidth={2}
                    name="Total Problemas"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="var(--color-accuracy)" 
                    strokeWidth={2}
                    name="Precisión %"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Operation Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Operación</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={operationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {operationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value} ejercicios (${props.payload.accuracy.toFixed(0)}% correcto)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyTrends.map((trend) => (
                <div key={trend.month} className="border rounded-lg p-4">
                  <h4 className="font-semibold capitalize mb-2">{trend.month}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio diario</span>
                      <span>{trend.avgProblemsPerDay.toFixed(1)} problemas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precisión</span>
                      <span className="text-green-600">{trend.avgAccuracy.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiempo total</span>
                      <span>{progressStats.formatTime(trend.totalTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Más practicada</span>
                      <span className="capitalize">{trend.mostPracticedOperation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance by Time of Day */}
      {timeOfDayPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Hora del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeOfDayPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="accuracy" 
                    fill="var(--color-accuracy)"
                    name="Precisión %"
                    radius={[4, 4, 4, 4]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Mejor momento para practicar: {
                timeOfDayPerformance.reduce((best, current) => 
                  current.accuracy > best.accuracy ? current : best
                ).time
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}