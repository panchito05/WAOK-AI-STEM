'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Calculator,
  CheckCircle,
  XCircle,
  GripVertical
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
}

export default function CompactAnswerPanel({
  onSubmit,
  attempts,
  maxAttempts,
  showSolution,
  feedback,
  className
}: CompactAnswerPanelProps) {
  const [answer, setAnswer] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Initialize position based on viewport size
  const getInitialPosition = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (isMobile) {
      // Center horizontally at bottom for mobile
      return { 
        x: (window.innerWidth - 350) / 2, // Center horizontally
        y: window.innerHeight - 400 // Near bottom
      };
    } else if (isTablet) {
      // Bottom right for tablet
      return { 
        x: window.innerWidth - 370,
        y: window.innerHeight - 350
      };
    } else {
      // Bottom right for desktop
      return { x: window.innerWidth - 370, y: window.innerHeight - 300 };
    }
  };
  
  const [position, setPosition] = useState(getInitialPosition);

  const remainingAttempts = maxAttempts - attempts;
  const canSubmit = remainingAttempts > 0 && !showSolution;

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

  // Animate on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (answer.trim() && canSubmit) {
      onSubmit(answer);
      if (!feedback?.isCorrect) {
        setAnswer('');
      }
      // Auto-hide numpad after submitting
      setTimeout(() => setShowNumpad(false), 500);
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
        "fixed z-50 transition-all duration-200",
        isDragging ? "cursor-grabbing" : "",
        isHovered || isDragging ? "opacity-100" : "opacity-80",
        isMounted ? "translate-y-0 opacity-80" : "translate-y-4 opacity-0",
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
        "shadow-lg border-2 bg-white/95 backdrop-blur-sm transition-transform duration-200",
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
                disabled={showSolution}
                autoFocus
              />
              <Calculator 
                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowNumpad(!showNumpad)}
              />
            </div>
            
            <Button
              type="submit"
              disabled={!canSubmit || !answer.trim()}
              className="w-full h-9"
              size="sm"
            >
              <Send className="mr-2 h-3 w-3" />
              Verificar
            </Button>
          </form>

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

          {/* Numpad */}
          {showNumpad && !showSolution && (
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
          )}
        </div>
      </Card>
    </div>
  );
}