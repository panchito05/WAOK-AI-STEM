'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MazeBoard } from './MazeBoard';
import { MazeControls } from './MazeControls';
import { 
  MazeSize, 
  MazeDifficulty, 
  Direction, 
  MazeGameState,
  MazeCell,
  MAZE_SIZES,
  MAZE_DIFFICULTIES,
  DEFAULT_MAZE_CONFIG
} from '@/lib/maze/types';
import { generateMaze, isValidMove, coordinatesToKey } from '@/lib/maze/generator';
import { cloneMaze, updateMazeCells, clearMazeProperties } from '@/lib/maze/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MazeScreenProps {
  onBack?: () => void;
}

export function MazeScreen({ onBack }: MazeScreenProps) {
  const [selectedSize, setSelectedSize] = useState<MazeSize>('small');
  const [selectedDifficulty, setSelectedDifficulty] = useState<MazeDifficulty>('easy');
  const [gameState, setGameState] = useState<MazeGameState | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    const { maze, solution } = generateMaze(selectedSize, selectedDifficulty);
    
    // Find actual start and end positions from the maze
    let startPos = { row: 1, col: 1 };
    let endPos = { row: maze.length - 2, col: maze.length - 2 };
    
    // Search for actual start and end cells
    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < maze[row].length; col++) {
        if (maze[row][col].type === 'start') {
          startPos = { row, col };
        } else if (maze[row][col].type === 'end') {
          endPos = { row, col };
        }
      }
    }
    
    console.log('Game initialized with:', {
      startPos,
      endPos,
      mazeSize: `${maze.length}x${maze[0].length}`
    });
    
    // Deep clone the maze to ensure complete isolation from the generator
    const clonedMaze = cloneMaze(maze);
    
    const newGameState: MazeGameState = {
      id: `maze-${Date.now()}`,
      maze: clonedMaze,
      size: selectedSize,
      difficulty: selectedDifficulty,
      playerPosition: { ...startPos },
      startPosition: startPos,
      endPosition: endPos,
      moveCount: 0,
      hintsUsed: 0,
      config: DEFAULT_MAZE_CONFIG,
      startTime: Date.now(),
      isPaused: false,
      pausedTime: 0,
      completed: false,
      solution: solution.map(pos => ({ ...pos })), // Also clone solution positions
      visitedCells: new Set([coordinatesToKey(startPos.row, startPos.col)]),
      showingSolution: false,
      viewRadius: undefined // No fog of war anymore
    };
    
    setGameState(newGameState);
    setShowVictoryModal(false);
    setShowConfig(false);
  }, [selectedSize, selectedDifficulty]);

  // Este useEffect se removió porque causaba que el juego se iniciara automáticamente

  // Handle player movement
  const handleMove = useCallback((direction: Direction) => {
    if (!gameState || gameState.completed || gameState.isPaused) return;
    
    const directionDeltas = {
      up: { row: -1, col: 0 },
      down: { row: 1, col: 0 },
      left: { row: 0, col: -1 },
      right: { row: 0, col: 1 }
    };
    
    const delta = directionDeltas[direction];
    const newPosition = {
      row: gameState.playerPosition.row + delta.row,
      col: gameState.playerPosition.col + delta.col
    };
    
    if (isValidMove(gameState.maze, gameState.playerPosition, newPosition)) {
      const newVisitedCells = new Set(gameState.visitedCells);
      newVisitedCells.add(coordinatesToKey(newPosition.row, newPosition.col));
      
      // Debug logging
      console.log('Moving to:', newPosition);
      console.log('End position:', gameState.endPosition);
      console.log('Cell type at new position:', gameState.maze[newPosition.row][newPosition.col].type);
      
      const isCompleted = 
        newPosition.row === gameState.endPosition.row && 
        newPosition.col === gameState.endPosition.col;
      
      console.log('Is completed?', isCompleted);
      
      setGameState({
        ...gameState,
        playerPosition: newPosition,
        moveCount: gameState.moveCount + 1,
        visitedCells: newVisitedCells,
        completed: isCompleted,
        endTime: isCompleted ? Date.now() : undefined
      });
      
      if (isCompleted) {
        console.log('Victory! Showing modal...');
        setShowVictoryModal(true);
      }
    }
  }, [gameState]);

  // Reset player position
  const handleResetPosition = useCallback(() => {
    if (!gameState) return;
    
    setGameState({
      ...gameState,
      playerPosition: { ...gameState.startPosition },
      moveCount: 0,
      visitedCells: new Set([coordinatesToKey(gameState.startPosition.row, gameState.startPosition.col)]),
      hintsUsed: 0
    });
  }, [gameState]);

  // Toggle solution display
  const handleToggleSolution = useCallback(() => {
    if (!gameState) return;
    
    let newMaze: MazeCell[][];
    
    if (!gameState.showingSolution) {
      // Show solution - create updates for solution cells
      const updates = new Map<string, Partial<MazeCell>>();
      gameState.solution.forEach(pos => {
        updates.set(`${pos.row},${pos.col}`, { isPath: true });
      });
      
      // Clear any hints and apply solution path
      newMaze = clearMazeProperties(gameState.maze, ['isHint']);
      newMaze = updateMazeCells(newMaze, updates);
    } else {
      // Hide solution - clear path properties
      newMaze = clearMazeProperties(gameState.maze, ['isPath', 'isHint']);
    }
    
    setGameState({
      ...gameState,
      maze: newMaze,
      showingSolution: !gameState.showingSolution
    });
  }, [gameState]);

  // Use hint
  const handleUseHint = useCallback(() => {
    if (!gameState || gameState.hintsUsed >= DEFAULT_MAZE_CONFIG.maxHints) return;
    
    // Find next step in solution from current position
    const currentPosKey = coordinatesToKey(gameState.playerPosition.row, gameState.playerPosition.col);
    const currentIndex = gameState.solution.findIndex(
      pos => coordinatesToKey(pos.row, pos.col) === currentPosKey
    );
    
    if (currentIndex !== -1 && currentIndex < gameState.solution.length - 1) {
      // Collect hint positions
      const hintUpdates = new Map<string, Partial<MazeCell>>();
      for (let i = 1; i <= 3 && currentIndex + i < gameState.solution.length; i++) {
        const hintPos = gameState.solution[currentIndex + i];
        hintUpdates.set(`${hintPos.row},${hintPos.col}`, { isHint: true });
      }
      
      // Clear existing hints/paths and apply new hints
      let newMaze = clearMazeProperties(gameState.maze, ['isHint', 'isPath']);
      newMaze = updateMazeCells(newMaze, hintUpdates);
      
      setGameState({
        ...gameState,
        maze: newMaze,
        hintsUsed: gameState.hintsUsed + 1
      });
      
      // Clear hint after 3 seconds
      setTimeout(() => {
        setGameState(prev => {
          if (!prev) return null;
          // Clear hints using utility function
          const clearedMaze = clearMazeProperties(prev.maze, ['isHint']);
          return {
            ...prev,
            maze: clearedMaze
          };
        });
      }, 3000);
    }
  }, [gameState]);

  // Toggle pause
  const handleTogglePause = useCallback(() => {
    if (!gameState) return;
    
    if (gameState.isPaused) {
      // Resume
      setGameState({
        ...gameState,
        isPaused: false,
        pausedTime: gameState.pausedTime + (Date.now() - gameState.startTime)
      });
    } else {
      // Pause
      setGameState({
        ...gameState,
        isPaused: true,
        startTime: Date.now()
      });
    }
  }, [gameState]);

  // Removido el check de !gameState que no era necesario

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={onBack}
            className="text-lg font-semibold hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Laberinto Mágico
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Game Configuration */}
      {showConfig && (
        <Card className="max-w-4xl mx-auto mb-6 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Configura tu aventura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Tamaño del laberinto</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(MAZE_SIZES).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedSize === key ? "default" : "outline"}
                    onClick={() => setSelectedSize(key as MazeSize)}
                    className={cn(
                      "h-20 flex-col gap-1 transition-all",
                      selectedSize === key && "ring-2 ring-offset-2 ring-blue-500"
                    )}
                  >
                    <span className="text-lg font-bold">{config.name}</span>
                    <span className="text-xs opacity-80">{config.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Nivel de dificultad</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(MAZE_DIFFICULTIES).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedDifficulty === key ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty(key as MazeDifficulty)}
                    className={cn(
                      "h-20 flex-col gap-1 transition-all",
                      selectedDifficulty === key && "ring-2 ring-offset-2 ring-purple-500"
                    )}
                  >
                    <span className="text-lg font-bold">{config.name}</span>
                    <span className="text-xs opacity-80">{config.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              size="lg"
              onClick={initializeGame}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              🚀 ¡Comenzar Aventura!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Game Area */}
      {gameState && !showConfig && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr,400px] gap-6">
          {/* Maze Board */}
          <div className="flex items-center justify-center">
            <MazeBoard
              gameState={gameState}
              onMove={handleMove}
              fogOfWar={false}
            />
          </div>

          {/* Controls */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <MazeControls
              gameState={gameState}
              onMove={handleMove}
              onNewGame={initializeGame}
              onResetPosition={handleResetPosition}
              onToggleSolution={handleToggleSolution}
              onUseHint={handleUseHint}
              onTogglePause={handleTogglePause}
              maxHints={DEFAULT_MAZE_CONFIG.maxHints}
            />
          </div>
        </div>
      )}

      {/* Victory Modal */}
      <Dialog open={showVictoryModal} onOpenChange={setShowVictoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center text-green-600">
              🎉 ¡Felicitaciones! 🎉
            </DialogTitle>
            <DialogDescription>
              Has completado exitosamente el laberinto
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className="text-6xl animate-bounce">🏆</div>
            <div className="text-lg">
              <p className="font-semibold mb-2">¡Completaste el laberinto!</p>
              <div className="space-y-1 text-gray-700">
                <p>⏱️ Tiempo: {gameState ? Math.floor((gameState.endTime! - gameState.startTime - gameState.pausedTime) / 1000) : 0} segundos</p>
                <p>👣 Movimientos: {gameState?.moveCount || 0}</p>
                <p>💡 Pistas usadas: {gameState?.hintsUsed || 0}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={initializeGame}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Nuevo Laberinto
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowVictoryModal(false)}
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}