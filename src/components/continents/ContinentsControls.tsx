'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Pause, 
  Play, 
  RefreshCw, 
  Lightbulb, 
  Info,
  Volume2,
  VolumeX,
  Flag,
  Globe,
  MapPin,
  Trophy,
  Clock,
  Target,
  HelpCircle
} from 'lucide-react';
import { GameState, GameConfig, DIFFICULTY_CONFIG, MODE_CONFIG } from '@/lib/continents/types';
import { CONTINENTS, COUNTRIES, SUBDIVISIONS, ANIMALS } from '@/lib/continents/data';

interface ContinentsControlsProps {
  gameState: GameState;
  timer: number;
  selectedItemId?: string | null;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onHint: () => void;
  onToggleSound: () => void;
  onToggleFlags: () => void;
  onToggleAnimals: () => void;
  onToggleNames: () => void;
  onShowInfo: (itemId: string) => void;
}

export default function ContinentsControls({
  gameState,
  timer,
  selectedItemId,
  onPause,
  onResume,
  onReset,
  onHint,
  onToggleSound,
  onToggleFlags,
  onToggleAnimals,
  onToggleNames,
  onShowInfo
}: ContinentsControlsProps) {
  const [showLegend, setShowLegend] = useState(false);
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = gameState.dragItems.length > 0 
    ? (gameState.correctPlacements / gameState.dragItems.length) * 100 
    : 0;
  
  const modeConfig = MODE_CONFIG[gameState.config.mode];
  const difficultyConfig = DIFFICULTY_CONFIG[gameState.config.difficulty];
  
  // Obtener icono según el modo
  const ModeIcon = gameState.config.mode === 'continents' ? Globe : 
                    gameState.config.mode === 'countries' ? Flag : MapPin;
  
  // Información específica del elemento seleccionado
  const getSelectedItemInfo = () => {
    if (!selectedItemId) return null;
    
    const item = gameState.dragItems.find(i => i.id === selectedItemId);
    if (!item) return null;
    
    let info = { name: '', capital: '', animal: '', flag: '' };
    
    switch (item.type) {
      case 'continent':
        const continent = item.data as any;
        info.name = continent.name;
        const animal = ANIMALS[continent.animalId || ''];
        info.animal = animal ? `${animal.imageUrl} ${animal.name}` : '';
        break;
        
      case 'country':
        const country = item.data as any;
        info.name = country.name;
        info.capital = country.capital;
        info.flag = country.flagUrl || '';
        const countryAnimal = ANIMALS[country.animalId || ''];
        info.animal = countryAnimal ? `${countryAnimal.imageUrl} ${countryAnimal.name}` : '';
        break;
        
      case 'subdivision':
        const subdivision = item.data as any;
        info.name = subdivision.name;
        info.capital = subdivision.capital || '';
        info.flag = subdivision.flagUrl || '';
        break;
    }
    
    return info;
  };
  
  const selectedInfo = getSelectedItemInfo();
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ModeIcon className="h-5 w-5 text-blue-600" />
            {modeConfig.label}
          </CardTitle>
          <Badge className={`${difficultyConfig.color} text-white`}>
            {difficultyConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progreso y estadísticas */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progreso</span>
            <span className="font-semibold">
              {gameState.correctPlacements}/{gameState.dragItems.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-mono font-semibold">{formatTime(timer)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-600" />
            <span className="font-semibold">{gameState.attempts} intentos</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Información del elemento seleccionado */}
        {selectedInfo && (
          <>
            <div className="bg-blue-50 rounded-lg p-3 space-y-1">
              <h4 className="font-semibold text-sm text-blue-700">
                Elemento Seleccionado:
              </h4>
              <p className="text-sm">
                {selectedInfo.flag} {selectedInfo.name}
              </p>
              {selectedInfo.capital && (
                <p className="text-xs text-gray-600">
                  Capital: {selectedInfo.capital}
                </p>
              )}
              {selectedInfo.animal && (
                <p className="text-xs text-gray-600">
                  Animal: {selectedInfo.animal}
                </p>
              )}
            </div>
            <Separator />
          </>
        )}
        
        {/* Controles principales */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={gameState.isPaused ? onResume : onPause}
            disabled={gameState.completed}
            className="h-10"
          >
            {gameState.isPaused ? (
              <>
                <Play className="h-4 w-4 mr-1" />
                Continuar
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-10"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reiniciar
          </Button>
          
          {gameState.config.allowHints && (
            <Button
              variant="outline"
              size="sm"
              onClick={onHint}
              disabled={gameState.hintsUsed >= 3 || gameState.completed}
              className="h-10"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Pista ({3 - gameState.hintsUsed})
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="h-10"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Ayuda
          </Button>
        </div>
        
        <Separator />
        
        {/* Opciones de visualización */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Opciones:</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={gameState.config.soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={onToggleSound}
              className="h-9 text-xs"
            >
              {gameState.config.soundEnabled ? (
                <Volume2 className="h-3 w-3 mr-1" />
              ) : (
                <VolumeX className="h-3 w-3 mr-1" />
              )}
              Sonido
            </Button>
            
            <Button
              variant={gameState.config.showNames ? "default" : "outline"}
              size="sm"
              onClick={onToggleNames}
              className="h-9 text-xs"
            >
              <Info className="h-3 w-3 mr-1" />
              Nombres
            </Button>
            
            {gameState.config.mode !== 'continents' && (
              <Button
                variant={gameState.config.showFlags ? "default" : "outline"}
                size="sm"
                onClick={onToggleFlags}
                className="h-9 text-xs"
              >
                <Flag className="h-3 w-3 mr-1" />
                Banderas
              </Button>
            )}
            
            <Button
              variant={gameState.config.showAnimals ? "default" : "outline"}
              size="sm"
              onClick={onToggleAnimals}
              className="h-9 text-xs"
            >
              🐾 Animales
            </Button>
          </div>
        </div>
        
        {/* Leyenda de ayuda */}
        {showLegend && (
          <>
            <Separator />
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
              <h5 className="font-semibold text-gray-700">Cómo jugar:</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Arrastra los elementos a su ubicación correcta</li>
                <li>• Los bordes verdes indican posición correcta</li>
                <li>• Los bordes rojos indican posición incorrecta</li>
                <li>• Usa las pistas si necesitas ayuda</li>
                <li>• ¡Completa el ejercicio lo más rápido posible!</li>
              </ul>
            </div>
          </>
        )}
        
        {/* Mensaje de victoria */}
        {gameState.completed && (
          <>
            <Separator />
            <div className="bg-green-50 rounded-lg p-4 text-center space-y-2">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
              <h4 className="font-bold text-green-700">¡Felicitaciones!</h4>
              <p className="text-sm text-green-600">
                Completaste el ejercicio en {formatTime(timer)}
              </p>
              <p className="text-xs text-gray-600">
                Puntuación: {gameState.score} puntos
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}