'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LevelExamplesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  examples: string[];
  onUpdateExamples: (examples: string[]) => void;
}

export default function LevelExamplesDialog({
  open,
  onOpenChange,
  level,
  examples,
  onUpdateExamples,
}: LevelExamplesDialogProps) {
  const [newExample, setNewExample] = useState('');
  const { toast } = useToast();

  const handleAddExample = () => {
    if (!newExample.trim()) {
      toast({
        title: 'Error',
        description: 'El ejemplo no puede estar vacío',
        variant: 'destructive',
      });
      return;
    }

    if (newExample.length > 500) {
      toast({
        title: 'Error',
        description: 'El ejemplo no puede tener más de 500 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (examples.length >= 10) {
      toast({
        title: 'Error',
        description: 'Máximo 10 ejemplos por nivel',
        variant: 'destructive',
      });
      return;
    }

    onUpdateExamples([...examples, newExample.trim()]);
    setNewExample('');
    toast({
      title: 'Ejemplo agregado',
      description: `Ejemplo agregado para el nivel ${level}`,
    });
  };

  const handleRemoveExample = (index: number) => {
    const updatedExamples = examples.filter((_, i) => i !== index);
    onUpdateExamples(updatedExamples);
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Fácil';
    if (level <= 6) return 'Intermedio';
    if (level <= 8) return 'Difícil';
    return 'Experto';
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    if (level <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ejemplos para Nivel {level}
            <Badge variant="secondary" className={getDifficultyColor(level)}>
              {getDifficultyLabel(level)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Agrega ejemplos de ejercicios para que la IA genere problemas similares.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info box */}
          <div className="rounded-lg border bg-muted/50 p-3 flex gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Ejemplos de formato:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Completo: <code className="font-mono">1 + 2 = 3</code></li>
                <li>Con incógnita: <code className="font-mono">1 + ? = 3</code> o <code className="font-mono">? + 2 = 3</code></li>
                <li>Solo problema: <code className="font-mono">15 ÷ 3 = ?</code></li>
              </ul>
            </div>
          </div>

          {/* Add new example */}
          <div className="space-y-2">
            <Label htmlFor="new-example">Nuevo ejemplo</Label>
            <div className="flex gap-2">
              <Input
                id="new-example"
                placeholder="ej. 5 + ? = 12"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExample()}
                maxLength={500}
              />
              <Button 
                onClick={handleAddExample}
                disabled={!newExample.trim() || examples.length >= 10}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {newExample.length}/500 caracteres • {examples.length}/10 ejemplos
            </p>
          </div>

          {/* Examples list */}
          <div className="space-y-2">
            <Label>Ejemplos actuales ({examples.length})</Label>
            {examples.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay ejemplos para este nivel aún
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-lg border p-4">
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 rounded-lg border bg-background p-3"
                    >
                      <code className="font-mono text-sm flex-1">{example}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExample(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}