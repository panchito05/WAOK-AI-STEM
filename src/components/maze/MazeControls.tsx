'use client';

import React from 'react';
import { Direction, MazeGameState } from '@/lib/maze/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Plus, Eye, EyeOff, Lightbulb, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MazeControlsProps {
  gameState: MazeGameState;
  onMove: (direction: Direction) => void;
  onNewGame: () => void;
  onResetPosition: () => void;
  onToggleSolution: () => void;
  onUseHint: () => void;
  onTogglePause: () => void;
  maxHints?: number;
}

export function MazeControls({
  gameState,
  onMove,
  onNewGame,
  onResetPosition,
  onToggleSolution,
  onUseHint,
  onTogglePause,
  maxHints = 3
}: MazeControlsProps) {
  const { moveCount, hintsUsed, isPaused, completed, showingSolution } = gameState;
  
  // Calculate elapsed time
  const calculateElapsedTime = () => {
    if (!gameState.startTime) return 0;
    const endTime = gameState.endTime || Date.now();
    const elapsed = endTime - gameState.startTime - gameState.pausedTime;
    return Math.floor(elapsed / 1000);
  };
  
  const elapsedSeconds = calculateElapsedTime();
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  
  const hintsRemaining = maxHints - hintsUsed;

  return (
    <div className="space-y-4">
      {/* Stats Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-1">⏱️</div>
              <div className="text-sm text-gray-600">Tiempo</div>
              <div className="text-xl font-bold text-blue-600">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>
            <div>
              <div className="text-3xl mb-1">👣</div>
              <div className="text-sm text-gray-600">Movimientos</div>
              <div className="text-xl font-bold text-purple-600">{moveCount}</div>
            </div>
            <div>
              <div className="text-3xl mb-1">💡</div>
              <div className="text-sm text-gray-600">Pistas</div>
              <div className="text-xl font-bold text-orange-600">{hintsRemaining}/{maxHints}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direction Controls */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            <div></div>
            <Button
              size="lg"
              variant="default"
              onClick={() => onMove('up')}
              disabled={isPaused || completed}
              className="h-16 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronUp className="w-8 h-8" />
            </Button>
            <div></div>
            
            <Button
              size="lg"
              variant="default"
              onClick={() => onMove('left')}
              disabled={isPaused || completed}
              className="h-16 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-300 rounded-full animate-pulse" />
            </div>
            <Button
              size="lg"
              variant="default"
              onClick={() => onMove('right')}
              disabled={isPaused || completed}
              className="h-16 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
            
            <div></div>
            <Button
              size="lg"
              variant="default"
              onClick={() => onMove('down')}
              disabled={isPaused || completed}
              className="h-16 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronDown className="w-8 h-8" />
            </Button>
            <div></div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={onUseHint}
          disabled={hintsRemaining === 0 || isPaused || completed || showingSolution}
          className={cn(
            "h-14 font-semibold text-lg border-2 transition-all",
            "hover:scale-105 active:scale-95",
            hintsRemaining > 0 
              ? "border-orange-400 text-orange-600 hover:bg-orange-50" 
              : "border-gray-300 text-gray-400"
          )}
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          Pista ({hintsRemaining})
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={onToggleSolution}
          disabled={completed}
          className={cn(
            "h-14 font-semibold text-lg border-2 transition-all",
            "hover:scale-105 active:scale-95",
            showingSolution
              ? "border-red-400 text-red-600 hover:bg-red-50"
              : "border-purple-400 text-purple-600 hover:bg-purple-50"
          )}
        >
          {showingSolution ? (
            <>
              <EyeOff className="w-5 h-5 mr-2" />
              Ocultar
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 mr-2" />
              Solución
            </>
          )}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={onResetPosition}
          disabled={isPaused || completed}
          className="h-14 font-semibold text-lg border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reiniciar Pos.
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={onTogglePause}
          disabled={completed}
          className={cn(
            "h-14 font-semibold text-lg border-2 transition-all",
            "hover:scale-105 active:scale-95",
            isPaused
              ? "border-green-400 text-green-600 hover:bg-green-50"
              : "border-gray-400 text-gray-600 hover:bg-gray-50"
          )}
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5 mr-2" />
              Continuar
            </>
          ) : (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pausar
            </>
          )}
        </Button>
      </div>

      {/* New Game Button */}
      <Button
        size="lg"
        onClick={onNewGame}
        className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6 mr-2" />
        Nuevo Laberinto
      </Button>
    </div>
  );
}