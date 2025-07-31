'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Grid3x3, 
  Users, 
  Bot, 
  Timer,
  Volume2,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { TicTacToeConfig, BoardSize, GameMode, AIDifficulty } from '@/lib/tictactoe/types';

interface TicTacToeSettingsProps {
  config: TicTacToeConfig;
  onConfigChange: (config: TicTacToeConfig) => void;
  onClose: () => void;
  onApply: () => void;
}

export default function TicTacToeSettings({
  config,
  onConfigChange,
  onClose,
  onApply
}: TicTacToeSettingsProps) {
  const [localConfig, setLocalConfig] = useState<TicTacToeConfig>(config);

  const handleChange = (changes: Partial<TicTacToeConfig>) => {
    setLocalConfig({ ...localConfig, ...changes });
  };

  const handleApply = () => {
    onConfigChange(localConfig);
    onApply();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuración del Juego
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Personaliza tu experiencia de juego
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tamaño del tablero */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Tamaño del Tablero
          </Label>
          <RadioGroup
            value={localConfig.boardSize.toString()}
            onValueChange={(value) => handleChange({ boardSize: parseInt(value) as BoardSize })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="size-3" />
              <Label htmlFor="size-3" className="cursor-pointer">
                3×3 (Clásico)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="size-4" />
              <Label htmlFor="size-4" className="cursor-pointer">
                4×4 (Intermedio)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="size-5" />
              <Label htmlFor="size-5" className="cursor-pointer">
                5×5 (Avanzado)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Modo de juego */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Modo de Juego
          </Label>
          <RadioGroup
            value={localConfig.gameMode}
            onValueChange={(value) => handleChange({ gameMode: value as GameMode })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pvp" id="mode-pvp" />
              <Label htmlFor="mode-pvp" className="cursor-pointer flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jugador vs Jugador
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pvc" id="mode-pvc" />
              <Label htmlFor="mode-pvc" className="cursor-pointer flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Jugador vs Computadora
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Dificultad de la IA (solo si es vs computadora) */}
        {localConfig.gameMode === 'pvc' && (
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Dificultad de la IA
            </Label>
            <RadioGroup
              value={localConfig.aiDifficulty}
              onValueChange={(value) => handleChange({ aiDifficulty: value as AIDifficulty })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="ai-easy" />
                <Label htmlFor="ai-easy" className="cursor-pointer">
                  Fácil (IA comete errores)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="ai-hard" />
                <Label htmlFor="ai-hard" className="cursor-pointer">
                  Difícil (IA juega perfectamente)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Quién empieza */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Primer Jugador</Label>
          <RadioGroup
            value={localConfig.firstPlayer}
            onValueChange={(value) => handleChange({ firstPlayer: value as 'X' | 'O' | 'random' })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="X" id="first-x" />
              <Label htmlFor="first-x" className="cursor-pointer">
                Jugador X
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="O" id="first-o" />
              <Label htmlFor="first-o" className="cursor-pointer">
                Jugador O
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="first-random" />
              <Label htmlFor="first-random" className="cursor-pointer">
                Aleatorio
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Timer por turno */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="timer-enabled" className="text-base font-medium flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Temporizador por Turno
            </Label>
            <Switch
              id="timer-enabled"
              checked={localConfig.timerEnabled}
              onCheckedChange={(checked) => handleChange({ timerEnabled: checked })}
            />
          </div>
          {localConfig.timerEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">
                  Tiempo por turno: {localConfig.timerSeconds} segundos
                </Label>
              </div>
              <Slider
                value={[localConfig.timerSeconds]}
                onValueChange={(value) => handleChange({ timerSeconds: value[0] })}
                min={10}
                max={120}
                step={10}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Otras opciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className="text-base font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Efectos de Sonido
            </Label>
            <Switch
              id="sound-enabled"
              checked={localConfig.soundEnabled}
              onCheckedChange={(checked) => handleChange({ soundEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="animations-enabled" className="text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Animaciones
            </Label>
            <Switch
              id="animations-enabled"
              checked={localConfig.animationsEnabled}
              onCheckedChange={(checked) => handleChange({ animationsEnabled: checked })}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleApply} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Aplicar Cambios
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}