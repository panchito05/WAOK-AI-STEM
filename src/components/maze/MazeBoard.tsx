'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { MazeCell, Direction, MazeGameState } from '@/lib/maze/types';
import { Position } from '@/lib/maze/generator';
import { cn } from '@/lib/utils';
import { useMazeDrag } from '@/hooks/use-maze-drag';

interface MazeBoardProps {
  gameState: MazeGameState;
  onMove: (direction: Direction) => void;
  fogOfWar?: boolean;
}

export function MazeBoard({ gameState, onMove, fogOfWar = false }: MazeBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { maze, playerPosition, viewRadius = 2 } = gameState;
  
  // Calculate actual cell size based on grid size
  const gridSize = maze.length;
  const cellSizeMap = {
    10: 48, // w-12 h-12 = 48px
    15: 40, // w-10 h-10 = 40px
    25: 24, // w-6 h-6 = 24px
    35: 16, // w-4 h-4 = 16px
    45: 12, // w-3 h-3 = 12px
  };
  
  const getCellSizeInPixels = () => {
    if (gridSize <= 10) return cellSizeMap[10];
    if (gridSize <= 15) return cellSizeMap[15];
    if (gridSize <= 25) return cellSizeMap[25];
    if (gridSize <= 35) return cellSizeMap[35];
    return cellSizeMap[45];
  };
  
  // Helper function to validate moves
  const isValidMoveForDrag = useCallback((from: Position, to: Position): boolean => {
    // Check bounds
    if (to.row < 0 || to.row >= maze.length || to.col < 0 || to.col >= maze[0].length) {
      return false;
    }
    
    // Check if positions are adjacent
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    
    if (rowDiff + colDiff !== 1) {
      return false;
    }
    
    // Check if target is not a wall
    const targetCell = maze[to.row]?.[to.col];
    return targetCell && targetCell.type !== 'wall';
  }, [maze]);
  
  // Use drag hook
  const { isDragging, handleDragStart, getDragTransform } = useMazeDrag({
    playerPosition,
    onMove,
    isValidMove: isValidMoveForDrag,
    cellSize: getCellSizeInPixels(),
    gridElement: gridRef.current,
    isPaused: gameState.isPaused,
    isCompleted: gameState.completed,
  });

  // Handle cell click for movement
  const handleCellClick = useCallback((cellRow: number, cellCol: number) => {
    if (gameState.completed || gameState.isPaused) return;
    
    // Check if clicked cell is adjacent to player
    const rowDiff = cellRow - playerPosition.row;
    const colDiff = cellCol - playerPosition.col;
    
    // Must be exactly one cell away (not diagonal)
    if (Math.abs(rowDiff) + Math.abs(colDiff) !== 1) return;
    
    // Check if target cell is not a wall
    const targetCell = maze[cellRow]?.[cellCol];
    if (!targetCell || targetCell.type === 'wall') return;
    
    // Determine direction
    let direction: Direction;
    if (rowDiff === -1) direction = 'up';
    else if (rowDiff === 1) direction = 'down';
    else if (colDiff === -1) direction = 'left';
    else direction = 'right';
    
    onMove(direction);
  }, [gameState, playerPosition, maze, onMove]);

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

  // Check if a cell is clickable (adjacent and not a wall)
  const isCellClickable = useCallback((row: number, col: number) => {
    if (gameState.completed || gameState.isPaused) return false;
    
    const rowDiff = Math.abs(row - playerPosition.row);
    const colDiff = Math.abs(col - playerPosition.col);
    
    // Must be exactly one cell away (not diagonal)
    if (rowDiff + colDiff !== 1) return false;
    
    // Check if target cell is not a wall
    const targetCell = maze[row]?.[col];
    return targetCell && targetCell.type !== 'wall';
  }, [gameState, playerPosition, maze]);

  // Get cell styling based on type and state
  const getCellClassName = useCallback((cell: MazeCell) => {
    const isPlayer = playerPosition.row === cell.row && playerPosition.col === cell.col;
    const isVisible = isCellVisible(cell.row, cell.col);
    const isVisited = gameState.visitedCells.has(`${cell.row},${cell.col}`);
    const isClickable = isCellClickable(cell.row, cell.col);
    
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
          classes += 'bg-blue-200 border-blue-300 border ';
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
    
    // Clickable cell styling
    if (isClickable && !isPlayer) {
      classes += 'cursor-pointer hover:bg-green-100 hover:border-green-300 hover:border-2 ';
    }
    
    return classes;
  }, [playerPosition, isCellVisible, isCellClickable, gameState]);

  // Render cell content
  const renderCellContent = useCallback((cell: MazeCell) => {
    const isPlayer = playerPosition.row === cell.row && playerPosition.col === cell.col;
    const isVisible = isCellVisible(cell.row, cell.col);
    
    if (!isVisible && fogOfWar && gameState.difficulty === 'hard') {
      return null;
    }
    
    if (isPlayer) {
      const dragTransform = getDragTransform();
      const transform = dragTransform 
        ? `translate(${dragTransform.x}px, ${dragTransform.y}px) scale(${isDragging ? 1.1 : 1})`
        : 'scale(1)';
      
      return (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            !isDragging && "animate-bounce"
          )}
          style={{
            transform,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            zIndex: isDragging ? 50 : 10,
          }}
        >
          <div 
            className="w-3/4 h-3/4 bg-blue-500 rounded-full relative shadow-lg"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
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
  }, [playerPosition, isCellVisible, fogOfWar, gameState.difficulty, isDragging, handleDragStart, getDragTransform]);

  // Calculate cell size for responsive design - smaller cells for large mazes
  const cellSize = gridSize <= 10 ? 'w-12 h-12' : 
                   gridSize <= 15 ? 'w-10 h-10' : 
                   gridSize <= 25 ? 'w-6 h-6' : 
                   gridSize <= 35 ? 'w-4 h-4' :
                   'w-3 h-3'; // Extremely small cells for 45x45 maze

  return (
    <div 
      ref={boardRef}
      className="relative bg-gray-100 p-4 rounded-xl shadow-2xl"
      tabIndex={0}
    >
      {/* Maze grid */}
      <div 
        ref={gridRef}
        className={cn(
          "grid gap-1 mx-auto",
          "transition-all duration-300",
          isDragging && "select-none"
        )}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: gridSize <= 10 ? '600px' : 
                    gridSize <= 15 ? '750px' : 
                    gridSize <= 25 ? '800px' :
                    gridSize <= 35 ? '850px' :
                    '900px' // Maximum size for 45x45
        }}
      >
        {maze.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-cell
              data-row={rowIndex}
              data-col={colIndex}
              className={cn(
                cellSize, 
                getCellClassName(cell),
                "relative overflow-visible"
              )}
              onClick={() => handleCellClick(cell.row, cell.col)}
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