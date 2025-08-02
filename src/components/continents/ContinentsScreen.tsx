'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Trophy, 
  Globe,
  Flag,
  MapPin,
  Clock,
  Target,
  Sparkles,
  Pause,
  Play,
  Settings,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  Shuffle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import ContinentsBoard from './ContinentsBoard';
import ContinentsControls from './ContinentsControls';
import GameTutorial from './GameTutorial';
import { 
  GameState, 
  GameConfig,
  ContinentsMode,
  ContinentsDifficulty,
  DragItem,
  DropZone,
  Position,
  MODE_CONFIG,
  DIFFICULTY_CONFIG
} from '@/lib/continents/types';
import { 
  generateGame,
  validatePlacement,
  getHint,
  calculateScore,
  getAvailableCountriesForSubdivisions
} from '@/lib/continents/generator';
import { playSound } from '@/lib/continents/sounds';
import { continentsStorage } from '@/lib/continents/storage';
import { useProfile } from '@/contexts/ProfileContext';

interface ContinentsScreenProps {
  onBack?: () => void;
}

// Configuraciones predefinidas de modos
const MODE_OPTIONS = [
  {
    id: 'continents' as ContinentsMode,
    name: 'Continentes',
    description: 'Coloca los continentes en el mapa mundial',
    icon: Globe,
    color: 'bg-blue-500'
  },
  {
    id: 'countries' as ContinentsMode,
    name: 'Países',
    description: 'Ubica países en su continente correcto',
    icon: Flag,
    color: 'bg-green-500'
  },
  {
    id: 'subdivisions' as ContinentsMode,
    name: 'Estados y Provincias',
    description: 'Coloca las divisiones internas de un país',
    icon: MapPin,
    color: 'bg-orange-500'
  }
];

const DIFFICULTY_OPTIONS = [
  {
    id: 'easy' as ContinentsDifficulty,
    name: 'Fácil',
    description: 'Nombres visibles y pistas disponibles',
    color: 'bg-green-500'
  },
  {
    id: 'medium' as ContinentsDifficulty,
    name: 'Intermedio',
    description: 'Sin nombres, con validación',
    color: 'bg-yellow-500'
  },
  {
    id: 'hard' as ContinentsDifficulty,
    name: 'Difícil',
    description: 'Sin ayudas visuales',
    color: 'bg-red-500'
  }
];

