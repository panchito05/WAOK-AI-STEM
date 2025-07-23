'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PracticeCard, StructuredExample } from '@/lib/storage';
import { useCards } from '@/hooks/use-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Save, 
  X, 
  Sparkles,
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api-client';
// Note: generateExamplesForAllLevelsAction is not available in the API client yet
import { generateExamplesForAllLevelsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { exerciseCache } from '@/lib/exercise-cache';
import LevelExamplesDialog from '@/components/LevelExamplesDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formSchema = z.object({
  topic: z.string().min(2, 'El tema debe tener al menos 2 caracteres'),
  difficulty: z.number().min(1).max(10),
  customInstructions: z.string().optional(),
  exerciseCount: z.number().min(1).max(50),
  attemptsPerExercise: z.number().min(1).max(10),
  autoCompensation: z.boolean(),
  adaptiveDifficulty: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CardEditorProps {
  card?: PracticeCard | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const { createCard, updateCard, deleteCard } = useCards();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [correctedTopic, setCorrectedTopic] = useState<string>('');
  const [topicColor, setTopicColor] = useState<string>('');
  const [topicIcon, setTopicIcon] = useState<string>('');
  const [checkingSpelling, setCheckingSpelling] = useState(false);
  const [suggestedColor, setSuggestedColor] = useState<string>('');
  const [suggestedIcon, setSuggestedIcon] = useState<string>('');
  const [examplesDialogOpen, setExamplesDialogOpen] = useState(false);
  const [levelExamples, setLevelExamples] = useState<{ [level: number]: string[] }>(
    card?.levelExamples || {}
  );
  const [structuredExamples, setStructuredExamples] = useState<{ [level: number]: StructuredExample[] }>(
    card?.structuredExamples || {}
  );
  const [editingExample, setEditingExample] = useState<{ index: number; example: StructuredExample } | null>(null);
  const [generatingExamples, setGeneratingExamples] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [lastGeneratedTopic, setLastGeneratedTopic] = useState<string>('');
  const [regeneratingLevel, setRegeneratingLevel] = useState<number | null>(null);

  // Initialize color and icon from existing card
  useEffect(() => {
    if (card) {
      setTopicColor(card.color || '');
      setTopicIcon(card.icon || '');
    }
  }, [card]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: card?.topic || '',
      difficulty: card?.difficulty || 5,
      customInstructions: card?.customInstructions || '',
      exerciseCount: card?.exerciseCount || 10,
      attemptsPerExercise: card?.attemptsPerExercise || 3,
      autoCompensation: card?.autoCompensation || false,
      adaptiveDifficulty: card?.adaptiveDifficulty || false,
    },
  });

  const difficulty = form.watch('difficulty');
  const topic = form.watch('topic');

  // Correct spelling when topic changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (topic && topic.length > 2) {
        setCheckingSpelling(true);
        try {
          const result = await api.correctSpelling(topic, true); // useAI = true
          if (result.data) {
            const { correctedText, color, icon } = result.data;
            if (correctedText !== topic) {
              setCorrectedTopic(correctedText);
              setSuggestedColor(color || '');
              setSuggestedIcon(icon || '');
            } else {
              setCorrectedTopic('');
              setSuggestedColor('');
              setSuggestedIcon('');
              // Still set the color and icon for the current topic
              setTopicColor(color || '');
              setTopicIcon(icon || '');
            }
          }
        } catch (error) {
          console.error('Error checking spelling:', error);
        } finally {
          setCheckingSpelling(false);
        }
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [topic]);

  // Generate examples automatically when topic changes - DISABLED
  // Now users must manually regenerate examples for each level
  /*
  useEffect(() => {
    // Use corrected topic if available, otherwise use raw topic
    const currentTopic = correctedTopic || topic;
    
    const shouldGenerateExamples = 
      currentTopic && // Topic is set
      currentTopic.length > 2 && // Topic is valid
      currentTopic !== lastGeneratedTopic && // Topic has changed
      !generatingExamples; // Not already generating

    if (shouldGenerateExamples) {
      const timer = setTimeout(async () => {
        setGeneratingExamples(true);
        setGenerationProgress('Generando ejemplos para todos los niveles...');
        
        try {
          const result = await generateExamplesForAllLevelsAction(currentTopic);
          if (result.data) {
            setStructuredExamples(result.data);
            setLastGeneratedTopic(currentTopic); // Track the topic we generated for
            toast({
              title: 'Ejemplos actualizados',
              description: `Se generaron ejemplos para "${currentTopic}"`,
            });
          }
        } catch (error) {
          console.error('Error generating examples:', error);
          toast({
            title: 'Error',
            description: 'No se pudieron generar los ejemplos automáticamente',
            variant: 'destructive',
          });
        } finally {
          setGeneratingExamples(false);
          setGenerationProgress('');
        }
      }, 2000); // Wait 2 seconds after user stops typing

      return () => clearTimeout(timer);
    }
  }, [topic, correctedTopic, lastGeneratedTopic, generatingExamples, toast]);
  */


  const onSubmit = async (values: FormValues) => {
    console.log('Form submitted with values:', values);
    setIsLoading(true);
    try {
      let savedCard;
      
      // Ensure we have color and icon even if user didn't apply correction
      let finalColor = topicColor;
      let finalIcon = topicIcon;
      
      if (!finalColor || !finalIcon) {
        // Get color and icon for the current topic
        const result = await api.correctSpelling(values.topic, true); // useAI = true
        if (result.data) {
          finalColor = result.data.color || '';
          finalIcon = result.data.icon || '';
        }
      }
      
      console.log('Creating card with:', { ...values, color: finalColor, icon: finalIcon });
      
      if (card) {
        // Update existing card
        savedCard = await updateCard(card.id, {
          ...values,
          name: values.topic, // Use topic as name
          levelExamples: levelExamples,
          structuredExamples: structuredExamples,
          color: finalColor || card.color,
          icon: finalIcon || card.icon
        });
        
        // Clear cache if topic, difficulty, instructions, or examples changed
        const examplesChanged = JSON.stringify(card.levelExamples) !== JSON.stringify(levelExamples) ||
                               JSON.stringify(card.structuredExamples) !== JSON.stringify(structuredExamples);
        if (card.topic !== values.topic || 
            card.difficulty !== values.difficulty || 
            card.customInstructions !== values.customInstructions ||
            examplesChanged) {
          exerciseCache.clearPool(card.id);
          
          // Preload new exercises
          if (savedCard) {
            toast({
              title: 'Actualizando ejercicios',
              description: 'Preparando nuevos ejercicios...',
            });
            
            exerciseCache.preloadExercises({
              id: savedCard.id,
              topic: savedCard.topic,
              difficulty: savedCard.difficulty,
              customInstructions: savedCard.customInstructions,
              levelExamples: savedCard.levelExamples,
              structuredExamples: savedCard.structuredExamples
            });
          }
        }
      } else {
        // Create new card
        savedCard = await createCard({
          ...values,
          name: values.topic, // Use topic as name
          customInstructions: values.customInstructions || '',
          isFavorite: false,
          levelExamples: levelExamples,
          structuredExamples: structuredExamples,
          color: finalColor,
          icon: finalIcon
        });
        
        // Preload exercises for new card
        if (savedCard) {
          toast({
            title: 'Preparando ejercicios',
            description: 'Generando ejercicios para práctica inmediata...',
          });
          
          exerciseCache.preloadExercises({
            id: savedCard.id,
            topic: savedCard.topic,
            difficulty: savedCard.difficulty,
            customInstructions: savedCard.customInstructions
          });
        }
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la tarjeta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    
    setIsLoading(true);
    try {
      await deleteCard(card.id);
      toast({
        title: 'Tarjeta eliminada',
        description: 'La tarjeta se ha eliminado correctamente.',
      });
      onSave(); // Call onSave to refresh the list
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarjeta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const applyCorrectedTopic = () => {
    form.setValue('topic', correctedTopic);
    setTopicColor(suggestedColor);
    setTopicIcon(suggestedIcon);
    setSuggestedColor('');
    setSuggestedIcon('');
    // Clear corrected topic after a small delay to allow the examples useEffect to trigger
    setTimeout(() => {
      setCorrectedTopic('');
    }, 100);
  };

  const handleRegenerateExamples = async (level: number) => {
    const currentTopic = correctedTopic || topic;
    const currentInstructions = form.getValues('customInstructions');
    
    if (!currentTopic || currentTopic.length < 3) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un tema válido primero',
        variant: 'destructive',
      });
      return;
    }

    setRegeneratingLevel(level);
    
    try {
      const result = await api.generateExamplesForSingleLevel(currentTopic, level, currentInstructions);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        setStructuredExamples(prev => ({
          ...prev,
          [level]: result.data[level]
        }));
        toast({
          title: 'Ejemplos regenerados',
          description: `Se regeneraron los ejemplos del nivel ${level}`,
        });
      }
    } catch (error) {
      console.error('Error regenerating examples:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudieron regenerar los ejemplos';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setRegeneratingLevel(null);
    }
  };

  const getDifficultyLabel = (value: number) => {
    if (value <= 3) return 'Fácil';
    if (value <= 6) return 'Intermedio';
    if (value <= 8) return 'Difícil';
    return 'Experto';
  };

  const getDifficultyColor = (value: number) => {
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-yellow-600';
    if (value <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{card ? 'Editar Tarjeta' : 'Crear Nueva Tarjeta'}</CardTitle>
          <CardDescription>
            Configura los parámetros de tu sesión de práctica personalizada
          </CardDescription>
        </CardHeader>
        
        <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema Matemático</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="ej. Multiplicación, Fracciones, Álgebra" 
                        {...field} 
                      />
                      {checkingSpelling && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  {correctedTopic && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        ¿Quisiste decir "{correctedTopic}"?
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={applyCorrectedTopic}
                      >
                        Aplicar corrección
                      </Button>
                    </div>
                  )}
                  <FormDescription>
                    El tema sobre el cual se generarán los ejercicios
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de Dificultad</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">1</span>
                        <Badge variant="secondary" className={getDifficultyColor(field.value)}>
                          {field.value} - {getDifficultyLabel(field.value)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">10</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Ajusta la complejidad de los ejercicios
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Example Problem Preview */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Ejemplos del nivel {difficulty}:</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerateExamples(difficulty)}
                  disabled={regeneratingLevel === difficulty || !topic || topic.length < 3}
                  className="h-8 px-3"
                >
                  {regeneratingLevel === difficulty ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerar ejemplo
                    </>
                  )}
                </Button>
              </div>
              {structuredExamples[difficulty]?.length > 0 ? (
                <div className="space-y-3">
                  {structuredExamples[difficulty].slice(0, 3).map((example, index) => (
                    <div key={index} className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <p className="font-mono text-base">{example.problem}</p>
                        <p className="text-sm text-muted-foreground">
                          Respuesta: {example.solution}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingExample({ index, example });
                          setExamplesDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {structuredExamples[difficulty].length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      y {structuredExamples[difficulty].length - 3} ejemplo{structuredExamples[difficulty].length - 3 !== 1 ? 's' : ''} más...
                    </p>
                  )}
                </div>
              ) : levelExamples[difficulty]?.length > 0 ? (
                <div className="space-y-2">
                  {levelExamples[difficulty].slice(0, 3).map((example, index) => (
                    <p key={index} className="font-mono text-base">{example}</p>
                  ))}
                  {levelExamples[difficulty].length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      y {levelExamples[difficulty].length - 3} ejemplo{levelExamples[difficulty].length - 3 !== 1 ? 's' : ''} más...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay ejemplos para este nivel.
                </p>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingExample(null);
                  setExamplesDialogOpen(true);
                }}
                className="h-8 px-3 mt-3 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ejemplos
              </Button>
            </div>

            <FormField
              control={form.control}
              name="customInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones Personalizadas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ej. No usar números negativos, incluir solo números enteros"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instrucciones adicionales para la generación de ejercicios
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exerciseCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de Ejercicios</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Número de problemas en la sesión
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attemptsPerExercise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intentos por Ejercicio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Intentos antes de mostrar solución
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoCompensation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Compensación Automática
                    </FormLabel>
                    <FormDescription>
                      Agregar un ejercicio extra por cada fallo o solución revelada
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adaptiveDifficulty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Dificultad Adaptativa
                    </FormLabel>
                    <FormDescription>
                      Aumenta el nivel después de 10 correctas seguidas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              {card && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
              <Button type="submit" disabled={isLoading || generatingExamples} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : generatingExamples ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando ejemplos...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {card ? 'Guardar Cambios' : 'Crear Tarjeta'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>

      {/* Level Examples Dialog */}
      <LevelExamplesDialog
        open={examplesDialogOpen}
        onOpenChange={(open) => {
          setExamplesDialogOpen(open);
          if (!open) {
            setEditingExample(null);
          }
        }}
        level={difficulty}
        examples={levelExamples[difficulty] || []}
        structuredExamples={structuredExamples[difficulty]}
        editingExample={editingExample}
        onUpdateExamples={(examples) => {
          setLevelExamples(prev => ({
            ...prev,
            [difficulty]: examples
          }));
        }}
        onUpdateStructuredExamples={(examples) => {
          setStructuredExamples(prev => ({
            ...prev,
            [difficulty]: examples
          }));
          setEditingExample(null);
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarjeta "{card?.topic}" y todos sus ejercicios serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}