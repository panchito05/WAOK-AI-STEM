'use client';

import { SudokuConfig } from '@/lib/sudoku/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Settings, Volume2, Eye, Lightbulb, Timer, CheckCircle2, Palette, RotateCcw } from 'lucide-react';
import { sudokuStorage } from '@/lib/sudoku/storage';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SudokuSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SudokuConfig;
  onConfigChange: (config: SudokuConfig) => void;
}

export default function SudokuSettings({
  open,
  onOpenChange,
  config,
  onConfigChange,
}: SudokuSettingsProps) {
  const { toast } = useToast();
  const [tempConfig, setTempConfig] = useState<SudokuConfig>(config);
  const [activeTab, setActiveTab] = useState('gameplay');

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleSave = () => {
    onConfigChange(tempConfig);
    sudokuStorage.saveConfig(tempConfig);
    toast({
      title: 'Configuración guardada',
      description: 'Tus preferencias han sido actualizadas',
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultConfig: SudokuConfig = {
      variant: 'classic',
      difficulty: 'easy',
      showTimer: true,
      showErrors: true,
      allowHints: true,
      autoCheck: true,
      highlightSameNumbers: true,
      soundEnabled: false,
    };
    setTempConfig(defaultConfig);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Sudoku
          </DialogTitle>
          <DialogDescription>
            Personaliza tu experiencia de juego
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gameplay">Juego</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="gameplay" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timer" className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Mostrar temporizador
                    </Label>
                    <CardDescription className="text-xs">
                      Ve cuánto tiempo llevas jugando
                    </CardDescription>
                  </div>
                  <Switch
                    id="timer"
                    checked={tempConfig.showTimer}
                    onCheckedChange={(checked) =>
                      setTempConfig({ ...tempConfig, showTimer: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="errors" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Mostrar errores
                    </Label>
                    <CardDescription className="text-xs">
                      Cuenta los errores cometidos
                    </CardDescription>
                  </div>
                  <Switch
                    id="errors"
                    checked={tempConfig.showErrors}
                    onCheckedChange={(checked) =>
                      setTempConfig({ ...tempConfig, showErrors: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hints" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Permitir pistas
                    </Label>
                    <CardDescription className="text-xs">
                      Activa el botón de pistas
                    </CardDescription>
                  </div>
                  <Switch
                    id="hints"
                    checked={tempConfig.allowHints}
                    onCheckedChange={(checked) =>
                      setTempConfig({ ...tempConfig, allowHints: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autocheck" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Verificación automática
                    </Label>
                    <CardDescription className="text-xs">
                      Marca errores mientras juegas
                    </CardDescription>
                  </div>
                  <Switch
                    id="autocheck"
                    checked={tempConfig.autoCheck}
                    onCheckedChange={(checked) =>
                      setTempConfig({ ...tempConfig, autoCheck: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="highlight" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Resaltar números iguales
                    </Label>
                    <CardDescription className="text-xs">
                      Destaca todos los números iguales al seleccionado
                    </CardDescription>
                  </div>
                  <Switch
                    id="highlight"
                    checked={tempConfig.highlightSameNumbers}
                    onCheckedChange={(checked) =>
                      setTempConfig({ ...tempConfig, highlightSameNumbers: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tema de color</Label>
                  <CardDescription className="text-xs">
                    Próximamente: Elige entre diferentes temas visuales
                  </CardDescription>
                  <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none">
                    <Button variant="outline" size="sm">
                      Claro
                    </Button>
                    <Button variant="outline" size="sm">
                      Oscuro
                    </Button>
                    <Button variant="outline" size="sm">
                      Colorido
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound" className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Efectos de sonido
                    </Label>
                    <CardDescription className="text-xs">
                      Sonidos al colocar números y completar
                    </CardDescription>
                  </div>
                  <Switch
                    id="sound"
                    checked={tempConfig.soundEnabled}
                    onCheckedChange={(checked) =>
                      setTempConfig({ ...tempConfig, soundEnabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2 opacity-50">
                  <Label>Volumen</Label>
                  <CardDescription className="text-xs">
                    Próximamente: Control de volumen
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}