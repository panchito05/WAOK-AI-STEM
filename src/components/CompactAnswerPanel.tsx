'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { userPreferences } from '@/lib/user-preferences';
import { 
  Send, 
  Calculator,
  CheckCircle,
  XCircle,
  GripVertical,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactAnswerPanelProps {
  onSubmit: (answer: string) => void;
  attempts: number;
  maxAttempts: number;
  showSolution: boolean;
  feedback?: {
    isCorrect: boolean;
    message: string;
  };
  className?: string;
  solution?: string;
  hint?: string;
  onNext?: () => void;
  isLastExercise?: boolean;
  cardId?: string;
  onRevealSolution?: () => void;
  isReviewMode?: boolean;
  userAnswer?: string;
  onBackToActive?: () => void;
}

export default function CompactAnswerPanel({
  onSubmit,
  attempts,
  maxAttempts,
  showSolution,
  feedback,
  className,
  solution,
  hint,
  onNext,
  isLastExercise = false,
  cardId,
  onRevealSolution,
  isReviewMode = false,
  userAnswer,
  onBackToActive
}: CompactAnswerPanelProps) {
  const [answer, setAnswer] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [keepNumpadOpen, setKeepNumpadOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Initialize position based on viewport size
  const getInitialPosition = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (isMobile) {
      // Top center for mobile
      return { 
        x: (window.innerWidth - 350) / 2, // Center horizontally
        y: 100 // Top position
      };
    } else if (isTablet) {
      // Top right for tablet
      return { 
        x: window.innerWidth - 370,
        y: 100 // Top position
      };
    } else {
      // Top right for desktop
      return { x: window.innerWidth - 370, y: 100 }; // Top position
    }
  };
  
  const [position, setPosition] = useState(getInitialPosition);

  const remainingAttempts = maxAttempts - attempts;
  const canSubmit = remainingAttempts > 0 && !showSolution;
  
  // Use userAnswer when in review mode
  useEffect(() => {
    if (isReviewMode && userAnswer !== undefined) {
      setAnswer(userAnswer);
    }
  }, [isReviewMode, userAnswer]);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isDragging) {
        // Only reset position if not currently dragging
        const newPos = getInitialPosition();
        setPosition(newPos);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging]);

  // No animation needed - panel appears instantly
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // Adjust position when numpad is shown/hidden to keep panel in viewport
  useEffect(() => {
    if (!panelRef.current || isDragging) return;
    
    const adjustPositionForNumpad = () => {
      const rect = panelRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Estimate additional height for numpad and solution content
      const estimatedNumpadHeight = showNumpad ? 250 : 0;
      const estimatedSolutionHeight = showSolution && solution ? 200 : 0; // Approximation for solution UI
      const totalHeight = rect.height + estimatedNumpadHeight + estimatedSolutionHeight;
      const bottomEdge = position.y + totalHeight;
      
      // Check if panel would go off-screen at the bottom
      if (bottomEdge > window.innerHeight - 20) {
        // Calculate minimum Y position to stay below toolbar (approximately 80px for controls + padding)
        const minY = 100;
        const newY = Math.max(minY, window.innerHeight - totalHeight - 20);
        setPosition(prev => ({ ...prev, y: newY }));
      }
    };
    
    // Small delay to allow DOM to update
    const timer = setTimeout(adjustPositionForNumpad, 50);
    return () => clearTimeout(timer);
  }, [showNumpad, isDragging, showSolution, solution]);

  // Load user preferences on mount
  useEffect(() => {
    if (cardId) {
      const savedAutoAdvance = userPreferences.getAutoAdvance(cardId);
      setAutoAdvance(savedAutoAdvance);
      const savedKeepNumpad = userPreferences.getKeepNumpadOpen(cardId);
      setKeepNumpadOpen(savedKeepNumpad);
    }
  }, [cardId]);

  // Auto-advance logic
  useEffect(() => {
    if (showSolution && feedback?.isCorrect && autoAdvance && !isLastExercise && onNext) {
      // Start countdown
      let timeLeft = 3;
      setCountdown(timeLeft);
      
      const interval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          setCountdown(null);
          onNext();
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        setCountdown(null);
      };
    } else {
      setCountdown(null);
    }
  }, [showSolution, feedback?.isCorrect, autoAdvance, isLastExercise, onNext]);

  // Handle auto-advance preference change
  const handleAutoAdvanceChange = (checked: boolean) => {
    setAutoAdvance(checked);
    if (cardId) {
      userPreferences.setAutoAdvance(cardId, checked);
    }
  };

  // Handle keep numpad open preference change
  const handleKeepNumpadOpenChange = (checked: boolean) => {
    setKeepNumpadOpen(checked);
    if (cardId) {
      userPreferences.setKeepNumpadOpen(cardId, checked);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (answer.trim() && canSubmit) {
      onSubmit(answer);
      if (!feedback?.isCorrect) {
        setAnswer('');
      }
      // Auto-hide numpad after submitting (unless user wants to keep it open)
      if (!keepNumpadOpen) {
        setTimeout(() => setShowNumpad(false), 500);
      }
    }
  };

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setAnswer('');
    } else if (value === '←') {
      setAnswer(prev => prev.slice(0, -1));
    } else {
      setAnswer(prev => prev + value);
    }
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && panelRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Get panel dimensions
        const rect = panelRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 20;
        const maxY = window.innerHeight - rect.height - 20;
        
        // Constrain within viewport
        setPosition({
          x: Math.max(20, Math.min(maxX, newX)),
          y: Math.max(20, Math.min(maxY, newY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const numpadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '0', '.', '/',
    '+', '-', '×',
    'C', '=', '←'
  ];

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50",
        isDragging ? "cursor-grabbing" : "",
        isHovered || isDragging ? "opacity-100" : "opacity-80",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: window.innerWidth < 768 ? '90vw' : '350px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      <Card className={cn(
        "shadow-lg border-2 bg-white/95 backdrop-blur-sm",
        isHovered && !isDragging ? "scale-105" : "scale-100"
      )}>
        {/* Drag handle */}
        <div className="drag-handle flex items-center justify-center h-6 bg-gray-100 rounded-t-lg cursor-grab hover:bg-gray-200 transition-colors">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <div className="p-4 space-y-3">
          {/* Header with attempts */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tu Respuesta</span>
            <Badge variant={remainingAttempts > 1 ? 'default' : 'destructive'} className="text-xs">
              {remainingAttempts} {remainingAttempts === 1 ? 'intento' : 'intentos'}
            </Badge>
          </div>

          {/* Input and submit */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe aquí"
                className="text-lg font-mono h-10 pr-10"
                disabled={showSolution || isReviewMode}
                autoFocus
              />
              <Calculator 
                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowNumpad(!showNumpad)}
              />
            </div>
            
            {!isReviewMode && (
              <Button
                type="submit"
                disabled={!canSubmit || !answer.trim()}
                className="w-full h-9"
                size="sm"
              >
                <Send className="mr-2 h-3 w-3" />
                Verificar
              </Button>
            )}
          </form>

          {/* Reveal answer button when out of attempts */}
          {remainingAttempts === 0 && !showSolution && onRevealSolution && !isReviewMode && (
            <Button
              onClick={onRevealSolution}
              variant="outline"
              className="w-full h-9"
              size="sm"
            >
              Mostrar respuesta
            </Button>
          )}

          {/* Feedback */}
          {feedback && (
            <Alert className={cn(
              "py-2",
              feedback.isCorrect ? 'border-green-500' : 'border-red-500'
            )}>
              {feedback.isCorrect ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <AlertDescription className="text-xs ml-1">{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Solution and explanation when shown */}
          {showSolution && solution && (
            <div className="space-y-2">
              <Alert className="border-green-500 bg-green-50 py-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <AlertDescription className="text-xs text-green-900 ml-1">
                  <span className="font-semibold">Respuesta:</span> {solution}
                </AlertDescription>
              </Alert>
              
              {hint && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-xs text-blue-900 mb-1">Explicación:</h4>
                    <p className="text-xs text-blue-800">{hint}</p>
                  </CardContent>
                </Card>
              )}

              {onNext && (
                <div className="flex flex-col gap-2">
                  {!isLastExercise && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="flex items-center gap-2 bg-white/95 px-3 py-1.5 h-8 border border-primary/20 rounded-md hover:bg-gray-50 transition-colors cursor-pointer group"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAutoAdvanceChange(!autoAdvance);
                            }}
                          >
                            <Checkbox
                              id="auto-advance-compact"
                              checked={autoAdvance}
                              onCheckedChange={handleAutoAdvanceChange}
                              className="h-3 w-3 border-2 border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white pointer-events-none"
                            />
                            <label
                              htmlFor="auto-advance-compact"
                              className="text-xs font-medium select-none text-gray-700 group-hover:text-gray-900 pointer-events-none"
                            >
                              Auto continue
                            </label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Avanzar automáticamente después de 3 segundos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <Button 
                    onClick={onNext}
                    className="w-full h-8 text-xs"
                    size="sm"
                    disabled={countdown !== null}
                  >
                    {countdown !== null ? (
                      <>Continuando en {countdown}...</>
                    ) : (
                      <>
                        {isLastExercise ? 'Finalizar' : 'Siguiente Ejercicio'}
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Back to Active button for review mode */}
          {isReviewMode && onBackToActive && (
            <Button 
              onClick={onBackToActive}
              className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              Volver al Activo
            </Button>
          )}

          {/* Numpad */}
          {showNumpad && !showSolution && !isReviewMode && (
            <>
              {/* Keep numpad open preference */}
              <div className="mt-2 mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer group"
                        onClick={(e) => {
                          e.preventDefault();
                          handleKeepNumpadOpenChange(!keepNumpadOpen);
                        }}
                      >
                        <Checkbox
                          id="keep-numpad-open"
                          checked={keepNumpadOpen}
                          onCheckedChange={handleKeepNumpadOpenChange}
                          className="h-3 w-3 border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white pointer-events-none"
                        />
                        <label
                          htmlFor="keep-numpad-open"
                          className="text-xs font-medium select-none text-gray-700 group-hover:text-gray-900 pointer-events-none"
                        >
                          Mantener teclado abierto
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">El teclado permanecerá abierto después de cada respuesta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="grid grid-cols-3 gap-1 pt-2 border-t">
                {numpadButtons.map((btn) => (
                <Button
                  key={btn}
                  variant={btn === 'C' ? 'destructive' : btn === '←' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleNumpadClick(btn)}
                  className={cn(
                    "font-mono",
                    window.innerWidth < 768 ? "h-7 text-xs" : "h-8 text-sm"
                  )}
                  type="button"
                >
                  {btn}
                </Button>
              ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}