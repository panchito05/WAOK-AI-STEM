'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RefreshCw, 
  Trophy,
  Clock,
  AlertCircle,
  Grid3x3,
  Grid2x2,
  LayoutGrid,
  Star,
  Sparkles,
  Zap,
  Target,
  Medal
} from 'lucide-react';
import SudokuBoard from './SudokuBoard';
import SudokuControls from './SudokuControls';
import { 
  SudokuVariant, 
  SudokuDifficulty, 
  SudokuGameState, 
  SUDOKU_VARIANTS,
  SudokuConfig 
} from '@/lib/sudoku/types';
import { generateBoard, isValidMove, getHint } from '@/lib/sudoku/generator';
import { sudokuStorage } from '@/lib/sudoku/storage';
import { useProfile } from '@/contexts/ProfileContext';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'bg-green-500', icon: Star, description: 'Perfecto para principiantes' },
  medium: { label: 'Intermedio', color: 'bg-yellow-500', icon: Zap, description: 'Un desafío moderado' },
  hard: { label: 'Difícil', color: 'bg-red-500', icon: Target, description: 'Para expertos' }
};

export default function SudokuScreen() {
  const router = useRouter();
  const { currentProfile } = useProfile();
  const [gameState, setGameState] = useState<SudokuGameState | null>(null);
  const [showVariantSelector, setShowVariantSelector] = useState(true);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<SudokuVariant | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Configuración por defecto
  const defaultConfig: SudokuConfig = {
    variant: 'classic',
    difficulty: 'easy',
    showTimer: true,
    showErrors: true,
    allowHints: true,
    autoCheck: true,
    highlightSameNumbers: true,
    soundEnabled: true
  };

  // Cargar juego guardado al iniciar
  useEffect(() => {
    if (currentProfile) {
      const savedGame = sudokuStorage.getActiveGame();
      if (savedGame && !savedGame.completed) {
        setGameState(savedGame);
        setShowVariantSelector(false);
        setShowDifficultySelector(false);
      }
    }
  }, [currentProfile]);

  // Timer
  useEffect(() => {
    if (!gameState || gameState.isPaused || gameState.completed) return;

    const interval = setInterval(() => {
      setTimer(Date.now() - gameState.startTime - gameState.pausedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Guardar automáticamente el juego
  useEffect(() => {
    if (gameState && currentProfile && !gameState.completed) {
      sudokuStorage.saveGame(gameState);
    }
  }, [gameState, currentProfile]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const startNewGame = (variant: SudokuVariant, difficulty: SudokuDifficulty) => {
    if (!currentProfile) return;

    const puzzle = generateBoard(variant, difficulty);
    const newGame: SudokuGameState = {
      id: Date.now().toString(),
      board: puzzle.board,
      variant,
      difficulty,
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false,
      moveHistory: [],
      hintsUsed: 0,
      errorsCount: 0,
      completed: false,
      solution: puzzle.solution,
      config: { ...defaultConfig, variant, difficulty }
    };

    setGameState(newGame);
    setShowVariantSelector(false);
    setShowDifficultySelector(false);
    setIsNotesMode(false);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gameState.completed) return;

    setGameState({
      ...gameState,
      selectedCell: { row, col }
    });
  };

  const handleValueChange = (row: number, col: number, value: number | null) => {
    if (!gameState || gameState.completed) return;

    const cell = gameState.board[row][col];
    if (cell.isPreFilled) return;

    // Validar el movimiento
    const newBoard = [...gameState.board.map(row => [...row])];
    newBoard[row][col] = { ...cell, value };

    if (value !== null && gameState.config.autoCheck) {
      const isValid = isValidMove(newBoard, row, col, value, gameState.variant);
      newBoard[row][col].isValid = isValid;
      
      if (!isValid) {
        setGameState(prev => ({
          ...prev!,
          errorsCount: prev!.errorsCount + 1
        }));
      }
    }

    // Guardar el movimiento en el historial
    const move = {
      row,
      col,
      previousValue: cell.value,
      newValue: value,
      timestamp: Date.now()
    };

    const newGameState = {
      ...gameState,
      board: newBoard,
      moveHistory: [...gameState.moveHistory, move]
    };

    // Verificar si se completó el juego
    // Verificar si el juego está completo
    const isComplete = newBoard.every((row, rowIndex) => 
      row.every((cell, colIndex) => 
        cell.value === gameState.solution[rowIndex][colIndex]
      )
    );
    
    if (isComplete) {
      newGameState.completed = true;
      newGameState.endTime = Date.now();
      setShowConfetti(true);
      setShowVictoryModal(true);
      
      // Guardar estadísticas
      if (currentProfile) {
        const timeInSeconds = Math.floor((newGameState.endTime! - newGameState.startTime - newGameState.pausedTime) / 1000);
        sudokuStorage.recordGameCompletion(
          newGameState.variant,
          newGameState.difficulty,
          timeInSeconds,
          newGameState.hintsUsed,
          newGameState.errorsCount
        );
      }
    }

    setGameState(newGameState);
  };

  const handleNotesChange = (row: number, col: number, notes: number[]) => {
    if (!gameState || gameState.completed) return;

    const newBoard = [...gameState.board.map(row => [...row])];
    newBoard[row][col] = { ...newBoard[row][col], notes };

    setGameState({
      ...gameState,
      board: newBoard
    });
  };

  const handleErase = () => {
    if (!gameState || !gameState.selectedCell) return;

    const { row, col } = gameState.selectedCell;
    const cell = gameState.board[row][col];
    
    if (cell.isPreFilled) return;

    if (isNotesMode) {
      handleNotesChange(row, col, []);
    } else {
      handleValueChange(row, col, null);
    }
  };

  const handleHint = () => {
    if (!gameState || gameState.hintsUsed >= 3) return;

    const hint = getHint(gameState.board, gameState.solution);
    if (hint) {
      handleValueChange(hint.row, hint.col, hint.value);
      setGameState(prev => ({
        ...prev!,
        hintsUsed: prev!.hintsUsed + 1,
        selectedCell: { row: hint.row, col: hint.col }
      }));
    }
  };

  const handlePause = () => {
    if (!gameState || gameState.completed) return;

    setGameState({
      ...gameState,
      isPaused: true,
      pausedTime: gameState.pausedTime + (Date.now() - gameState.startTime)
    });
    setShowPauseModal(true);
  };

  const handleResume = () => {
    if (!gameState) return;

    setGameState({
      ...gameState,
      isPaused: false,
      startTime: Date.now()
    });
    setShowPauseModal(false);
  };

  const handleReset = () => {
    if (!gameState) return;

    const resetBoard = gameState.board.map(row =>
      row.map(cell => ({
        ...cell,
        value: cell.isPreFilled ? cell.value : null,
        notes: [],
        isValid: true
      }))
    );

    setGameState({
      ...gameState,
      board: resetBoard,
      moveHistory: [],
      hintsUsed: 0,
      errorsCount: 0,
      startTime: Date.now(),
      pausedTime: 0,
      selectedCell: undefined
    });
  };

  // Calcular conteo de números
  const getNumberCounts = () => {
    if (!gameState) return {};

    const counts: Record<number, number> = {};
    const size = SUDOKU_VARIANTS[gameState.variant].size;

    for (let i = 1; i <= size; i++) {
      counts[i] = 0;
    }

    gameState.board.forEach(row => {
      row.forEach(cell => {
        if (cell.value) {
          counts[cell.value]++;
        }
      });
    });

    return counts;
  };

  const maxNumberCount = gameState ? SUDOKU_VARIANTS[gameState.variant].size : 9;

  // Renderizar selector de variante
  if (showVariantSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Sudoku Matemático</h1>
            <p className="text-lg text-gray-600">Elige tu modo de juego favorito</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(SUDOKU_VARIANTS).map(([key, variant]) => {
              const IconComponent = 
                key === 'classic' ? Grid3x3 : 
                key === 'dosdoku-4' ? Grid2x2 : 
                LayoutGrid;

              return (
                <div
                  key={key}
                  className="transform transition-all hover:scale-105 active:scale-95"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all h-full"
                    onClick={() => {
                      setSelectedVariant(key as SudokuVariant);
                      setShowVariantSelector(false);
                      setShowDifficultySelector(true);
                    }}
                  >
                    <CardHeader className="text-center">
                      <div 
                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: variant.color }}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl">{variant.name}</CardTitle>
                      <CardDescription>{variant.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          {variant.size} × {variant.size}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar selector de dificultad
  if (showDifficultySelector && selectedVariant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowDifficultySelector(false);
              setShowVariantSelector(true);
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cambiar modo
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">
              {SUDOKU_VARIANTS[selectedVariant].name}
            </h1>
            <p className="text-lg text-gray-600">Selecciona el nivel de dificultad</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;

              return (
                <div
                  key={key}
                  className="transform transition-all hover:scale-105 active:scale-95"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all h-full"
                    onClick={() => startNewGame(selectedVariant, key as SudokuDifficulty)}
                  >
                    <CardHeader className="text-center">
                      <div 
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${config.color}`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl">{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar el juego
  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 overflow-hidden">
            {/* Efecto de confetti con CSS puro */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full animate-spin"
                  style={{
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                console.log('Navigating to home...');
                router.push('/');
              }}
              size="sm"
              className="relative z-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>

            <div className="flex items-center gap-6">
              {gameState.config.showTimer && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-mono font-bold">{formatTime(timer)}</span>
                </div>
              )}

              {gameState.config.showErrors && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-lg font-bold">{gameState.errorsCount}</span>
                </div>
              )}

              <Badge variant="secondary" className="text-sm">
                {DIFFICULTY_CONFIG[gameState.difficulty].label}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                disabled={gameState.completed}
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowVariantSelector(true);
                  setGameState(null);
                }}
              >
                Nueva Partida
              </Button>
            </div>
          </div>
        </div>

        {/* Área principal del juego */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tablero */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
            <SudokuBoard
              gameState={gameState}
              onCellClick={handleCellClick}
              onValueChange={handleValueChange}
              onNotesChange={handleNotesChange}
              isNotesMode={isNotesMode}
              highlightErrors={gameState.config.autoCheck}
              highlightSameNumbers={gameState.config.highlightSameNumbers}
            />
          </div>

          {/* Controles */}
          <div className="bg-white rounded-lg shadow-lg">
            <SudokuControls
              variant={gameState.variant}
              onNumberSelect={(num) => {
                if (gameState.selectedCell) {
                  const { row, col } = gameState.selectedCell;
                  if (isNotesMode) {
                    const cell = gameState.board[row][col];
                    const newNotes = [...cell.notes];
                    if (newNotes.includes(num)) {
                      newNotes.splice(newNotes.indexOf(num), 1);
                    } else {
                      newNotes.push(num);
                    }
                    handleNotesChange(row, col, newNotes);
                  } else {
                    handleValueChange(row, col, num);
                  }
                }
              }}
              onErase={handleErase}
              onToggleNotes={() => setIsNotesMode(!isNotesMode)}
              onHint={handleHint}
              isNotesMode={isNotesMode}
              hintsLeft={3 - gameState.hintsUsed}
              numberCounts={getNumberCounts()}
              maxNumberCount={maxNumberCount}
            />
          </div>
        </div>
      </div>

      {/* Modal de Victoria */}
      <Dialog open={showVictoryModal} onOpenChange={setShowVictoryModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-green-600 mb-4">
              ¡Felicitaciones! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Trophy className="h-20 w-20 mx-auto text-yellow-400" />
            <DialogDescription className="text-lg">
              ¡Has completado el Sudoku!
            </DialogDescription>
            
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-bold">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span>Errores:</span>
                <span className="font-bold">{gameState.errorsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Pistas usadas:</span>
                <span className="font-bold">{gameState.hintsUsed}/3</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button
                onClick={() => {
                  setShowVictoryModal(false);
                  setShowConfetti(false);
                  handleReset();
                }}
              >
                Jugar de nuevo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVictoryModal(false);
                  setShowConfetti(false);
                  setShowVariantSelector(true);
                  setGameState(null);
                }}
              >
                Nuevo juego
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Pausa */}
      <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              Juego Pausado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Pause className="h-16 w-16 mx-auto text-blue-500" />
            <DialogDescription>
              Tu progreso ha sido guardado
            </DialogDescription>
            <Button onClick={handleResume} size="lg" className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}