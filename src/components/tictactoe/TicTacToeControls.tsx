'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Settings, 
  Pause, 
  Play, 
  Home, 
  Trophy,
  Timer,
  Users,
  Bot
} from 'lucide-react';
import { TicTacToeGameState } from '@/lib/tictactoe/types';

interface TicTacToeControlsProps {
  gameState: TicTacToeGameState;
  onReset: () => void;
  onNewGame: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onSettings?: () => void;
  timeLeft?: number;
}

export default function TicTacToeControls({
  gameState,
  onReset,
  onNewGame,
  onPause,
  onResume,
  onSettings,
  timeLeft
}: TicTacToeControlsProps) {
  const { gameStatus, isPaused, gameMode, config } = gameState;
  const isGameOver = gameStatus === 'win' || gameStatus === 'draw';

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Controles del Juego
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Modo de juego */}
        <div className="flex items-center justify-center gap-2 pb-2">
          {gameMode === 'pvp' ? (
            <>
              <Users className="w-5 h-5 text-blue-600" />
              <Badge variant="secondary" className="text-sm">
                Jugador vs Jugador
              </Badge>
            </>
          ) : (
            <>
              <Bot className="w-5 h-5 text-purple-600" />
              <Badge variant="secondary" className="text-sm">
                Jugador vs IA ({config.aiDifficulty === 'easy' ? 'Fácil' : 'Difícil'})
              </Badge>
            </>
          )}
        </div>

        {/* Timer (si está habilitado) */}
        {config.timerEnabled && timeLeft !== undefined && !isGameOver && (
          <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
            <Timer className="w-5 h-5 text-orange-600" />
            <span className="text-lg font-mono font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {/* Botones principales */}
        <div className="space-y-2">
          {!isGameOver && !isPaused && (
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reiniciar Partida
            </Button>
          )}

          {!isGameOver && onPause && onResume && (
            <Button
              onClick={isPaused ? onResume : onPause}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Continuar
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </>
              )}
            </Button>
          )}

          <Button
            onClick={onNewGame}
            variant={isGameOver ? "default" : "secondary"}
            className="w-full"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Nueva Partida
          </Button>

          {onSettings && (
            <Button
              onClick={onSettings}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
          )}
        </div>

        {/* Información adicional */}
        <div className="pt-4 border-t">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">Controles de teclado:</p>
            <p>Flechas: Mover</p>
            <p>Espacio/Enter: Marcar</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}