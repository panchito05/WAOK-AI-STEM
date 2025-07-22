'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Trash2, Calendar, TrendingUp, Award, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePracticeHistory } from '@/hooks/use-practice-history';
import { useRouter } from 'next/navigation';
import ProgressCharts from '@/components/ProgressCharts';
import SessionHistory from '@/components/SessionHistory';
import AchievementsList from '@/components/AchievementsList';
import { progressStats } from '@/lib/progress-stats';

export default function ProgressPage() {
  const router = useRouter();
  const { 
    recentSessions, 
    operationStats, 
    totalStats, 
    achievements,
    exportHistory,
    clearHistory,
    isLoading 
  } = usePracticeHistory();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Get progress analysis
  const analysis = progressStats.analyzeProgress(recentSessions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-headline text-primary">
              Historial de Progreso
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportHistory('csv')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportHistory('json')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar JSON
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Borrar Historial
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todo el historial de práctica y los logros. 
                    No se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-destructive">
                    Borrar Todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalStats.totalSessions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Problemas Resueltos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalStats.totalProblems}</p>
              <p className="text-sm text-muted-foreground">
                {totalStats.correctProblems} correctos ({totalStats.accuracy.toFixed(0)}%)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tiempo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {progressStats.formatTime(totalStats.totalTime)}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalStats.avgTimePerProblem.toFixed(1)} seg/problema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Racha Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold flex items-center gap-2">
                {totalStats.currentStreak} días
                {totalStats.currentStreak >= 7 && <Award className="h-5 w-5 text-yellow-500" />}
              </p>
              <p className="text-sm text-muted-foreground">
                Mejor: {totalStats.bestStreak} días
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Analysis */}
        {recentSessions.length >= 5 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Fortalezas</h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Áreas a Mejorar</h4>
                  <ul className="space-y-1">
                    {analysis.areasToImprove.map((area, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">!</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Recomendaciones</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tendencia de Velocidad:</span>
                  <span className={`capitalize ${
                    analysis.speedTrend === 'increasing' ? 'text-green-600' : 
                    analysis.speedTrend === 'decreasing' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {analysis.speedTrend === 'increasing' ? '↑ Mejorando' :
                     analysis.speedTrend === 'decreasing' ? '↓ Empeorando' :
                     '→ Estable'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tendencia de Precisión:</span>
                  <span className={`capitalize ${
                    analysis.accuracyTrend === 'increasing' ? 'text-green-600' : 
                    analysis.accuracyTrend === 'decreasing' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {analysis.accuracyTrend === 'increasing' ? '↑ Mejorando' :
                     analysis.accuracyTrend === 'decreasing' ? '↓ Empeorando' :
                     '→ Estable'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart className="h-4 w-4" />
              Vista General
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Por Operación
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Calendar className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="h-4 w-4" />
              Logros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ProgressCharts />
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operationStats.map((stat) => (
                <Card key={stat.operationType}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {progressStats.getOperationName(stat.operationType)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Ejercicios</span>
                        <span className="font-medium">{stat.totalExercises}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Precisión</span>
                        <span className="font-medium text-green-600">{stat.accuracy.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tiempo Promedio</span>
                        <span className="font-medium">{stat.avgTimePerProblem.toFixed(1)} seg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Mejor Racha</span>
                        <span className="font-medium">{stat.bestStreak} correctos</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Última Práctica</span>
                        <span className="font-medium text-xs">
                          {new Date(stat.lastPracticed).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <SessionHistory sessions={recentSessions} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <AchievementsList achievements={achievements} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}