'use client';

import { useState, useEffect, useRef } from 'react';
import { TicTacToeGameState, Player, Cell } from '@/lib/tictactoe/types';
import { X, Circle } from 'lucide-react';

interface TicTacToeBoardProps {
  gameState: TicTacToeGameState;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
}

export default function TicTacToeBoard({
  gameState,
  onCellClick,
  disabled = false
}: TicTacToeBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [touchedCell, setTouchedCell] = useState<{ row: number; col: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { board, boardSize, winningLine, selectedCell, currentPlayer } = gameState;

  // Manejador de teclado para accesibilidad
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(boardSize - 1, row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(boardSize - 1, col + 1);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (board[row][col] === null) {
            onCellClick(row, col);
          }
          break;
      }

      if (newRow !== row || newCol !== col) {
        onCellClick(newRow, newCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, boardSize, board, onCellClick, disabled]);

  const isWinningCell = (row: number, col: number): boolean => {
    return winningLine?.some(cell => cell.row === row && cell.col === col) || false;
  };

  const getCellSize = (): string => {
    switch (boardSize) {
      case 3: return 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32';
      case 4: return 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28';
      case 5: return 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24';
      default: return 'w-24 h-24';
    }
  };

  const getIconSize = (): string => {
    switch (boardSize) {
      case 3: return 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16';
      case 4: return 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14';
      case 5: return 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12';
      default: return 'w-12 h-12';
    }
  };

  const renderCell = (row: number, col: number) => {
    const value = board[row][col];
    const isWinning = isWinningCell(row, col);
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;
    const isTouched = touchedCell?.row === row && touchedCell?.col === col;
    const isEmpty = value === null;
    const cellSize = getCellSize();
    const iconSize = getIconSize();

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      setTouchedCell({ row, col });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      e.preventDefault();
      if (touchedCell?.row === row && touchedCell?.col === col && isEmpty && !disabled) {
        onCellClick(row, col);
      }
      setTouchedCell(null);
    };

    return (
      <button
        key={`${row}-${col}`}
        className={`
          ${cellSize}
          relative
          bg-white
          border-4
          ${isWinning ? 'border-green-500 bg-green-50' : 'border-gray-300'}
          ${isSelected ? 'ring-4 ring-blue-400' : ''}
          ${isHovered && isEmpty && !disabled ? 'bg-blue-50' : ''}
          ${isTouched && isEmpty && !disabled ? 'bg-blue-100 scale-95' : ''}
          transition-all duration-200
          flex items-center justify-center
          ${isEmpty && !disabled ? 'cursor-pointer hover:bg-gray-50 active:scale-95' : 'cursor-default'}
          ${disabled ? 'opacity-60' : ''}
          rounded-lg
          shadow-sm
          focus:outline-none focus:ring-4 focus:ring-blue-400
        `}
        onClick={() => isEmpty && !disabled && onCellClick(row, col)}
        onMouseEnter={() => setHoveredCell({ row, col })}
        onMouseLeave={() => setHoveredCell(null)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled || !isEmpty}
        aria-label={`Celda ${row + 1}, ${col + 1}. ${
          value ? `Contiene ${value}` : 'Vacía'
        }${isWinning ? ' (Parte de la línea ganadora)' : ''}`}
        role="gridcell"
      >
        {value === 'X' && (
          <X 
            className={`
              ${iconSize}
              ${isWinning ? 'text-green-600' : 'text-blue-600'}
              stroke-[4]
              ${gameState.config.animationsEnabled ? 'animate-scale-in' : ''}
            `} 
          />
        )}
        {value === 'O' && (
          <Circle 
            className={`
              ${iconSize}
              ${isWinning ? 'text-green-600' : 'text-red-600'}
              stroke-[4]
              ${gameState.config.animationsEnabled ? 'animate-scale-in' : ''}
            `} 
          />
        )}
        {isEmpty && isHovered && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            {currentPlayer === 'X' ? (
              <X className={`${iconSize} text-blue-400 stroke-[3]`} />
            ) : (
              <Circle className={`${iconSize} text-red-400 stroke-[3]`} />
            )}
          </div>
        )}
      </button>
    );
  };

  const getGridGap = (): string => {
    switch (boardSize) {
      case 3: return 'gap-3';
      case 4: return 'gap-2';
      case 5: return 'gap-2';
      default: return 'gap-3';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Indicador de turno */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          {currentPlayer === 'X' ? (
            <X className="w-8 h-8 text-blue-600 stroke-[4]" />
          ) : (
            <Circle className="w-8 h-8 text-red-600 stroke-[4]" />
          )}
          <span className="text-2xl font-bold text-gray-700">
            Turno de {currentPlayer}
          </span>
        </div>
      </div>

      {/* Tablero */}
      <div
        ref={boardRef}
        className={`
          grid
          ${boardSize === 3 ? 'grid-cols-3' : ''}
          ${boardSize === 4 ? 'grid-cols-4' : ''}
          ${boardSize === 5 ? 'grid-cols-5' : ''}
          ${getGridGap()}
          p-4
          bg-gradient-to-br from-blue-100 to-purple-100
          rounded-xl
          shadow-lg
        `}
        role="grid"
        aria-label={`Tablero de Tres en línea ${boardSize}x${boardSize}`}
      >
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => renderCell(rowIndex, colIndex))
        )}
      </div>
    </div>
  );
}

// Estilos de animación (agregar a globals.css)
const animationStyles = `
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
`;