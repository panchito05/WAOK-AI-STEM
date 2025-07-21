'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Eraser, 
  Pencil, 
  RotateCcw,
  Download,
  Palette
} from 'lucide-react';

// Dynamically import Konva components to avoid SSR issues
const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
const Line = dynamic(() => import('react-konva').then(mod => mod.Line), { ssr: false });

interface DrawingCanvasProps {
  onClear?: () => void;
  height?: number;
}

const COLORS = [
  '#000000', // Black
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
];

export default function DrawingCanvas({ onClear, height = 400 }: DrawingCanvasProps) {
  const stageRef = useRef<any>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lines, setLines] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [stageSize, setStageSize] = useState({ width: 0, height });
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering Konva
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update canvas width on resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { 
      tool, 
      points: [pos.x, pos.y], 
      color: tool === 'eraser' ? '#FFFFFF' : currentColor,
      strokeWidth: tool === 'eraser' ? 20 : 3,
    }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    // Add point to line
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    // Replace last line
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    setLines([]);
    onClear?.();
  };

  const handleDownload = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'math-work.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        id="canvas-container"
        className="overflow-hidden bg-white"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {mounted && Stage && Layer && Line && (
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchmove={handleMouseMove}
            onTouchend={handleMouseUp}
            style={{ cursor: tool === 'eraser' ? 'crosshair' : 'default' }}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Usa el lienzo para resolver el problema. Puedes dibujar, borrar y descargar tu trabajo.
      </p>
    </div>
  );
}