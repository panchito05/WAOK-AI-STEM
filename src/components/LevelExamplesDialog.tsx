'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Info, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StructuredExample } from '@/lib/storage';
import { validateStructuredExample } from '@/lib/math-validator';
import { api } from '@/lib/api-client';

interface LevelExamplesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  topic: string;
  examples: string[]; // Mantener para compatibilidad
  structuredExamples?: StructuredExample[]; // Nueva estructura
  editingExample?: { index: number; example: StructuredExample } | null;
  onUpdateExamples: (examples: string[]) => void;
  onUpdateStructuredExamples?: (examples: StructuredExample[]) => void;
}

export default function LevelExamplesDialog({
  open,
  onOpenChange,
  level,
  topic,
  examples,
  structuredExamples,
  editingExample,
  onUpdateExamples,
  onUpdateStructuredExamples,
}: LevelExamplesDialogProps) {
  const [newProblem, setNewProblem] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Pre-llenar campos cuando se está editando
  useEffect(() => {
    if (editingExample && open) {
      setNewProblem(editingExample.example.problem);
      setNewSolution(editingExample.example.solution);
      setNewExplanation(editingExample.example.explanation || '');
    } else if (!open) {
      // Limpiar campos cuando se cierra el diálogo
      setNewProblem('');
      setNewSolution('');
      setNewExplanation('');
    }
  }, [editingExample, open]);

  // Función para calcular automáticamente la solución
  const calculateSolution = (problem: string): string => {
    try {
      const patterns = [
        /^(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
        /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
        /^(\d+(?:\.\d+)?)\s*[×x\*]\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
        /^(\d+(?:\.\d+)?)\s*[÷/]\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      ];
      
      for (const pattern of patterns) {
        const match = problem.match(pattern);
        if (match) {
          const num1 = parseFloat(match[1]);
          const num2 = parseFloat(match[2]);
          let result: number;
          
          if (problem.includes('+')) {
            result = num1 + num2;
          } else if (problem.includes('-')) {
            result = num1 - num2;
          } else if (problem.match(/[×x\*]/)) {
            result = num1 * num2;
          } else if (problem.match(/[÷/]/)) {
            result = num1 / num2;
          } else {
            return '';
          }
          
          return result % 1 === 0 ? result.toString() : result.toFixed(2);
        }
      }
    } catch (error) {
      console.error('Error calculating solution:', error);
    }
    return '';
  };

  // Auto-calcular solución cuando cambia el problema
  const handleProblemChange = (value: string) => {
    setNewProblem(value);
    
    // Si el problema tiene formato válido, calcular la solución
    const calculatedSolution = calculateSolution(value);
    if (calculatedSolution && !newSolution) {
      setNewSolution(calculatedSolution);
      
      // También generar explicación automática
      const operation = value.includes('+') ? 'sumamos' : 
                       value.includes('-') ? 'restamos' : 
                       value.match(/[×x\*]/) ? 'multiplicamos' : 
                       value.match(/[÷/]/) ? 'dividimos' : 'calculamos';
      setNewExplanation(`Para resolver ${value}, ${operation}: ${value.replace('= ?', `= ${calculatedSolution}`)}`);
    }
  };

  // Usar ejemplos estructurados si están disponibles
  const hasStructuredExamples = onUpdateStructuredExamples && structuredExamples;
  const currentExamples = structuredExamples || [];
  const legacyExamples = !hasStructuredExamples ? examples : [];

  const handleAddExample = () => {
    if (!newProblem.trim()) {
      toast({
        title: 'Error',
        description: 'El problema no puede estar vacío',
        variant: 'destructive',
      });
      return;
    }

    if (!newSolution.trim()) {
      toast({
        title: 'Error',
        description: 'La solución no puede estar vacía',
        variant: 'destructive',
      });
      return;
    }

    if (!newExplanation.trim()) {
      toast({
        title: 'Error',
        description: 'La explicación no puede estar vacía',
        variant: 'destructive',
      });
      return;
    }

    // Solo verificar el límite si estamos agregando un nuevo ejemplo
    if (!editingExample) {
      const totalExamples = hasStructuredExamples ? currentExamples.length : legacyExamples.length;
      if (totalExamples >= 10) {
        toast({
          title: 'Error',
          description: 'Máximo 10 ejemplos por nivel',
          variant: 'destructive',
        });
        return;
      }
    }

    if (hasStructuredExamples && onUpdateStructuredExamples) {
      // Usar formato estructurado
      const newExample: StructuredExample = {
        problem: newProblem.trim(),
        solution: newSolution.trim(),
        explanation: newExplanation.trim(),
      };
      
      // Validar el ejemplo antes de guardarlo
      const validation = validateStructuredExample(newExample);
      if (!validation.valid) {
        toast({
          title: 'Error',
          description: validation.error || 'El ejemplo no es válido',
          variant: 'destructive',
        });
        return;
      }
      
      if (editingExample) {
        // Actualizar ejemplo existente
        const updatedExamples = [...currentExamples];
        updatedExamples[editingExample.index] = newExample;
        onUpdateStructuredExamples(updatedExamples);
      } else {
        // Agregar nuevo ejemplo
        onUpdateStructuredExamples([...currentExamples, newExample]);
      }
    } else {
      // Fallback al formato antiguo (solo para compatibilidad)
      const legacyFormat = `${newProblem.trim()} (Respuesta: ${newSolution.trim()})`;
      onUpdateExamples([...legacyExamples, legacyFormat]);
    }

    // Limpiar campos
    setNewProblem('');
    setNewSolution('');
    setNewExplanation('');
    
    toast({
      title: editingExample ? 'Ejemplo actualizado' : 'Ejemplo agregado',
      description: `Ejemplo ${editingExample ? 'actualizado' : 'agregado'} para el nivel ${level}`,
    });
  };

  const handleRemoveExample = (index: number) => {
    if (hasStructuredExamples && onUpdateStructuredExamples) {
      const updatedExamples = currentExamples.filter((_, i) => i !== index);
      onUpdateStructuredExamples(updatedExamples);
    } else {
      const updatedExamples = legacyExamples.filter((_, i) => i !== index);
      onUpdateExamples(updatedExamples);
    }
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

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    
    try {
      const result = await api.generateExamplesForSingleLevel(topic, level);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data && result.data[level] && result.data[level].length > 0) {
        const example = result.data[level][0];
        setNewProblem(example.problem);
        setNewSolution(example.solution);
        setNewExplanation(example.explanation);
        
        toast({
          title: 'Ejemplo generado',
          description: 'Revisa y ajusta el ejemplo antes de guardarlo',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el ejemplo',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            Ejemplos para Nivel {level}
            <Badge variant="secondary" className={getDifficultyColor(level)}>
              {getDifficultyLabel(level)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Agrega ejemplos completos de ejercicios para que la IA genere problemas similares.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Info box */}
          <div className="rounded-lg border bg-muted/50 p-3 flex gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>La IA generará ejercicios similares a tus ejemplos:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Mantendrá el mismo rango de números</li>
                <li>Usará el mismo formato de problema</li>
                <li>Incluirá explicaciones similares</li>
              </ul>
            </div>
          </div>

          {/* Add new example form */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium">{editingExample ? 'Editar ejemplo' : 'Agregar nuevo ejemplo'}</h4>
            
            <div className="space-y-2">
              <Label htmlFor="problem">Problema</Label>
              <Input
                id="problem"
                placeholder="ej. 5 + 7 = ?"
                value={newProblem}
                onChange={(e) => handleProblemChange(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Escribe el problema matemático con "?" para la incógnita
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solución</Label>
              <Input
                id="solution"
                placeholder="ej. 12"
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                La respuesta correcta al problema
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explicación</Label>
              <Textarea
                id="explanation"
                placeholder="ej. Para resolver 5 + 7, sumamos: 5 + 7 = 12"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Cómo resolver el problema paso a paso
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                variant="secondary"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !topic}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar con IA
                  </>
                )}
              </Button>
            </div>

            <Button 
              onClick={handleAddExample}
              disabled={!newProblem.trim() || !newSolution.trim() || !newExplanation.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {editingExample ? 'Actualizar Ejemplo' : 'Agregar Ejemplo'}
            </Button>
          </div>

          {/* Examples list */}
          <div className="space-y-2">
            <Label>
              Ejemplos actuales ({hasStructuredExamples ? currentExamples.length : legacyExamples.length})
            </Label>
            {(hasStructuredExamples ? currentExamples.length === 0 : legacyExamples.length === 0) ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay ejemplos para este nivel aún
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[200px] rounded-lg border p-4">
                <div className="space-y-3">
                  {hasStructuredExamples ? (
                    // Mostrar ejemplos estructurados
                    currentExamples.map((example, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-background p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <p className="font-mono text-sm">
                              <span className="text-muted-foreground">Problema:</span> {example.problem}
                            </p>
                            <p className="font-mono text-sm">
                              <span className="text-muted-foreground">Solución:</span> {example.solution}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="text-muted-foreground">Explicación:</span> {example.explanation}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveExample(index)}
                            className="h-8 w-8 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Mostrar ejemplos legacy (string)
                    legacyExamples.map((example, index) => (
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
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}