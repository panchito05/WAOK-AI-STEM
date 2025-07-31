'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Bot, 
  Timer,
  Target,
  Zap,
  Award
} from 'lucide-react';
import type { TicTacToeStats } from '@/lib/tictactoe/types';

interface TicTacToeStatsProps {
  stats: TicTacToeStats;
}

export default function TicTacToeStats({ stats }: TicTacToeStatsProps) {
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const winRate = stats.gamesPlayed > 0 
    ? Math.round(((stats.wins.X + stats.wins.O) / stats.gamesPlayed) * 100)
    : 0;

  const vsComputerWinRate = (stats.vsComputerWins + stats.vsComputerLosses) > 0
    ? Math.round((stats.vsComputerWins / (stats.vsComputerWins + stats.vsComputerLosses)) * 100)
    : 0;

  const vsHumanWinRate = (stats.vsHumanWins + stats.vsHumanLosses) > 0
    ? Math.round((stats.vsHumanWins / (stats.vsHumanWins + stats.vsHumanLosses)) * 100)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Estadísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen general */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{stats.gamesPlayed}</p>
            <p className="text-sm text-gray-600">Partidas Jugadas</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{winRate}%</p>
            <p className="text-sm text-gray-600">Tasa de Victoria</p>
          </div>
        </div>

        {/* Victorias por símbolo */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Victorias por Símbolo</p>
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-xl">X</span>
              <Badge variant="secondary">{stats.wins.X}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold text-xl">O</span>
              <Badge variant="secondary">{stats.wins.O}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">=</span>
              <Badge variant="secondary">{stats.draws}</Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas vs IA */}
        {stats.vsComputerWins + stats.vsComputerLosses > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-medium text-gray-700">Contra la IA</p>
            </div>
            <Progress value={vsComputerWinRate} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>V: {stats.vsComputerWins}</span>
              <span>{vsComputerWinRate}%</span>
              <span>D: {stats.vsComputerLosses}</span>
            </div>
          </div>
        )}

        {/* Estadísticas vs Humano */}
        {stats.vsHumanWins + stats.vsHumanLosses > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-gray-700">Contra Humanos</p>
            </div>
            <Progress value={vsHumanWinRate} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>V: {stats.vsHumanWins}</span>
              <span>{vsHumanWinRate}%</span>
              <span>D: {stats.vsHumanLosses}</span>
            </div>
          </div>
        )}

        {/* Logros */}
        <div className="border-t pt-4 space-y-3">
          {/* Racha actual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700">Racha Actual</span>
            </div>
            <Badge variant={stats.winStreak > 0 ? "default" : "secondary"}>
              {stats.winStreak}
            </Badge>
          </div>

          {/* Mejor racha */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">Mejor Racha</span>
            </div>
            <Badge variant="secondary">{stats.bestWinStreak}</Badge>
          </div>

          {/* Victoria más rápida */}
          {stats.fastestWin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Victoria Más Rápida</span>
              </div>
              <Badge variant="secondary">{formatTime(stats.fastestWin)}</Badge>
            </div>
          )}

          {/* Tiempo promedio */}
          {stats.averageGameTime > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">Tiempo Promedio</span>
              </div>
              <Badge variant="secondary">{formatTime(stats.averageGameTime)}</Badge>
            </div>
          )}
        </div>

        {/* Oponente favorito */}
        {stats.favoriteOpponent && (
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-gray-600">
              Prefieres jugar contra{' '}
              <span className="font-medium">
                {stats.favoriteOpponent === 'computer' ? 'la IA' : 'humanos'}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}