'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Trophy, 
  X as XIcon, 
  Circle,
  Sparkles,
  Users,
  Bot,
  Grid3x3,
  Zap,
  Target
} from 'lucide-react';
import TicTacToeBoard from './TicTacToeBoard';
import TicTacToeControls from './TicTacToeControls';
import TicTacToeStats from './TicTacToeStats';
import TicTacToeSettings from './TicTacToeSettings';
import { 
  TicTacToeGameState, 
  TicTacToeConfig, 
  GameMode, 
  BoardSize,
  Player,
  GameResult
} from '@/lib/tictactoe/types';
import { 
  createEmptyBoard, 
  makeMove, 
  checkWinner, 
  isBoardFull,
  switchPlayer
} from '@/lib/tictactoe/generator';
import { getAIMove } from '@/lib/tictactoe/ai';
import { tictactoeStorage } from '@/lib/tictactoe/storage';
import { useProfile } from '@/contexts/ProfileContext';

interface TicTacToeScreenProps {
  onBack?: () => void;
}

const GAME_MODES = [
  {
    id: 'pvp' as GameMode,
    name: 'Jugador vs Jugador',
    description: 'Juega con un amigo',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'pvc' as GameMode,
    name: 'Jugador vs Computadora',
    description: 'Desafía a la IA',
    icon: Bot,
    color: 'bg-purple-500'
  }
];

const BOARD_SIZES = [
  {
    size: 3 as BoardSize,
    name: '3×3',
    description: 'Clásico',
    icon: Grid3x3,
    color: 'bg-green-500'
  },
  {
    size: 4 as BoardSize,
    name: '4×4',
    description: 'Intermedio',
    icon: Zap,
    color: 'bg-yellow-500'
  },
  {
    size: 5 as BoardSize,
    name: '5×5',
    description: 'Avanzado',
    icon: Target,
    color: 'bg-red-500'
  }
];

