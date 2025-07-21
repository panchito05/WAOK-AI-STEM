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
  Pencil
} from 'lucide-react';
import { correctSpellingAction, generateExamplesForAllLevelsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { exerciseCache } from '@/lib/exercise-cache';
import LevelExamplesDialog from '@/components/LevelExamplesDialog';

const formSchema = z.object({
  topic: z.string().min(2, 'El tema debe tener al menos 2 caracteres'),
  difficulty: z.number().min(1).max(10),
  customInstructions: z.string().optional(),
  exerciseCount: z.number().min(1).max(50),
  attemptsPerExercise: z.number().min(1).max(10),
  autoCompensation: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CardEditorProps {
  card?: PracticeCard | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const { createCard, updateCard } = useCards();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
          const result = await correctSpellingAction(topic);
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

  // Generate examples automatically when topic is set and no examples exist
  useEffect(() => {
    const shouldGenerateExamples = 
      !card && // Only for new cards
      topic && // Topic is set
      topic.length > 2 && // Topic is valid
      Object.keys(structuredExamples).length === 0 && // No examples exist
      !generatingExamples; // Not already generating

    if (shouldGenerateExamples) {
      const timer = setTimeout(async () => {
        setGeneratingExamples(true);
        setGenerationProgress('Generando ejemplos para todos los niveles...');
        
        try {
          const result = await generateExamplesForAllLevelsAction(topic);
          if (result.data) {
            setStructuredExamples(result.data);
            toast({
              title: 'Ejemplos generados',
              description: 'Se generaron ejemplos para todos los niveles automáticamente',
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
  }, [topic, card, structuredExamples, generatingExamples, toast]);


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
        const result = await correctSpellingAction(values.topic);
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

  const applyCorrectedTopic = () => {
    form.setValue('topic', correctedTopic);
    setCorrectedTopic('');
    setTopicColor(suggestedColor);
    setTopicIcon(suggestedIcon);
    setSuggestedColor('');
    setSuggestedIcon('');
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
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Ejemplos del nivel {difficulty}:</span>
                {generatingExamples && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">{generationProgress}</span>
                  </div>
                )}
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

            <div className="flex gap-3 pt-4">
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
    </>
  );
}