export default function ContinentsScreen({ onBack }: ContinentsScreenProps) {
  const router = useRouter();
  const { currentProfile } = useProfile();
  
  // Estados principales
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModeChangeModal, setShowModeChangeModal] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Configuración temporal durante la selección
  const [selectedMode, setSelectedMode] = useState<ContinentsMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ContinentsDifficulty | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Estados del juego
  const [timer, setTimer] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  
  // Estadísticas
  const [stats, setStats] = useState(() => continentsStorage.getStats());

  // Configuración por defecto
  const defaultConfig: GameConfig = useMemo(() => ({
    mode: 'continents',
    difficulty: 'easy',
    showFlags: true,
    showAnimals: true,
    showNames: true,
    showInfo: true,
    soundEnabled: true,
    autoValidate: true,
    allowHints: true
  }), []);

  // Cargar juego guardado al montar el componente
  useEffect(() => {
    const savedGame = continentsStorage.getActiveGame();
    if (savedGame) {
      setGameState(savedGame);
      setShowModeSelector(false);
      setShowDifficultySelector(false);
      setShowCountrySelector(false);
      setTimer(Date.now() - savedGame.startTime - savedGame.pausedTime);
    }
  }, []);

  // Timer del juego
  useEffect(() => {
    if (!gameState || gameState.isPaused || gameState.completed) {
      return;
    }

    const interval = setInterval(() => {
      setTimer(Date.now() - gameState.startTime - gameState.pausedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.startTime, gameState?.pausedTime, gameState?.isPaused, gameState?.completed]);

  // Guardar automáticamente el progreso
  useEffect(() => {
    if (gameState && !gameState.completed) {
      const timeoutId = setTimeout(() => {
        continentsStorage.saveGame(gameState);
      }, 1000); // Guardar con retraso para evitar demasiadas escrituras

      return () => clearTimeout(timeoutId);
    }
  }, [gameState]);

  // Manejar finalización del juego
  const handleGameCompletion = useCallback((finalGameState: GameState) => {
    const gameTime = Math.floor(timer / 1000);
    
    // Registrar estadísticas
    continentsStorage.recordGameCompletion(
      finalGameState.config.mode,
      finalGameState.config.difficulty,
      gameTime,
      finalGameState.hintsUsed,
      finalGameState.attempts,
      finalGameState.correctPlacements,
      finalGameState.score
    );

    // Actualizar estadísticas locales
    setStats(continentsStorage.getStats());

    // Limpiar juego guardado
    continentsStorage.clearActiveGame();

    // Mostrar efectos de victoria
    setShowConfetti(true);
    setShowVictoryModal(true);

    // Sonidos de celebración
    setTimeout(() => {
      playSound('celebration', finalGameState.config.soundEnabled);
    }, 1000);

    // Ocultar confetti después de un tiempo
    setTimeout(() => setShowConfetti(false), 8000);
  }, [timer]);

  // Iniciar nuevo juego
  const startNewGame = useCallback((mode: ContinentsMode, difficulty: ContinentsDifficulty, country?: string) => {
    try {
      const config: GameConfig = {
        ...defaultConfig,
        mode,
        difficulty,
        selectedCountry: country,
        showNames: DIFFICULTY_CONFIG[difficulty].showNames,
        allowHints: DIFFICULTY_CONFIG[difficulty].allowHints
      };

      const newGameState = generateGame(config);
      setGameState(newGameState);
      setTimer(0);
      setSelectedItemId(null);
      setShowHint(false);
      setCurrentHint(null);
      
      // Ocultar selectores
      setShowModeSelector(false);
      setShowDifficultySelector(false);
      setShowCountrySelector(false);
      setShowVictoryModal(false);
      setShowPauseModal(false);
      setShowConfetti(false);
      
      // Mostrar tutorial para nuevos usuarios o primer juego del modo
      const hasPlayedBefore = localStorage.getItem(`continents-tutorial-${mode}`) === 'completed';
      if (!hasPlayedBefore) {
        setShowTutorial(true);
      }
      
    } catch (error) {
      console.error('Error al generar juego:', error);
      // Volver al selector de modo si hay error
      handleNewGame();
    }
  }, [defaultConfig]);

  // Manejar drop de elementos
  const handleItemDrop = useCallback((itemId: string, dropZoneId: string) => {
    if (!gameState || gameState.isPaused || gameState.completed) return;

    const isCorrect = validatePlacement(itemId, dropZoneId, gameState);
    
    // Actualizar elementos y zonas
    const updatedDragItems = gameState.dragItems.map(item => 
      item.id === itemId 
        ? { ...item, isPlaced: true, isCorrect }
        : item
    );

    const updatedDropZones = gameState.dropZones.map(zone => 
      zone.id === dropZoneId 
        ? { ...zone, isOccupied: true, currentItemId: itemId }
        : zone
    );

    // Calcular nuevas estadísticas
    const newAttempts = gameState.attempts + 1;
    const newCorrectPlacements = isCorrect 
      ? gameState.correctPlacements + 1 
      : gameState.correctPlacements;

    // Verificar si el juego está completo
    const allPlaced = updatedDragItems.every(item => item.isPlaced && item.isCorrect);
    const newGameState: GameState = {
      ...gameState,
      dragItems: updatedDragItems,
      dropZones: updatedDropZones,
      attempts: newAttempts,
      correctPlacements: newCorrectPlacements,
      completed: allPlaced,
      endTime: allPlaced ? Date.now() : undefined,
      score: calculateScore({
        ...gameState,
        attempts: newAttempts,
        correctPlacements: newCorrectPlacements
      })
    };

    setGameState(newGameState);

    // Reproducir sonido basado en resultado
    if (isCorrect) {
      playSound('drop_correct', gameState.config.soundEnabled);
    } else {
      playSound('drop_wrong', gameState.config.soundEnabled);
    }

    // Si el juego está completo, manejar finalización
    if (allPlaced) {
      // Sonido de victoria completa
      setTimeout(() => {
        playSound('complete', gameState.config.soundEnabled);
      }, 500);
      handleGameCompletion(newGameState);
    }

    // Ocultar pista si se mostró
    if (showHint) {
      setShowHint(false);
      setCurrentHint(null);
    }

    // Limpiar selección
    setSelectedItemId(null);
  }, [gameState, showHint, handleGameCompletion]);

  // Manejar movimiento de elementos
  const handleItemMove = useCallback((itemId: string, position: Position) => {
    if (!gameState || gameState.isPaused || gameState.completed) return;

    const updatedDragItems = gameState.dragItems.map(item => 
      item.id === itemId 
        ? { ...item, currentPosition: position }
        : item
    );

    setGameState({
      ...gameState,
      dragItems: updatedDragItems
    });
  }, [gameState]);

  // Manejar pausa
  const handlePause = useCallback(() => {
    if (!gameState || gameState.completed) return;

    const pausedState = {
      ...gameState,
      isPaused: true,
      pausedTime: gameState.pausedTime + (Date.now() - gameState.startTime)
    };

    setGameState(pausedState);
    setShowPauseModal(true);
  }, [gameState]);

  // Reanudar juego
  const handleResume = useCallback(() => {
    if (!gameState) return;

    const resumedState = {
      ...gameState,
      isPaused: false,
      startTime: Date.now()
    };

    setGameState(resumedState);
    setShowPauseModal(false);
  }, [gameState]);

  // Reiniciar juego
  const handleReset = useCallback(() => {
    if (!gameState) return;

    try {
      const newGameState = generateGame(gameState.config);
      setGameState(newGameState);
      setTimer(0);
      setSelectedItemId(null);
      setShowHint(false);
      setCurrentHint(null);
      setShowVictoryModal(false);
      setShowPauseModal(false);
      setShowConfetti(false);
    } catch (error) {
      console.error('Error al reiniciar juego:', error);
    }
  }, [gameState]);

  // Nuevo juego
  const handleNewGame = useCallback(() => {
    setGameState(null);
    setShowModeSelector(true);
    setShowDifficultySelector(false);
    setShowCountrySelector(false);
    setShowVictoryModal(false);
    setShowPauseModal(false);
    setShowConfetti(false);
    setSelectedMode(null);
    setSelectedDifficulty(null);
    setSelectedCountry(null);
    setSelectedItemId(null);
    setShowHint(false);
    setCurrentHint(null);
    setTimer(0);
    
    // Limpiar juego guardado
    continentsStorage.clearActiveGame();
  }, []);

  // Mostrar pista
  const handleHint = useCallback(() => {
    if (!gameState || !gameState.config.allowHints || gameState.hintsUsed >= 3) return;

    const hint = getHint(gameState);
    if (hint) {
      setSelectedItemId(hint.itemId);
      setShowHint(true);
      setCurrentHint(hint.message);
      
      // Sonido de pista
      playSound('hint', gameState.config.soundEnabled);
      
      // Actualizar contador de pistas
      setGameState({
        ...gameState,
        hintsUsed: gameState.hintsUsed + 1
      });

      // Ocultar pista después de 5 segundos
      setTimeout(() => {
        setShowHint(false);
        setCurrentHint(null);
      }, 5000);
    }
  }, [gameState]);

  // Cambiar modo de juego
  const handleModeChange = useCallback((newMode: ContinentsMode) => {
    if (!gameState) {
      // Si no hay juego activo, ir directamente al selector
      setSelectedMode(newMode);
      setShowModeSelector(false);
      setShowDifficultySelector(true);
      setShowModeDropdown(false);
      return;
    }

    // Si hay juego en progreso, mostrar confirmación
    if (!gameState.completed) {
      setSelectedMode(newMode);
      setShowModeChangeModal(true);
      setShowModeDropdown(false);
    } else {
      // Si el juego está completado, cambiar directamente
      setSelectedMode(newMode);
      setShowModeSelector(false);
      setShowDifficultySelector(true);
      setShowModeDropdown(false);
    }
  }, [gameState]);

  // Confirmar cambio de modo
  const handleConfirmModeChange = useCallback((saveProgress: boolean = false) => {
    if (saveProgress && gameState && !gameState.completed) {
      // Guardar progreso actual
      continentsStorage.saveGame(gameState);
    } else {
      // Limpiar juego guardado
      continentsStorage.clearActiveGame();
    }

    // Resetear estados del juego actual
    setGameState(null);
    setTimer(0);
    setSelectedItemId(null);
    setShowHint(false);
    setCurrentHint(null);
    setShowVictoryModal(false);
    setShowPauseModal(false);
    setShowConfetti(false);

    // Ir al selector de dificultad con el nuevo modo
    setShowModeSelector(false);
    setShowDifficultySelector(true);
    setShowCountrySelector(false);
    setShowModeChangeModal(false);
    setSelectedDifficulty(null);
    setSelectedCountry(null);
  }, [gameState]);

  // Alternar configuraciones
  const handleToggleSound = useCallback(() => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      config: { ...gameState.config, soundEnabled: !gameState.config.soundEnabled }
    });
  }, [gameState]);

  const handleToggleFlags = useCallback(() => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      config: { ...gameState.config, showFlags: !gameState.config.showFlags }
    });
  }, [gameState]);

  const handleToggleAnimals = useCallback(() => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      config: { ...gameState.config, showAnimals: !gameState.config.showAnimals }
    });
  }, [gameState]);

  const handleToggleNames = useCallback(() => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      config: { ...gameState.config, showNames: !gameState.config.showNames }
    });
  }, [gameState]);

  const handleShowInfo = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  // Manejar finalización del tutorial
  const handleTutorialComplete = useCallback(() => {
    if (gameState) {
      localStorage.setItem(`continents-tutorial-${gameState.config.mode}`, 'completed');
    }
    setShowTutorial(false);
  }, [gameState]);

  // Saltar tutorial
  const handleTutorialSkip = useCallback(() => {
    if (gameState) {
      localStorage.setItem(`continents-tutorial-${gameState.config.mode}`, 'completed');
    }
    setShowTutorial(false);
  }, [gameState]);

  // Países disponibles para modo subdivisiones
  const availableCountries = useMemo(() => {
    return getAvailableCountriesForSubdivisions();
  }, []);

  // Formatear tiempo
  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }, []);

  // Componente de botón de cambio de modo optimizado
  const ModeChangeButton = React.memo(() => {
    if (!gameState) return null;

    const currentModeOption = MODE_OPTIONS.find(m => m.id === gameState.config.mode);
    const IconComponent = currentModeOption?.icon || Globe;

    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModeDropdown(!showModeDropdown)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur hover:bg-white/95"
        >
          <Shuffle className="h-4 w-4" />
          <span className="hidden md:inline">Cambiar Modo</span>
        </Button>

        {showModeDropdown && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50 animate-in slide-in-from-top-2">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Cambiar a:</div>
              {MODE_OPTIONS.filter(mode => mode.id !== gameState.config.mode).map((mode) => {
                const ModeIcon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${mode.color}`}>
                      <ModeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{mode.name}</div>
                      <div className="text-xs text-gray-500 truncate">{mode.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  });

  ModeChangeButton.displayName = 'ModeChangeButton';

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModeDropdown) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowModeDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModeDropdown]);

  // Botón de volver
  const backButton = (
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
  );

  // Renderizar selector de modo
  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          {backButton}

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Geografía Mundial</h1>
            <p className="text-lg text-gray-600">Elige tu modo de juego</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {MODE_OPTIONS.map((mode) => {
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
                      setShowDifficultySelector(true);
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

  // Renderizar selector de dificultad
  if (showDifficultySelector && selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowDifficultySelector(false);
              setShowModeSelector(true);
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cambiar modo
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Nivel de Dificultad</h1>
            <p className="text-lg text-gray-600">Selecciona tu desafío</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DIFFICULTY_OPTIONS.map((difficulty) => {
              return (
                <div
                  key={difficulty.id}
                  className="transform transition-all hover:scale-105 active:scale-95"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all h-full"
                    onClick={() => {
                      setSelectedDifficulty(difficulty.id);
                      if (selectedMode === 'subdivisions') {
                        setShowDifficultySelector(false);
                        setShowCountrySelector(true);
                      } else {
                        startNewGame(selectedMode, difficulty.id);
                      }
                    }}
                  >
                    <CardHeader className="text-center">
                      <div 
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${difficulty.color}`}
                      >
                        <Target className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl">{difficulty.name}</CardTitle>
                      <CardDescription>{difficulty.description}</CardDescription>
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

  // Renderizar selector de país (solo para modo subdivisiones)
  if (showCountrySelector && selectedMode === 'subdivisions' && selectedDifficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowCountrySelector(false);
              setShowDifficultySelector(true);
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cambiar dificultad
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Seleccionar País</h1>
            <p className="text-lg text-gray-600">Elige el país para explorar sus estados/provincias</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Países Disponibles</CardTitle>
              <CardDescription>
                Selecciona un país para aprender sobre sus divisiones internas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedCountry || ''} 
                onValueChange={(value) => {
                  setSelectedCountry(value);
                  startNewGame(selectedMode, selectedDifficulty, value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un país..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flagUrl} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderizar el juego principal
  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      {/* Efecto de confetti mejorado */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {/* Confetti circular */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={`circle-${i}`}
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
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'][Math.floor(Math.random() * 7)],
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              </div>
            ))}
            
            {/* Estrellas */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute animate-fall text-yellow-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${4 + Math.random() * 2}s`,
                  fontSize: `${12 + Math.random() * 8}px`
                }}
              >
                ⭐
              </div>
            ))}
            
            {/* Emojis de celebración */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`emoji-${i}`}
                className="absolute animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${4 + Math.random() * 3}s`,
                  fontSize: `${16 + Math.random() * 8}px`
                }}
              >
                {['🎉', '🎊', '🌟', '✨', '🏆', '👏', '🎯'][Math.floor(Math.random() * 7)]}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          {backButton}

          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-700">
              {MODE_CONFIG[gameState.config.mode].label}
            </h1>
            <Badge className={`${DIFFICULTY_CONFIG[gameState.config.difficulty].color} text-white`}>
              {DIFFICULTY_CONFIG[gameState.config.difficulty].label}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <ModeChangeButton />
            
            {/* Botón de ayuda/tutorial */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="bg-white/90 backdrop-blur hover:bg-white/95"
              title="Ver tutorial"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Ayuda</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-mono font-semibold text-blue-700">
                {formatTime(timer)}
              </span>
            </div>
          </div>
        </div>

        {/* Progreso general */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{gameState.correctPlacements}/{gameState.dragItems.length}</span>
          </div>
          <Progress 
            value={(gameState.correctPlacements / gameState.dragItems.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Pista actual */}
        {currentHint && (
          <div className="mb-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">Pista:</span>
                  <span className="text-orange-700">{currentHint}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Área principal del juego */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Tablero de juego principal */}
          <div className="lg:col-span-3">
            <Card className="bg-white/90 backdrop-blur h-full">
              <CardContent className="p-6 h-full">
                <div className="h-[600px] relative">
                  <ContinentsBoard
                    gameState={gameState}
                    onItemDrop={handleItemDrop}
                    onItemMove={handleItemMove}
                    selectedItemId={selectedItemId}
                    showHint={showHint}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de controles */}
          <div>
            <ContinentsControls
              gameState={gameState}
              timer={timer}
              selectedItemId={selectedItemId}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              onHint={handleHint}
              onToggleSound={handleToggleSound}
              onToggleFlags={handleToggleFlags}
              onToggleAnimals={handleToggleAnimals}
              onToggleNames={handleToggleNames}
              onShowInfo={handleShowInfo}
            />
          </div>
        </div>
      </div>

      {/* Modal de pausa */}
      <Dialog open={showPauseModal} onOpenChange={(open) => {
        if (!open) handleResume();
      }}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600 mb-4">
              Juego Pausado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Pause className="h-16 w-16 mx-auto text-gray-400" />
            <DialogDescription className="text-lg">
              El juego está pausado. ¡Tómate un descanso!
            </DialogDescription>
            
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={handleResume}>
                <Play className="mr-2 h-4 w-4" />
                Continuar
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reiniciar
              </Button>
              <Button onClick={handleNewGame} variant="outline">
                Nuevo Juego
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de victoria */}
      <Dialog open={showVictoryModal} onOpenChange={setShowVictoryModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-green-600 mb-4">
              ¡Excelente trabajo! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Trophy className="h-20 w-20 mx-auto text-yellow-400" />
            <DialogDescription className="text-lg">
              ¡Has completado el ejercicio de {MODE_CONFIG[gameState.config.mode].label.toLowerCase()}!
            </DialogDescription>
            
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-bold">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span>Intentos:</span>
                <span className="font-bold">{gameState.attempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Precisión:</span>
                <span className="font-bold">
                  {Math.round((gameState.correctPlacements / gameState.attempts) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pistas usadas:</span>
                <span className="font-bold">{gameState.hintsUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Puntuación:</span>
                <span className="font-bold text-green-600">{gameState.score} puntos</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Jugar de nuevo
              </Button>
              <Button onClick={handleNewGame} variant="outline">
                Nuevo ejercicio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para cambio de modo */}
      <Dialog open={showModeChangeModal} onOpenChange={setShowModeChangeModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600 mb-4 flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Cambiar Modo de Juego
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DialogDescription className="text-lg">
              Tienes un juego en progreso. ¿Qué deseas hacer?
            </DialogDescription>
            
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-blue-800 mb-2">Progreso actual:</div>
              <div className="flex justify-between text-sm">
                <span>Elementos colocados:</span>
                <span className="font-bold">{gameState?.correctPlacements}/{gameState?.dragItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tiempo transcurrido:</span>
                <span className="font-bold">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cambiar a:</span>
                <span className="font-bold text-blue-700">
                  {selectedMode && MODE_OPTIONS.find(m => m.id === selectedMode)?.name}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => handleConfirmModeChange(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Guardar progreso y cambiar
              </Button>
              <Button 
                onClick={() => handleConfirmModeChange(false)}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar sin guardar
              </Button>
              <Button 
                onClick={() => setShowModeChangeModal(false)}
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial interactivo */}
      {gameState && (
        <GameTutorial
          show={showTutorial}
          gameMode={gameState.config.mode}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </div>
  );
}