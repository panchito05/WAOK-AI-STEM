'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Eraser, 
  Pencil, 
  RotateCcw,
  Download,
  Palette
} from 'lucide-react';

interface DrawingCanvasSimpleProps {
  onClear?: () => void;
  height?: number;
  operationText?: string;
}

const COLORS = [
  '#000000', // Black
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
];

export default function DrawingCanvasSimple({ onClear, height = 400, operationText }: DrawingCanvasSimpleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [canvasSize, setCanvasSize] = useState({ width: 0, height });
  
  // Estados para drag & drop del texto
  const [textPosition, setTextPosition] = useState({ x: 0, y: 50 });
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [textBounds, setTextBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [canvasWithoutText, setCanvasWithoutText] = useState<ImageData | null>(null);

  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container-simple');
      if (container && canvasRef.current) {
        const width = container.offsetWidth;
        setCanvasSize({ width, height });
        
        // Preserve existing drawing when resizing
        const ctx = canvasRef.current.getContext('2d');
        let imageData = null;
        
        // Only get image data if canvas has valid dimensions
        if (canvasRef.current.width > 0 && canvasRef.current.height > 0 && ctx) {
          imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        if (imageData && ctx) {
          ctx.putImageData(imageData, 0, 0);
        }
        
        // Redraw operation text after resize with a small delay
        if (ctx && operationText && canvasRef.current) {
          setTimeout(() => {
            if (canvasRef.current) {
              drawOperationText(ctx, canvasRef.current);
            }
          }, 50);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height, operationText]);

  // Function to draw operation text on canvas
  const drawOperationText = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!operationText || !canvas.width || !canvas.height) return;
    
    // Save current context state
    ctx.save();
    
    // Clear any previous composite operations
    ctx.globalCompositeOperation = 'source-over';
    
    // Set text properties - use a fallback font
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw semi-transparent background for better readability
    const textMetrics = ctx.measureText(operationText);
    const textWidth = textMetrics.width;
    const padding = 30;
    const bgHeight = 50;
    
    // Calculate position - center if first time (x is 0)
    let bgX: number;
    let bgY: number;
    
    if (textPosition.x === 0) {
      // First time - center the text
      bgX = (canvas.width - textWidth - padding * 2) / 2;
      bgY = 25;
      // Update text position for future use
      setTextPosition({ x: bgX + (textWidth + padding * 2) / 2, y: bgY + bgHeight / 2 });
    } else {
      // Use existing position
      bgX = textPosition.x - (textWidth + padding * 2) / 2;
      bgY = textPosition.y - bgHeight / 2;
    }
    
    // Update text bounds for click detection
    setTextBounds({
      x: bgX,
      y: bgY,
      width: textWidth + padding * 2,
      height: bgHeight
    });
    
    // Draw background with border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(bgX, bgY, textWidth + padding * 2, bgHeight);
    
    // Draw border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bgX, bgY, textWidth + padding * 2, bgHeight);
    
    // Draw the operation text
    ctx.fillStyle = '#000000';
    ctx.fillText(operationText, textPosition.x === 0 ? canvas.width / 2 : textPosition.x, textPosition.y === 0 ? bgY + bgHeight / 2 : textPosition.y);
    
    // Restore context state
    ctx.restore();
  };

  // Function to check if mouse is over the text
  const isMouseOverText = (x: number, y: number): boolean => {
    return x >= textBounds.x &&
           x <= textBounds.x + textBounds.width &&
           y >= textBounds.y &&
           y <= textBounds.y + textBounds.height;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  // Draw operation text when it changes or canvas is resized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvasSize.width > 0 && canvasSize.height > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Log para detectar cambios en el texto de la operación
        console.log('[DrawingCanvas] Operation text changed:', {
          text: operationText,
          timestamp: new Date().toISOString()
        });
        
        // Small delay to ensure canvas is ready
        setTimeout(() => {
          drawOperationText(ctx, canvas);
        }, 100);
      }
    }
  }, [operationText, canvasSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Check if click is on the text
    if (isMouseOverText(x, y)) {
      // Start dragging text
      setIsDraggingText(true);
      setDragOffset({
        x: x - textPosition.x,
        y: y - textPosition.y
      });
      canvas.style.cursor = 'grabbing';
      
      // Capture canvas content without text
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear only the text area temporarily
        ctx.clearRect(textBounds.x - 5, textBounds.y - 5, textBounds.width + 10, textBounds.height + 10);
        
        // Capture the canvas without text
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setCanvasWithoutText(imageData);
        
        // Redraw the text
        drawOperationText(ctx, canvas);
      }
    } else {
      // Start drawing
      setIsDrawing(true);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    if (isDraggingText) {
      // Update text position while dragging
      let newX = x - dragOffset.x;
      let newY = y - dragOffset.y;
      
      // Limit text position within canvas bounds
      const padding = 60; // Account for text box padding
      newX = Math.max(padding, Math.min(canvas.width - padding, newX));
      newY = Math.max(25, Math.min(canvas.height - 25, newY));
      
      setTextPosition({ x: newX, y: newY });
      
      // Redraw canvas with new text position
      const ctx = canvas.getContext('2d');
      if (ctx && canvasWithoutText) {
        // Clear entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Restore the canvas content WITHOUT text
        ctx.putImageData(canvasWithoutText, 0, 0);
        
        // Draw text at new position
        drawOperationText(ctx, canvas);
      }
    } else if (isDrawing) {
      // Normal drawing
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 3;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsDraggingText(false);
    // Clear the saved canvas data after dragging is done
    setCanvasWithoutText(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle cursor changes when not drawing or dragging
    if (isDrawing || isDraggingText) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Change cursor based on whether mouse is over text
    if (isMouseOverText(x, y)) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = tool === 'eraser' ? 'grab' : 'crosshair';
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reset text position to center
        setTextPosition({ x: 0, y: 50 });
        // Redraw operation text after clearing
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pen')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Color picker */}
        {tool === 'pen' && (
          <div className="flex items-center gap-1">
            <Palette className="h-4 w-4 text-muted-foreground mr-2" />
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentColor === color 
                    ? 'border-primary scale-110' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <Card 
        id="canvas-container-simple"
        className="overflow-hidden bg-white relative"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          minHeight: `${height}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute top-0 left-0 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={(e) => {
            draw(e);
            handleMouseMove(e);
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ cursor: isDraggingText ? 'grabbing' : 'auto' }}
        />
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Usa el lienzo para resolver el problema. Puedes dibujar, borrar y descargar tu trabajo.
      </p>
    </div>
  );
}