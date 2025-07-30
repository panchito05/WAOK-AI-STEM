'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { MazeCell, Direction, MazeGameState } from '@/lib/maze/types';
import { cn } from '@/lib/utils';

interface MazeBoardProps {
  gameState: MazeGameState;
  onMove: (direction: Direction) => void;
  fogOfWar?: boolean;
}

export function MazeBoard({ gameState, onMove, fogOfWar = false }: MazeBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const { maze, playerPosition, viewRadius = 2 } = gameState;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.completed || gameState.isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onMove('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onMove, gameState.completed, gameState.isPaused]);

  // Calculate if cell is visible in fog of war mode
  const isCellVisible = useCallback((row: number, col: number) => {
    if (!fogOfWar || !gameState.difficulty || gameState.difficulty !== 'hard') return true;
    
    // Use Euclidean distance for a more circular fog of war
    const dx = row - playerPosition.row;
    const dy = col - playerPosition.col;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= viewRadius;
  }, [fogOfWar, gameState.difficulty, playerPosition, viewRadius]);

  // Get cell styling based on type and state
  const getCellClassName = useCallback((cell: MazeCell) => {
    const isPlayer = playerPosition.row === cell.row && playerPosition.col === cell.col;
    const isVisible = isCellVisible(cell.row, cell.col);
    const isVisited = gameState.visitedCells.has(`${cell.row},${cell.col}`);
    
    // Base classes
    let classes = 'relative transition-all duration-200 rounded-sm ';
    
    // Fog of war effect
    if (!isVisible && fogOfWar && gameState.difficulty === 'hard') {
      classes += 'bg-gray-800 ';
      return classes;
    }
    
    // Cell type styling
    switch (cell.type) {
      case 'wall':
        classes += 'bg-gray-700 shadow-inner ';
        break;
      case 'empty':
        if (gameState.showingSolution && cell.isPath) {
          classes += 'bg-yellow-200 ';
        } else if (cell.isHint) {
          classes += 'bg-blue-200 animate-pulse ';
        } else if (isVisited && gameState.config?.showVisitedPath !== false) {
          classes += 'bg-blue-50 ';
        } else {
          classes += 'bg-white ';
        }
        break;
      case 'start':
        classes += 'bg-green-400 shadow-lg ';
        break;
      case 'end':
        classes += 'bg-yellow-400 shadow-lg ';
        break;
    }
    
    // Player styling
    if (isPlayer) {
      classes += 'ring-4 ring-blue-500 ring-offset-2 ';
    }
    
    return classes;
  }, [playerPosition, isCellVisible, gameState]);

  // Render cell content
  const renderCellContent = useCallback((cell: MazeCell) => {
    const isPlayer = playerPosition.row === cell.row && playerPosition.col === cell.col;
    const isVisible = isCellVisible(cell.row, cell.col);
    
    if (!isVisible && fogOfWar && gameState.difficulty === 'hard') {
      return null;
    }
    
    if (isPlayer) {
      return (
        <div className="absolute inset-0 flex items-center justify-center animate-bounce">
          <div className="w-3/4 h-3/4 bg-blue-500 rounded-full relative">
            {/* Eyes */}
            <div className="absolute top-1/4 left-1/4 w-1/6 h-1/6 bg-white rounded-full" />
            <div className="absolute top-1/4 right-1/4 w-1/6 h-1/6 bg-white rounded-full" />
            {/* Smile */}
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-1/3 h-1/6 border-b-2 border-white rounded-b-full" />
          </div>
        </div>
      );
    }
    
    if (cell.type === 'start') {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🏁
        </div>
      );
    }
    
    if (cell.type === 'end') {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
          ⭐
        </div>
      );
    }
    
    return null;
  }, [playerPosition, isCellVisible, fogOfWar, gameState.difficulty]);

  // Calculate grid size for responsive design
  const gridSize = maze.length;
  const cellSize = gridSize <= 10 ? 'w-12 h-12' : gridSize <= 15 ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div 
      ref={boardRef}
      className="relative bg-gray-100 p-4 rounded-xl shadow-2xl"
      tabIndex={0}
    >
      {/* Maze grid */}
      <div 
        className={cn(
          "grid gap-1 mx-auto",
          "transition-all duration-300"
        )}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: gridSize <= 10 ? '600px' : gridSize <= 15 ? '750px' : '900px'
        }}
      >
        {maze.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(cellSize, getCellClassName(cell))}
            >
              {renderCellContent(cell)}
            </div>
          ))
        )}
      </div>
      
      {/* Victory overlay */}
      {gameState.completed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">¡Lo lograste!</h2>
            <p className="text-lg text-gray-700">
              Completado en {gameState.moveCount} movimientos
            </p>
          </div>
        </div>
      )}
      
      {/* Pause overlay */}
      {gameState.isPaused && !gameState.completed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-center">
            <div className="text-4xl mb-2">⏸️</div>
            <h3 className="text-2xl font-bold text-gray-700">Juego Pausado</h3>
          </div>
        </div>
      )}
    </div>
  );
}