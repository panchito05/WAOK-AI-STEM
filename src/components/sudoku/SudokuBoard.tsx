'use client';

import { useState, useEffect, useRef } from 'react';
import { SudokuGameState, SudokuCell, SUDOKU_VARIANTS } from '@/lib/sudoku/types';

interface SudokuBoardProps {
  gameState: SudokuGameState;
  onCellClick: (row: number, col: number) => void;
  onValueChange: (row: number, col: number, value: number | null) => void;
  onNotesChange: (row: number, col: number, notes: number[]) => void;
  isNotesMode: boolean;
  highlightErrors: boolean;
  highlightSameNumbers: boolean;
}

export default function SudokuBoard({
  gameState,
  onCellClick,
  onValueChange,
  onNotesChange,
  isNotesMode,
  highlightErrors,
  highlightSameNumbers
}: SudokuBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const variant = SUDOKU_VARIANTS[gameState.variant];
  const size = variant.size;
  const boxSize = variant.boxSize;

  // Manejador de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.selectedCell) return;

      const { row, col } = gameState.selectedCell;
      const cell = gameState.board[row][col];

      // No permitir cambios en celdas pre-llenadas
      if (cell.isPreFilled) return;

      // Números del 1 al tamaño del tablero
      if (e.key >= '1' && e.key <= size.toString()) {
        const value = parseInt(e.key);
        if (isNotesMode) {
          const newNotes = [...cell.notes];
          if (newNotes.includes(value)) {
            newNotes.splice(newNotes.indexOf(value), 1);
          } else {
            newNotes.push(value);
          }
          onNotesChange(row, col, newNotes);
        } else {
          onValueChange(row, col, value);
        }
      }

      // Borrar con Delete o Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isNotesMode) {
          onNotesChange(row, col, []);
        } else {
          onValueChange(row, col, null);
        }
      }

      // Navegación con flechas
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(size - 1, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(size - 1, col + 1);
            break;
        }

        onCellClick(newRow, newCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isNotesMode, onCellClick, onValueChange, onNotesChange, size]);

  // Obtener el valor seleccionado para resaltado
  const selectedValue = gameState.selectedCell 
    ? gameState.board[gameState.selectedCell.row][gameState.selectedCell.col].value
    : null;

  // Calcular el tamaño de las celdas basado en el tamaño del tablero
  const getCellSize = () => {
    switch (size) {
      case 4: return 'h-20 w-20 text-2xl';
      case 6: return 'h-16 w-16 text-xl';
      case 9: return 'h-14 w-14 text-lg';
      default: return 'h-14 w-14 text-lg';
    }
  };

  // Obtener el color de fondo de la celda
  const getCellBackground = (cell: SudokuCell) => {
    const isSelected = gameState.selectedCell?.row === cell.row && 
                      gameState.selectedCell?.col === cell.col;
    const isHighlighted = highlightSameNumbers && cell.value === selectedValue && selectedValue !== null;
    const hasError = highlightErrors && !cell.isValid && cell.value !== null;

    if (isSelected) return 'bg-blue-200 border-blue-500';
    if (hasError) return 'bg-red-100 border-red-300';
    if (isHighlighted) return 'bg-blue-100';
    if (cell.isPreFilled) return 'bg-gray-100';
    if (hoveredCell?.row === cell.row || hoveredCell?.col === cell.col) return 'bg-gray-50';
    return 'bg-white hover:bg-gray-50';
  };

  // Obtener el grosor del borde para las cajas
  const getBorderStyle = (row: number, col: number) => {
    const borderClasses = [];
    
    // Bordes de las cajas (más gruesos)
    if (row % boxSize === 0 && row !== 0) {
      borderClasses.push('border-t-2 border-t-gray-700');
    }
    if (col % boxSize === 0 && col !== 0) {
      borderClasses.push('border-l-2 border-l-gray-700');
    }
    
    // Bordes externos
    if (row === 0) borderClasses.push('border-t-2 border-t-gray-700');
    if (col === 0) borderClasses.push('border-l-2 border-l-gray-700');
    if (row === size - 1) borderClasses.push('border-b-2 border-b-gray-700');
    if (col === size - 1) borderClasses.push('border-r-2 border-r-gray-700');
    
    return borderClasses.join(' ');
  };

  // Obtener clase de grid según el tamaño
  const getGridClass = (cols: number) => {
    const gridClasses: Record<number, string> = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      9: 'grid-cols-9'
    };
    return gridClasses[cols] || 'grid-cols-3';
  };

  // Renderizar las notas de una celda
  const renderNotes = (notes: number[]) => {
    if (notes.length === 0) return null;

    const notesGrid = Array(size).fill(null).map((_, i) => i + 1);
    const gridCols = Math.ceil(Math.sqrt(size));

    return (
      <div 
        className={`grid ${getGridClass(gridCols)} gap-0 w-full h-full p-1`}
        style={{ fontSize: size === 9 ? '0.5rem' : '0.6rem' }}
      >
        {notesGrid.map(num => (
          <div 
            key={num} 
            className={`flex items-center justify-center ${
              notes.includes(num) ? 'text-blue-600 font-bold' : 'text-transparent'
            }`}
          >
            {num}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div 
        ref={boardRef}
        className="inline-block border-2 border-gray-700 rounded-lg shadow-xl bg-white"
        style={{ padding: '2px' }}
      >
        <div className={`grid ${getGridClass(size)} gap-0`}>
          {gameState.board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredCell(null)}
                disabled={cell.isPreFilled}
                className={`
                  ${getCellSize()}
                  ${getCellBackground(cell)}
                  ${getBorderStyle(rowIndex, colIndex)}
                  border border-gray-300
                  flex items-center justify-center
                  font-bold
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
                  ${cell.isPreFilled ? 'cursor-default text-gray-700' : 'cursor-pointer text-blue-700'}
                  ${gameState.selectedCell?.row === rowIndex && gameState.selectedCell?.col === colIndex ? 'ring-2 ring-blue-500' : ''}
                  relative
                  hover:scale-95 active:scale-90
                `}
              >
                {cell.value ? (
                  <span
                    className={`
                      ${cell.isValid || !highlightErrors ? '' : 'text-red-600'}
                      animate-in fade-in zoom-in duration-200
                    `}
                  >
                    {cell.value}
                  </span>
                ) : (
                  renderNotes(cell.notes)
                )}
              </button>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}