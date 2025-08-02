'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameState, Position, DragItem, DropZone } from '@/lib/continents/types';
import { getShapeComponent } from './MapShapes';
import { playSound, initializeAudio } from '@/lib/continents/sounds';
import { cn } from '@/lib/utils';

interface ContinentsBoardProps {
  gameState: GameState;
  onItemDrop: (itemId: string, dropZoneId: string) => void;
  onItemMove: (itemId: string, position: Position) => void;
  selectedItemId?: string;
  showHint?: boolean;
}

interface DragState {
  isDragging: boolean;
  dragItemId: string | null;
  offset: Position;
  startPosition: Position;
}

const ContinentsBoard: React.FC<ContinentsBoardProps> = ({
  gameState,
  onItemDrop,
  onItemMove,
  selectedItemId,
  showHint = false
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragItemId: null,
    offset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 }
  });
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });

  // Actualizar dimensiones del tablero
  useEffect(() => {
    const updateDimensions = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Convertir posición relativa (%) a píxeles
  const getPixelPosition = useCallback((position: Position): Position => {
    return {
      x: (position.x / 100) * boardDimensions.width,
      y: (position.y / 100) * boardDimensions.height
    };
  }, [boardDimensions]);

  // Convertir posición en píxeles a relativa (%)
  const getRelativePosition = useCallback((pixelPos: Position): Position => {
    return {
      x: (pixelPos.x / boardDimensions.width) * 100,
      y: (pixelPos.y / boardDimensions.height) * 100
    };
  }, [boardDimensions]);

  // Obtener posición del cursor/touch
  const getPointerPosition = useCallback((event: PointerEvent | React.PointerEvent): Position => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  }, []);

  // Encontrar drop zone bajo el cursor
  const findDropZoneAt = useCallback((position: Position): DropZone | null => {
    for (const dropZone of gameState.dropZones) {
      const dropPos = getPixelPosition(dropZone.position);
      const dropSize = {
        width: (dropZone.size.width / 100) * boardDimensions.width,
        height: (dropZone.size.height / 100) * boardDimensions.height
      };

      if (
        position.x >= dropPos.x &&
        position.x <= dropPos.x + dropSize.width &&
        position.y >= dropPos.y &&
        position.y <= dropPos.y + dropSize.height
      ) {
        return dropZone;
      }
    }
    return null;
  }, [gameState.dropZones, getPixelPosition, boardDimensions]);

  // Manejar inicio del drag
  const handlePointerDown = useCallback((event: React.PointerEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget as HTMLElement;
    element.setPointerCapture(event.pointerId);

    const pointerPos = getPointerPosition(event);
    const rect = element.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    
    if (!boardRect) return;

    const offset = {
      x: pointerPos.x - (rect.left - boardRect.left),
      y: pointerPos.y - (rect.top - boardRect.top)
    };

    setDragState({
      isDragging: true,
      dragItemId: itemId,
      offset,
      startPosition: pointerPos
    });

    // Sonido de inicio de drag
    playSound('pickup', gameState.config.soundEnabled);
    
    // Initialize audio context on first interaction
    initializeAudio();
  }, [getPointerPosition, gameState.config.soundEnabled]);

  // Manejar movimiento durante el drag
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || !dragState.dragItemId) return;

    event.preventDefault();
    const pointerPos = getPointerPosition(event);
    
    // Actualizar posición del elemento
    const newPosition = {
      x: pointerPos.x - dragState.offset.x,
      y: pointerPos.y - dragState.offset.y
    };

    // Mantener elemento dentro del tablero
    const clampedPosition = {
      x: Math.max(0, Math.min(newPosition.x, boardDimensions.width - 80)),
      y: Math.max(0, Math.min(newPosition.y, boardDimensions.height - 80))
    };

    onItemMove(dragState.dragItemId, getRelativePosition(clampedPosition));

    // Detectar drop zone bajo el cursor
    const dropZone = findDropZoneAt(pointerPos);
    const previousHovered = hoveredDropZone;
    setHoveredDropZone(dropZone?.id || null);
    
    // Sonido sutil cuando se entra en zona correcta
    if (dropZone && dropZone.acceptsId === dragState.dragItemId && previousHovered !== dropZone.id) {
      playSound('hover', gameState.config.soundEnabled);
    }
  }, [dragState, getPointerPosition, boardDimensions, onItemMove, getRelativePosition, findDropZoneAt]);

  // Manejar fin del drag
  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || !dragState.dragItemId) return;

    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    element.releasePointerCapture(event.pointerId);

    const pointerPos = getPointerPosition(event);
    const dropZone = findDropZoneAt(pointerPos);

    if (dropZone && !dropZone.isOccupied) {
      // Soltar en zona válida
      onItemDrop(dragState.dragItemId, dropZone.id);
      
      // Sonido se manejará en el componente padre basado en si es correcto o no
    } else if (dropZone && dropZone.isOccupied) {
      // Intento de soltar en zona ocupada
      playSound('drop_wrong', gameState.config.soundEnabled);
    }

    // Resetear estado de drag
    setDragState({
      isDragging: false,
      dragItemId: null,
      offset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 }
    });
    setHoveredDropZone(null);
  }, [dragState, getPointerPosition, findDropZoneAt, onItemDrop, gameState.config.soundEnabled]);

  // Renderizar mapa mundial de fondo mejorado
  const renderWorldMap = () => {
    const continentPositions = {
      'north-america': { x: 150, y: 80, width: 120, height: 150 },
      'south-america': { x: 200, y: 220, width: 80, height: 200 },
      'europe': { x: 480, y: 100, width: 100, height: 80 },
      'africa': { x: 460, y: 160, width: 100, height: 180 },
      'asia': { x: 580, y: 80, width: 200, height: 160 },
      'oceania': { x: 750, y: 280, width: 120, height: 80 }
    };

    return (
      <div className="absolute inset-0 opacity-15">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Océanos */}
          <defs>
            <pattern id="ocean-waves" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M0,20 Q10,10 20,20 T40,20" stroke="#E3F2FD" strokeWidth="2" fill="none" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="url(#ocean-waves)" className="opacity-50"/>
          
          {/* Renderizar continentes de fondo */}
          {Object.entries(continentPositions).map(([continentId, pos]) => {
            const ShapeComponent = getShapeComponent('continent', continentId);
            if (!ShapeComponent) return null;
            
            return (
              <g key={continentId} transform={`translate(${pos.x}, ${pos.y})`}>
                <foreignObject width={pos.width} height={pos.height}>
                  <div className="w-full h-full opacity-60">
                    <ShapeComponent
                      fill="#B0BEC5"
                      stroke="#90A4AE"
                      strokeWidth={1}
                      opacity={0.4}
                      className="w-full h-full"
                    />
                  </div>
                </foreignObject>
              </g>
            );
          })}
          
          {/* Líneas de latitud y longitud sutiles */}
          <g stroke="#E0E0E0" strokeWidth="1" opacity="0.3">
            <line x1="0" y1="125" x2="1000" y2="125"/> {/* Trópico de Cáncer */}
            <line x1="0" y1="250" x2="1000" y2="250"/> {/* Ecuador */}
            <line x1="0" y1="375" x2="1000" y2="375"/> {/* Trópico de Capricornio */}
            <line x1="250" y1="0" x2="250" y2="500"/> {/* Greenwich */}
            <line x1="500" y1="0" x2="500" y2="500"/> {/* 90° W/E */}
            <line x1="750" y1="0" x2="750" y2="500"/> {/* 180° */}
          </g>
        </svg>
      </div>
    );
  };

  // Renderizar zona de drop mejorada
  const renderDropZone = (dropZone: DropZone) => {
    const position = getPixelPosition(dropZone.position);
    const size = {
      width: (dropZone.size.width / 100) * boardDimensions.width,
      height: (dropZone.size.height / 100) * boardDimensions.height
    };

    const isHovered = hoveredDropZone === dropZone.id;
    const isHinted = showHint && dropZone.acceptsId === selectedItemId;
    const dragItem = gameState.dragItems.find(item => item.id === dropZone.currentItemId);
    const isNearCorrect = isHovered && dropZone.acceptsId === dragState.dragItemId;

    return (
      <div
        key={dropZone.id}
        className={cn(
          "absolute rounded-2xl border-4 border-dashed transition-all duration-300 backdrop-blur-sm",
          "flex items-center justify-center overflow-hidden",
          dropZone.isOccupied
            ? dragItem?.isCorrect
              ? "border-green-400 bg-green-50/70 shadow-lg shadow-green-200"
              : "border-red-400 bg-red-50/70 shadow-lg shadow-red-200"
            : isNearCorrect
            ? "border-green-500 bg-green-100/80 scale-110 shadow-xl shadow-green-300 animate-pulse"
            : isHovered
            ? "border-blue-500 bg-blue-100/80 scale-105 shadow-lg shadow-blue-200"
            : isHinted
            ? "border-orange-400 bg-orange-100/80 animate-pulse shadow-lg shadow-orange-200"
            : "border-gray-300/60 bg-white/30 hover:border-gray-400/80 hover:bg-white/50"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: '100px',
          minHeight: '80px',
          filter: isNearCorrect ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))' : 'none'
        }}
      >
        {/* Efecto de ondas para zona activa */}
        {isNearCorrect && (
          <div className="absolute inset-0 rounded-2xl">
            <div className="absolute inset-0 rounded-2xl border-2 border-green-400 animate-ping opacity-75"></div>
            <div className="absolute inset-2 rounded-2xl border-2 border-green-300 animate-ping animation-delay-75 opacity-50"></div>
          </div>
        )}
        
        {dropZone.isOccupied ? (
          <div className="text-center relative z-10">
            {dragItem?.isCorrect ? (
              <div className="flex flex-col items-center">
                <div className="text-green-600 text-3xl animate-bounce">✓</div>
                <div className="text-xs font-bold text-green-700 mt-1">¡Correcto!</div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-red-600 text-3xl animate-pulse">✗</div>
                <div className="text-xs font-bold text-red-700 mt-1">Intenta otra vez</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500/80 text-sm font-medium relative z-10">
            {isHinted ? (
              <div className="flex flex-col items-center">
                <div className="text-orange-600 text-lg mb-1">🎯</div>
                <div className="text-orange-700 font-bold">¡Aquí va!</div>
              </div>
            ) : isNearCorrect ? (
              <div className="flex flex-col items-center">
                <div className="text-green-600 text-lg mb-1">✨</div>
                <div className="text-green-700 font-bold">¡Suelta aquí!</div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-gray-400 text-lg mb-1">📍</div>
                <div>Zona de destino</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar elemento arrastrable con formas SVG
  const renderDragItem = (dragItem: DragItem) => {
    if (dragItem.isPlaced && dragItem.isCorrect) return null;

    const position = dragItem.currentPosition 
      ? getPixelPosition(dragItem.currentPosition)
      : { x: 50, y: 50 };

    const isDragging = dragState.dragItemId === dragItem.id;
    const isSelected = selectedItemId === dragItem.id;

    // Obtener datos del elemento
    const itemData = dragItem.data;
    const displayName = gameState.config.showNames ? itemData.name : '?';
    
    // Obtener el componente de forma SVG
    const ShapeComponent = getShapeComponent(dragItem.type, dragItem.id);
    
    // Colores temáticos por tipo
    const getItemColors = () => {
      switch (dragItem.type) {
        case 'continent':
          return {
            primary: '#42A5F5',
            secondary: '#E3F2FD',
            accent: '#1976D2'
          };
        case 'country':
          return {
            primary: '#66BB6A',
            secondary: '#E8F5E8',
            accent: '#388E3C'
          };
        case 'subdivision':
          return {
            primary: '#FFB74D',
            secondary: '#FFF3E0',
            accent: '#F57C00'
          };
        default:
          return {
            primary: '#9E9E9E',
            secondary: '#F5F5F5',
            accent: '#616161'
          };
      }
    };

    const colors = getItemColors();

    return (
      <div
        key={dragItem.id}
        className={cn(
          "absolute cursor-grab active:cursor-grabbing",
          "bg-white rounded-2xl shadow-lg border-2 backdrop-blur-sm",
          "transition-all duration-300 select-none",
          "flex flex-col items-center justify-center p-3",
          "min-w-[100px] min-h-[80px] max-w-[140px]",
          isDragging 
            ? "scale-125 shadow-2xl z-50 border-blue-400 rotate-3" 
            : isSelected
            ? "border-orange-400 shadow-xl scale-110"
            : "border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-105",
          dragItem.isPlaced && !dragItem.isCorrect && "border-red-300 bg-red-50/80"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
          filter: isDragging ? 'drop-shadow(0 10px 25px rgba(0,0,0,0.2))' : 'none',
          background: isDragging ? `linear-gradient(135deg, ${colors.secondary}, white)` : 'white'
        }}
        onPointerDown={(e) => handlePointerDown(e, dragItem.id)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Forma SVG del elemento */}
        <div className="w-12 h-12 mb-2 relative">
          {ShapeComponent ? (
            <div className="w-full h-full flex items-center justify-center">
              <ShapeComponent
                fill={colors.primary}
                stroke={colors.accent}
                strokeWidth={2}
                opacity={isDragging ? 0.9 : 1}
                className="w-full h-full transition-all duration-200"
                style={{
                  filter: isDragging ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none'
                }}
              />
            </div>
          ) : (
            // Fallback icon si no hay forma SVG
            <div className="text-3xl flex items-center justify-center w-full h-full">
              {dragItem.type === 'continent' && '🌍'}
              {dragItem.type === 'country' && '🏛️'}
              {dragItem.type === 'subdivision' && '🏘️'}
            </div>
          )}
          
          {/* Brillo para elementos siendo arrastrados */}
          {isDragging && (
            <div className="absolute inset-0 rounded-lg bg-white/30 animate-pulse"></div>
          )}
        </div>

        {/* Nombre del elemento */}
        <div className={cn(
          "text-xs font-bold text-center leading-tight px-2 py-1 rounded-lg",
          isDragging ? "bg-white/80 text-gray-800" : "text-gray-700"
        )}>
          {displayName}
        </div>

        {/* Tipo de elemento */}
        <div className="text-xs text-gray-500 mt-1 capitalize font-medium">
          {dragItem.type === 'continent' && '🌍 Continente'}
          {dragItem.type === 'country' && '🏛️ País'}
          {dragItem.type === 'subdivision' && '🏘️ Estado'}
        </div>

        {/* Indicador de selección mejorado */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        )}

        {/* Efectos visuales de arrastre */}
        {isDragging && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-2xl animate-pulse"></div>
            <div className="absolute -inset-2 border-2 border-blue-300 rounded-2xl animate-ping opacity-50"></div>
          </>
        )}

        {/* Indicador de error si está mal colocado */}
        {dragItem.isPlaced && !dragItem.isCorrect && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
            ✗
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={boardRef}
      className="relative w-full h-full bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl overflow-hidden touch-none"
      style={{ minHeight: '400px' }}
    >
      {/* Mapa mundial de fondo */}
      {renderWorldMap()}

      {/* Zonas de drop */}
      {gameState.dropZones.map(renderDropZone)}

      {/* Elementos arrastrables */}
      {gameState.dragItems.map(renderDragItem)}

      {/* Overlay de drag activo */}
      {dragState.isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pointer-events-none z-40" />
      )}

      {/* Instrucciones interactivas */}
      {gameState.dragItems.filter(item => !item.isPlaced).length > 0 && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-xl p-4 shadow-lg max-w-sm border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl animate-bounce">🎯</div>
            <div className="text-sm font-bold text-blue-700">¡Tu misión!</div>
          </div>
          <div className="text-sm font-medium text-gray-700">
            Arrastra los elementos a su posición correcta en el mapa
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Toca y arrastra para mover
          </div>
        </div>
      )}

      {/* Mensaje de éxito para colocación correcta */}
      {gameState.dragItems.some(item => item.isPlaced && item.isCorrect) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full font-bold animate-bounce shadow-lg">
          🌟 ¡Excelente! Sigue así 🌟
        </div>
      )}

      {/* Indicador de progreso */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium text-gray-600 mb-1">Progreso</div>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(gameState.correctPlacements / gameState.dragItems.length) * 100}%` 
              }}
            />
          </div>
          <div className="text-xs font-semibold text-gray-700">
            {gameState.correctPlacements}/{gameState.dragItems.length}
          </div>
        </div>
      </div>

      {/* Celebración de finalización */}
      {gameState.completed && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              ¡Excelente trabajo!
            </div>
            <div className="text-gray-600">
              Has completado el mapa correctamente
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinentsBoard;