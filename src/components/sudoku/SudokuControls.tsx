'use client';

import { Button } from '@/components/ui/button';
import { 
  Eraser, 
  PenTool, 
  Lightbulb,
  Star,
  Sparkles
} from 'lucide-react';
import { SudokuVariant, SUDOKU_VARIANTS } from '@/lib/sudoku/types';
import { Badge } from '@/components/ui/badge';

interface SudokuControlsProps {
  variant: SudokuVariant;
  onNumberSelect: (num: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  isNotesMode: boolean;
  hintsLeft: number;
  numberCounts: Record<number, number>;
  maxNumberCount: number;
}

export default function SudokuControls({
  variant,
  onNumberSelect,
  onErase,
  onToggleNotes,
  onHint,
  isNotesMode,
  hintsLeft,
  numberCounts,
  maxNumberCount
}: SudokuControlsProps) {
  const size = SUDOKU_VARIANTS[variant].size;
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  // Calcular si un número está completo
  const isNumberComplete = (num: number) => {
    return (numberCounts[num] || 0) >= maxNumberCount;
  };

  // Obtener el color del botón según el progreso
  const getNumberButtonStyle = (num: number) => {
    const count = numberCounts[num] || 0;
    const progress = count / maxNumberCount;
    
    if (progress === 1) {
      return 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300';
    } else if (progress >= 0.7) {
      return 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300';
    }
    return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <div className="space-y-4 p-4">
      {/* Controles principales */}
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="transform transition-transform active:scale-95">
          <Button
            variant="outline"
            size="lg"
            onClick={onErase}
            className="min-w-[60px] h-14 text-lg font-bold border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
          >
            <Eraser className="h-5 w-5" />
          </Button>
        </div>

        <div className="transform transition-transform active:scale-95">
          <Button
            variant={isNotesMode ? "default" : "outline"}
            size="lg"
            onClick={onToggleNotes}
            className={`min-w-[120px] h-14 text-lg font-bold border-2 transition-all ${
              isNotesMode 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <PenTool className="h-5 w-5 mr-2" />
            Notas
          </Button>
        </div>

        <div className="transform transition-transform active:scale-95">
          <Button
            variant="outline"
            size="lg"
            onClick={onHint}
            disabled={hintsLeft === 0}
            className={`min-w-[120px] h-14 text-lg font-bold border-2 transition-all relative ${
              hintsLeft === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-600'
            }`}
          >
            <Lightbulb className="h-5 w-5 mr-2" />
            Pista
            {hintsLeft > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 font-bold"
              >
                {hintsLeft}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Botones de números */}
      <div className={`grid ${
        size === 4 ? 'grid-cols-4' : 
        size === 6 ? 'grid-cols-6' : 
        'grid-cols-5'
      } gap-2 max-w-md mx-auto`}>
        {numbers.map(num => {
          const count = numberCounts[num] || 0;
          const isComplete = isNumberComplete(num);
          
          return (
            <div
              key={num}
              className={`relative transform transition-transform ${isComplete ? '' : 'active:scale-90'}`}
            >
              <Button
                onClick={() => onNumberSelect(num)}
                disabled={isComplete}
                className={`
                  w-full h-16 text-2xl font-bold border-2 transition-all
                  ${getNumberButtonStyle(num)}
                  ${isComplete ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 active:scale-95'}
                  relative overflow-hidden
                `}
              >
                {/* Número */}
                <span className="relative z-10">{num}</span>
                
                {/* Indicador de progreso */}
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all duration-300"
                  style={{ width: `${(count / maxNumberCount) * 100}%` }}
                />
                
                {/* Badge de conteo */}
                <Badge 
                  variant="secondary" 
                  className={`absolute -top-1 -right-1 text-xs ${
                    isComplete 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {count}/{maxNumberCount}
                </Badge>

                {/* Animación de completado */}
                {isComplete && (
                  <div
                    className="absolute inset-0 flex items-center justify-center animate-ping"
                  >
                    <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Indicador de modo notas */}
      {isNotesMode && (
        <div
          className="flex items-center justify-center gap-2 text-purple-600 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Modo notas activado</span>
          <Sparkles className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}