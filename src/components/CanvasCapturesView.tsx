'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download,
  Trash2,
  Filter,
  Image,
  CheckCircle,
  XCircle,
  Calendar,
  Calculator,
  Plus,
  Minus,
  X,
  Divide,
  Brain,
  Eye
} from 'lucide-react';
import { canvasCapturesStorage, CanvasCapture } from '@/lib/canvas-captures';
import { cardStorage } from '@/lib/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DrawingCanvasSimple from './DrawingCanvasSimple';
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

interface CanvasCapturesViewProps {
  filterCardId?: string;
}

const operationIcons = {
  suma: Plus,
  resta: Minus,
  multiplicacion: X,
  division: Divide,
  otro: Calculator,
  mixto: Brain,
};

export default function CanvasCapturesView({ filterCardId }: CanvasCapturesViewProps) {
  const [captures, setCaptures] = useState<CanvasCapture[]>([]);
  const [filteredCaptures, setFilteredCaptures] = useState<CanvasCapture[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<string>('all');
  const [selectedCorrectness, setSelectedCorrectness] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<string>(filterCardId || 'all');
  const [cards, setCards] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCapture, setSelectedCapture] = useState<CanvasCapture | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [captureToDelete, setCaptureToDelete] = useState<CanvasCapture | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load all captures
    const allCaptures = canvasCapturesStorage.getAll();
    const capturesList: CanvasCapture[] = [];
    
    Object.values(allCaptures).forEach(cardCaptures => {
      capturesList.push(...cardCaptures);
    });
    
    // Sort by timestamp (newest first)
    capturesList.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setCaptures(capturesList);
    
    // Load cards
    const allCards = cardStorage.getAll();
    setCards(allCards.map(c => ({ id: c.id, name: c.name })));
    
    // Load stats
    setStats(canvasCapturesStorage.getStats());
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...captures];
    
    // Filter by card
    if (selectedCard !== 'all') {
      filtered = filtered.filter(c => c.cardId === selectedCard);
    }
    
    // Filter by operation
    if (selectedOperation !== 'all') {
      filtered = filtered.filter(c => c.operationType === selectedOperation);
    }
    
    // Filter by correctness
    if (selectedCorrectness === 'correct') {
      filtered = filtered.filter(c => c.isCorrect);
    } else if (selectedCorrectness === 'incorrect') {
      filtered = filtered.filter(c => !c.isCorrect);
    }
    
    setFilteredCaptures(filtered);
  }, [captures, selectedCard, selectedOperation, selectedCorrectness]);

  const handleDelete = (capture: CanvasCapture) => {
    setCaptureToDelete(capture);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (captureToDelete) {
      canvasCapturesStorage.delete(captureToDelete.cardId, captureToDelete.id);
      loadData();
      setShowDeleteDialog(false);
      setCaptureToDelete(null);
      if (selectedCapture?.id === captureToDelete.id) {
        setSelectedCapture(null);
      }
    }
  };

  const exportCapture = (capture: CanvasCapture) => {
    const data = JSON.stringify(capture, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capture_${capture.cardName}_${format(new Date(capture.timestamp), 'yyyy-MM-dd_HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const OperationIcon = (type: string) => {
    const Icon = operationIcons[type as keyof typeof operationIcons] || Calculator;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Capturas de Cálculos</h2>
            <p className="text-muted-foreground">
              Revisa los cálculos y procesos de resolución guardados
            </p>
          </div>
          {stats && (
            <div className="flex gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.totalCaptures}</div>
                  <p className="text-xs text-muted-foreground">Total capturas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.correctVsIncorrect.correct}
                  </div>
                  <p className="text-xs text-muted-foreground">Correctas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.correctVsIncorrect.incorrect}
                  </div>
                  <p className="text-xs text-muted-foreground">Incorrectas</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Tarjeta</label>
                <Select value={selectedCard} onValueChange={setSelectedCard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las tarjetas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tarjetas</SelectItem>
                    {cards.map(card => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Operación</label>
                <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las operaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las operaciones</SelectItem>
                    <SelectItem value="suma">Suma</SelectItem>
                    <SelectItem value="resta">Resta</SelectItem>
                    <SelectItem value="multiplicacion">Multiplicación</SelectItem>
                    <SelectItem value="division">División</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select value={selectedCorrectness} onValueChange={setSelectedCorrectness}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="correct">Solo correctas</SelectItem>
                    <SelectItem value="incorrect">Solo incorrectas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Captures list */}
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>Capturas ({filteredCaptures.length})</CardTitle>
            <CardDescription>
              Selecciona una captura para ver los detalles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px]">
              <div className="space-y-2">
                {filteredCaptures.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No hay capturas que coincidan con los filtros seleccionados.
                    </AlertDescription>
                  </Alert>
                ) : (
                  filteredCaptures.map(capture => (
                    <Card
                      key={capture.id}
                      className={`cursor-pointer transition-colors ${
                        selectedCapture?.id === capture.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedCapture(capture)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {OperationIcon(capture.operationType)}
                              <span className="font-medium">{capture.exerciseProblem}</span>
                              {capture.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Respuesta: {capture.userAnswer || '(Sin respuesta)'}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {capture.cardName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(capture.timestamp), 'dd MMM yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportCapture(capture);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(capture);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Canvas preview */}
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>Vista del Cálculo</CardTitle>
            <CardDescription>
              {selectedCapture ? (
                <div className="flex items-center gap-2">
                  <span>{selectedCapture.exerciseProblem}</span>
                  {selectedCapture.isCorrect ? (
                    <Badge variant="default" className="bg-green-500">
                      Correcto
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Incorrecto - Respuesta: {selectedCapture.correctAnswer}
                    </Badge>
                  )}
                </div>
              ) : (
                'Selecciona una captura para ver el cálculo'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCapture ? (
              <div className="space-y-4">
                {/* Canvas preview */}
                <div className="border rounded-lg overflow-hidden">
                  <DrawingCanvasSimple
                    height={350}
                    operationText={selectedCapture.exerciseProblem}
                    initialLines={selectedCapture.lines}
                    isReviewMode={true}
                    showSolution={true}
                    solution={selectedCapture.correctAnswer}
                    userAnswer={selectedCapture.userAnswer}
                    feedback={{
                      isCorrect: selectedCapture.isCorrect,
                      message: selectedCapture.isCorrect ? '¡Correcto!' : 'Incorrecto'
                    }}
                  />
                </div>
                
                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intentos:</span>
                    <span>{selectedCapture.attempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Respuesta del estudiante:</span>
                    <span className="font-medium">{selectedCapture.userAnswer || '(Sin respuesta)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Respuesta correcta:</span>
                    <span className="font-medium text-green-600">{selectedCapture.correctAnswer}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Selecciona una captura para ver el cálculo</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar captura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La captura será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCaptureToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}