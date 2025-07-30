'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Direction } from '@/lib/maze/types';
import { Position } from '@/lib/maze/generator';

interface UseMazeDragProps {
  playerPosition: Position;
  onMove: (direction: Direction) => void;
  isValidMove: (from: Position, to: Position) => boolean;
  cellSize: number;
  gridElement: HTMLDivElement | null;
  isPaused?: boolean;
  isCompleted?: boolean;
}

interface DragState {
  isDragging: boolean;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  dragOffset: { x: number; y: number };
}

export function useMazeDrag({
  playerPosition,
  onMove,
  isValidMove,
  cellSize,
  gridElement,
  isPaused = false,
  isCompleted = false,
}: UseMazeDragProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  });

  const dragPathRef = useRef<Position[]>([]);
  const lastValidPosRef = useRef<Position>(playerPosition);
  
  // Update last valid position when player position changes
  useEffect(() => {
    lastValidPosRef.current = playerPosition;
  }, [playerPosition]);

  // Convert grid position to pixel position
  const gridToPixel = useCallback((pos: Position): { x: number; y: number } => {
    if (!gridElement) return { x: 0, y: 0 };
    
    const rect = gridElement.getBoundingClientRect();
    const gridSize = Math.sqrt(gridElement.children.length);
    const cellIndex = pos.row * gridSize + pos.col;
    const cellElements = gridElement.querySelectorAll('[data-cell]');
    const targetCell = cellElements[cellIndex] as HTMLElement;
    
    if (targetCell) {
      const cellRect = targetCell.getBoundingClientRect();
      return {
        x: cellRect.left + cellRect.width / 2 - rect.left,
        y: cellRect.top + cellRect.height / 2 - rect.top,
      };
    }
    
    return { x: 0, y: 0 };
  }, [gridElement]);

  // Convert pixel position to grid position
  const pixelToGrid = useCallback((x: number, y: number): Position | null => {
    if (!gridElement) return null;
    
    const rect = gridElement.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;
    
    // Account for gap between cells (4px gap, so add 4 to cell size)
    const cellWithGap = cellSize + 4;
    
    const col = Math.floor(relX / cellWithGap);
    const row = Math.floor(relY / cellWithGap);
    
    const gridSize = Math.sqrt(gridElement.children.length);
    
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      return { row, col };
    }
    
    return null;
  }, [gridElement, cellSize]);

  // Get direction from current position to target position
  const getDirection = useCallback((from: Position, to: Position): Direction | null => {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    
    if (rowDiff === -1 && colDiff === 0) return 'up';
    if (rowDiff === 1 && colDiff === 0) return 'down';
    if (rowDiff === 0 && colDiff === -1) return 'left';
    if (rowDiff === 0 && colDiff === 1) return 'right';
    
    return null;
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isPaused || isCompleted) return;
    
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Get the actual element being clicked
    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    
    // Calculate offset from where the user clicked relative to the center of the element
    const offsetX = clientX - (rect.left + rect.width / 2);
    const offsetY = clientY - (rect.top + rect.height / 2);
    
    setDragState({
      isDragging: true,
      startPos: { x: clientX, y: clientY },
      currentPos: { x: clientX, y: clientY },
      dragOffset: {
        x: offsetX,
        y: offsetY,
      },
    });
    
    dragPathRef.current = [playerPosition];
    lastValidPosRef.current = playerPosition;
  }, [playerPosition, isPaused, isCompleted]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !gridElement) return;
    
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragState(prev => ({
      ...prev,
      currentPos: { x: clientX, y: clientY },
    }));
    
    // Check what grid cell we're over
    const gridPos = pixelToGrid(clientX, clientY);
    
    if (gridPos && gridPos.row === lastValidPosRef.current.row && gridPos.col === lastValidPosRef.current.col) {
      return; // Still in the same cell
    }
    
    if (gridPos && isValidMove(lastValidPosRef.current, gridPos)) {
      // Valid adjacent move
      const direction = getDirection(lastValidPosRef.current, gridPos);
      if (direction) {
        onMove(direction);
        lastValidPosRef.current = gridPos;
        dragPathRef.current.push(gridPos);
        
        // Update the start position to the current mouse position
        // This prevents visual offset accumulation when hitting walls
        setDragState(prev => ({
          ...prev,
          startPos: { x: clientX, y: clientY },
        }));
      }
    }
  }, [dragState.isDragging, gridElement, pixelToGrid, isValidMove, getDirection, onMove]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
    });
    
    dragPathRef.current = [];
  }, []);

  // Set up global event listeners
  useEffect(() => {
    if (!dragState.isDragging) return;
    
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const handleGlobalEnd = () => handleDragEnd();
    
    // Mouse events
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    
    // Touch events
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalEnd);
    window.addEventListener('touchcancel', handleGlobalEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
      window.removeEventListener('touchcancel', handleGlobalEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Calculate drag visual offset
  const getDragTransform = useCallback((): { x: number; y: number } | null => {
    if (!dragState.isDragging) return null;
    
    // Simply return the mouse movement
    // The offset is already handled by where the user clicked initially
    return {
      x: dragState.currentPos.x - dragState.startPos.x,
      y: dragState.currentPos.y - dragState.startPos.y,
    };
  }, [dragState]);

  return {
    isDragging: dragState.isDragging,
    handleDragStart,
    getDragTransform,
  };
}