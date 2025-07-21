'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CompactAnswerPanel from './CompactAnswerPanel';
import { cn } from '@/lib/utils';
import { 
  Eraser, 
  Pencil, 
  RotateCcw,
  Download,
  Palette,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Define line structure
interface Line {
  points: number[];
  tool: 'pen' | 'eraser';
  color: string;
  strokeWidth: number;
}

interface DrawingCanvasSimpleProps {
  onClear?: () => void;
  height?: number;
  operationText?: string;
  onSubmitAnswer?: (answer: string) => void;
  attempts?: number;
  maxAttempts?: number;
  showSolution?: boolean;
  feedback?: {
    isCorrect: boolean;
    message: string;
  };
}

const COLORS = [
  '#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
];

export default function DrawingCanvasSimple({ 
  onClear, 
  height = 400, 
  operationText,
  onSubmitAnswer,
  attempts = 0,
  maxAttempts = 3,
  showSolution = false,
  feedback
}: DrawingCanvasSimpleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [textPosition, setTextPosition] = useState({ x: 0.5, y: 0.1 }); // Relative position
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [textBounds, setTextBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Centralized redraw function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all lines
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.points[0], line.points[1]);
      for (let i = 2; i < line.points.length; i += 2) {
        ctx.lineTo(line.points[i], line.points[i + 1]);
      }
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = line.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.stroke();
    });

    // Draw the operation text
    drawOperationText(ctx, canvas);
  }, [lines, operationText, textPosition]);

  // Function to draw operation text
  const drawOperationText = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!operationText) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(operationText);
    const textWidth = textMetrics.width;
    const padding = 30;
    const bgHeight = 50;
    const bgWidth = textWidth + padding * 2;

    const x = textPosition.x * canvas.width;
    const y = textPosition.y * canvas.height;

    const bgX = x - bgWidth / 2;
    const bgY = y - bgHeight / 2;

    setTextBounds({ x: bgX, y: bgY, width: bgWidth, height: bgHeight });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);

    ctx.fillStyle = '#000000';
    ctx.fillText(operationText, x, y);
    ctx.restore();
  };

  // Effect for resizing and initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = document.getElementById('canvas-container-simple');
      if (container) {
        const newWidth = isFullscreen ? window.innerWidth : container.offsetWidth;
        const newHeight = isFullscreen ? window.innerHeight : height;
        
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          redrawCanvas();
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height, isFullscreen, redrawCanvas]);

  // Redraw when operation text changes
  useEffect(() => {
    redrawCanvas();
  }, [operationText, redrawCanvas]);

  // Reset text position when toggling fullscreen or clearing
  useEffect(() => {
    setTextPosition({ x: 0.5, y: 0.1 });
  }, [isFullscreen]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const isMouseOverText = (x: number, y: number): boolean => {
    return x >= textBounds.x && x <= textBounds.x + textBounds.width &&
           y >= textBounds.y && y <= textBounds.y + textBounds.height;
  };

  const startInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e);
    if (isMouseOverText(x, y)) {
      setIsDraggingText(true);
      setDragOffset({ x: x - textPosition.x * (canvasRef.current?.width || 0), y: y - textPosition.y * (canvasRef.current?.height || 0) });
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    } else {
      setIsDrawing(true);
      const newLine: Line = {
        tool,
        points: [x, y],
        color: tool === 'pen' ? currentColor : '#FFFFFF',
        strokeWidth: tool === 'eraser' ? 20 : 3,
      };
      setLines(prev => [...prev, newLine]);
    }
  };

  const moveInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isDraggingText) return;
    const { x, y } = getCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingText) {
      const newX = (x - dragOffset.x) / canvas.width;
      const newY = (y - dragOffset.y) / canvas.height;
      setTextPosition({ 
        x: Math.max(0, Math.min(1, newX)), 
        y: Math.max(0, Math.min(1, newY))
      });
      redrawCanvas();
    } else if (isDrawing) {
      setLines(prev => {
        const newLines = [...prev];
        const lastLine = newLines[newLines.length - 1];
        lastLine.points.push(x, y);
        return newLines;
      });
      redrawCanvas();
    }
  };

  const stopInteraction = () => {
    setIsDrawing(false);
    setIsDraggingText(false);
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  };

  const handleClear = () => {
    setLines([]);
    setTextPosition({ x: 0.5, y: 0.1 });
    // Redraw is triggered by state updates
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawOperationText(ctx, canvas);
      }
    }
    onClear?.();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'math-work.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out",
      isFullscreen ? "fixed inset-0 z-50 bg-white flex flex-col" : "space-y-4"
    )}>
      <div className={`flex items-center justify-between gap-2 flex-wrap ${isFullscreen ? 'p-4 bg-white shadow-md' : ''}`}>
        <div className="flex items-center gap-2">
          <Button variant={tool === 'pen' ? 'default' : 'outline'} size="sm" onClick={() => setTool('pen')}><Pencil className="h-4 w-4" /></Button>
          <Button variant={tool === 'eraser' ? 'default' : 'outline'} size="sm" onClick={() => setTool('eraser')}><Eraser className="h-4 w-4" /></Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={handleClear}><RotateCcw className="h-4 w-4 mr-2" />Limpiar</Button>
          <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        {tool === 'pen' && (
          <div className="flex items-center gap-1">
            <Palette className="h-4 w-4 text-muted-foreground mr-2" />
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 transition-all ${currentColor === color ? 'border-primary scale-110' : 'border-transparent hover:border-gray-300'}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
        )}
      </div>

      <Card 
        id="canvas-container-simple"
        className={`overflow-hidden bg-white relative ${isFullscreen ? 'flex-1 m-4 mt-0' : ''}`}
        style={{ 
          backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          minHeight: isFullscreen ? '0' : `${height}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 touch-none"
          onMouseDown={startInteraction}
          onMouseMove={moveInteraction}
          onMouseUp={stopInteraction}
          onMouseLeave={stopInteraction}
          onTouchStart={startInteraction}
          onTouchMove={moveInteraction}
          onTouchEnd={stopInteraction}
          style={{ cursor: tool === 'eraser' ? 'grab' : 'crosshair' }}
        />
      </Card>

      {!isFullscreen && (
        <p className="text-xs text-muted-foreground text-center">
          Usa el lienzo para resolver el problema. Puedes dibujar, borrar y descargar tu trabajo.
        </p>
      )}
      
      {isFullscreen && onSubmitAnswer && (
        <CompactAnswerPanel
          onSubmit={onSubmitAnswer}
          attempts={attempts}
          maxAttempts={maxAttempts}
          showSolution={showSolution}
          feedback={feedback}
          className="bottom-4 right-4"
        />
      )}
    </div>
  );
}