export default function TicTacToeScreen({ onBack }: TicTacToeScreenProps) {
  const router = useRouter();
  const { currentProfile } = useProfile();
  const [gameState, setGameState] = useState<TicTacToeGameState | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<Player>('X');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stats, setStats] = useState(tictactoeStorage.getStats());

  // Configuración por defecto
  const defaultConfig: TicTacToeConfig = {
    boardSize: 3,
    gameMode: 'pvp',
    aiDifficulty: 'easy',
    firstPlayer: 'X',
    timerEnabled: false,
    timerSeconds: 30,
    soundEnabled: true,
    animationsEnabled: true
  };

  // Timer por turno
  useEffect(() => {
    if (!gameState || !gameState.config.timerEnabled || gameState.isPaused || gameState.gameStatus !== 'playing') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Tiempo agotado, cambiar turno
          handleTimeout();
          return gameState.config.timerSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.currentPlayer, gameState?.isPaused, gameState?.gameStatus]);

  // Manejar movimientos de la IA
  useEffect(() => {
    if (!gameState || 
        gameState.gameMode !== 'pvc' || 
        gameState.currentPlayer === playerSymbol ||
        gameState.gameStatus !== 'playing' ||
        gameState.isPaused) {
      return;
    }

    // Retraso para hacer la IA más natural
    const aiDelay = setTimeout(() => {
      const aiMove = getAIMove(
        gameState.board,
        gameState.currentPlayer,
        gameState.config.aiDifficulty
      );

      if (aiMove) {
        handleCellClick(aiMove.row, aiMove.col);
      }
    }, 500 + Math.random() * 500); // 0.5-1s de retraso

    return () => clearTimeout(aiDelay);
  }, [gameState?.currentPlayer, gameState?.gameStatus]);

  const handleTimeout = () => {
    if (!gameState) return;
    
    // Cambiar turno sin hacer movimiento
    setGameState({
      ...gameState,
      currentPlayer: switchPlayer(gameState.currentPlayer)
    });
  };

  const startNewGame = (mode: GameMode, size: BoardSize, config?: TicTacToeConfig) => {
    const finalConfig = config || { ...defaultConfig, gameMode: mode, boardSize: size };
    
    // Determinar quién empieza
    let firstPlayer: Player = 'X';
    if (finalConfig.firstPlayer === 'random') {
      firstPlayer = Math.random() < 0.5 ? 'X' : 'O';
    } else if (finalConfig.firstPlayer === 'O') {
      firstPlayer = 'O';
    }

    // En modo vs IA, el jugador siempre es X por simplicidad
    if (mode === 'pvc') {
      setPlayerSymbol('X');
    }

    const newGame: TicTacToeGameState = {
      id: Date.now().toString(),
      board: createEmptyBoard(size),
      boardSize: size,
      currentPlayer: firstPlayer,
      gameMode: mode,
      gameStatus: 'playing',
      winner: null,
      winningLine: null,
      moves: [],
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false,
      config: finalConfig
    };

    setGameState(newGame);
    setShowModeSelector(false);
    setShowSizeSelector(false);
    setTimeLeft(finalConfig.timerSeconds);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gameState.gameStatus !== 'playing' || gameState.isPaused) return;
    
    const cell = gameState.board[row][col];
    if (cell !== null) return;

    // En modo vs IA, verificar que es el turno del jugador
    if (gameState.gameMode === 'pvc' && gameState.currentPlayer !== playerSymbol) return;

    // Hacer el movimiento
    const newBoard = makeMove(gameState.board, row, col, gameState.currentPlayer);
    const move = {
      row,
      col,
      player: gameState.currentPlayer,
      timestamp: Date.now()
    };

    // Verificar victoria
    const { winner, winningLine } = checkWinner(newBoard, { row, col });
    const isDraw = !winner && isBoardFull(newBoard);

    const newGameState: TicTacToeGameState = {
      ...gameState,
      board: newBoard,
      moves: [...gameState.moves, move],
      currentPlayer: winner || isDraw ? gameState.currentPlayer : switchPlayer(gameState.currentPlayer),
      gameStatus: winner ? 'win' : isDraw ? 'draw' : 'playing',
      winner,
      winningLine,
      selectedCell: { row, col },
      endTime: winner || isDraw ? Date.now() : undefined
    };

    setGameState(newGameState);

    // Resetear timer
    if (gameState.config.timerEnabled && !winner && !isDraw) {
      setTimeLeft(gameState.config.timerSeconds);
    }

    // Manejar fin del juego
    if (winner || isDraw) {
      handleGameEnd(newGameState);
    }
  };

  const handleGameEnd = (finalState: TicTacToeGameState) => {
    const gameTime = (finalState.endTime || Date.now()) - finalState.startTime - finalState.pausedTime;
    
    const result: GameResult = {
      winner: finalState.winner,
      winningLine: finalState.winningLine,
      gameTime,
      moves: finalState.moves.length,
      gameMode: finalState.gameMode,
      boardSize: finalState.boardSize,
      aiDifficulty: finalState.config.aiDifficulty
    };

    // Guardar estadísticas
    tictactoeStorage.recordGameResult(result, playerSymbol);
    setStats(tictactoeStorage.getStats());

    // Mostrar modal apropiado
    if (finalState.winner) {
      setShowConfetti(true);
      setShowVictoryModal(true);
    } else {
      setShowDrawModal(true);
    }
  };

  const handleReset = () => {
    if (!gameState) return;

    const newGame: TicTacToeGameState = {
      ...gameState,
      board: createEmptyBoard(gameState.boardSize),
      currentPlayer: gameState.config.firstPlayer === 'random' 
        ? (Math.random() < 0.5 ? 'X' : 'O')
        : gameState.config.firstPlayer,
      gameStatus: 'playing',
      winner: null,
      winningLine: null,
      moves: [],
      startTime: Date.now(),
      endTime: undefined,
      pausedTime: 0,
      isPaused: false,
      selectedCell: undefined
    };

    setGameState(newGame);
    setTimeLeft(gameState.config.timerSeconds);
    setShowVictoryModal(false);
    setShowDrawModal(false);
    setShowConfetti(false);
  };

  const handleNewGame = () => {
    setGameState(null);
    setShowModeSelector(true);
    setShowSizeSelector(false);
    setShowVictoryModal(false);
    setShowDrawModal(false);
    setShowConfetti(false);
    setSelectedMode(null);
  };

  const handlePause = () => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    setGameState({
      ...gameState,
      isPaused: true,
      pausedTime: gameState.pausedTime + (Date.now() - gameState.startTime)
    });
  };

  const handleResume = () => {
    if (!gameState) return;
    
    setGameState({
      ...gameState,
      isPaused: false,
      startTime: Date.now()
    });
  };

  const handleConfigChange = (newConfig: TicTacToeConfig) => {
    if (!gameState) return;
    
    setGameState({
      ...gameState,
      config: newConfig
    });
  };

  const handleConfigApply = () => {
    setShowSettings(false);
    if (gameState && (
      gameState.config.boardSize !== gameState.boardSize ||
      gameState.config.gameMode !== gameState.gameMode
    )) {
      // Si cambiaron el tamaño o modo, reiniciar
      startNewGame(gameState.config.gameMode, gameState.config.boardSize, gameState.config);
    }
  };

  // Renderizar selector de modo
  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                router.push('/');
              }
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Tres en Línea</h1>
            <p className="text-lg text-gray-600">Elige tu modo de juego</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {GAME_MODES.map((mode) => {
              const IconComponent = mode.icon;
              
              return (
                <div
                  key={mode.id}
                  className="transform transition-all hover:scale-105 active:scale-95"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all h-full"
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setShowModeSelector(false);
                      setShowSizeSelector(true);
                    }}
                  >
                    <CardHeader className="text-center">
                      <div 
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${mode.color}`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl">{mode.name}</CardTitle>
                      <CardDescription>{mode.description}</CardDescription>
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

  // Renderizar selector de tamaño
  if (showSizeSelector && selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowSizeSelector(false);
              setShowModeSelector(true);
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cambiar modo
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Tamaño del Tablero</h1>
            <p className="text-lg text-gray-600">Selecciona la dificultad</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {BOARD_SIZES.map((size) => {
              const IconComponent = size.icon;
              
              return (
                <div
                  key={size.size}
                  className="transform transition-all hover:scale-105 active:scale-95"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all h-full"
                    onClick={() => startNewGame(selectedMode, size.size)}
                  >
                    <CardHeader className="text-center">
                      <div 
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${size.color}`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl">{size.name}</CardTitle>
                      <CardDescription>{size.description}</CardDescription>
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

  // Renderizar configuración
  if (showSettings && gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <TicTacToeSettings
          config={gameState.config}
          onConfigChange={handleConfigChange}
          onClose={() => setShowSettings(false)}
          onApply={handleConfigApply}
        />
      </div>
    );
  }

  // Renderizar el juego
  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 overflow-hidden">
            {/* Efecto de confetti */}
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
                  className="w-3 h-3 rounded-full animate-spin"
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                router.push('/');
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold text-blue-700">Tres en Línea</h1>

          <div className="w-20" /> {/* Spacer para centrar el título */}
        </div>

        {/* Área principal del juego */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tablero */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-6">
                <TicTacToeBoard
                  gameState={gameState}
                  onCellClick={handleCellClick}
                  disabled={gameState.isPaused || gameState.gameStatus !== 'playing'}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Controles */}
            <TicTacToeControls
              gameState={gameState}
              onReset={handleReset}
              onNewGame={handleNewGame}
              onPause={handlePause}
              onResume={handleResume}
              onSettings={() => setShowSettings(true)}
              timeLeft={gameState.config.timerEnabled ? timeLeft : undefined}
            />

            {/* Estadísticas */}
            <TicTacToeStats stats={stats} />
          </div>
        </div>
      </div>

      {/* Modal de Victoria */}
      <Dialog open={showVictoryModal} onOpenChange={setShowVictoryModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-green-600 mb-4">
              ¡Victoria! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Trophy className="h-20 w-20 mx-auto text-yellow-400" />
            <DialogDescription className="text-lg">
              {gameState.gameMode === 'pvc' 
                ? (gameState.winner === playerSymbol 
                  ? '¡Has vencido a la computadora!' 
                  : 'La computadora ha ganado esta vez')
                : `¡${gameState.winner} ha ganado!`}
            </DialogDescription>
            
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Movimientos:</span>
                <span className="font-bold">{gameState.moves.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-bold">
                  {Math.floor(((gameState.endTime || Date.now()) - gameState.startTime - gameState.pausedTime) / 1000)}s
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={handleReset}>
                Jugar de nuevo
              </Button>
              <Button onClick={handleNewGame} variant="outline">
                Nueva partida
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Empate */}
      <Dialog open={showDrawModal} onOpenChange={setShowDrawModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-600 mb-4">
              ¡Empate! 🤝
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <XIcon className="h-16 w-16 text-blue-600" />
              <Circle className="h-16 w-16 text-red-600" />
            </div>
            <DialogDescription className="text-lg">
              ¡Ha sido una partida muy reñida!
            </DialogDescription>

            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={handleReset}>
                Jugar de nuevo
              </Button>
              <Button onClick={handleNewGame} variant="outline">
                Nueva partida
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}