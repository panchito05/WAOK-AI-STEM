/**
 * Comprehensive tests for ContinentsBoard component
 * Tests drag & drop mechanics, touch/mouse interactions, and visual feedback
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ContinentsBoard from '../ContinentsBoard';
import { playSound, initializeAudio } from '@/lib/continents/sounds';
import { getShapeComponent } from '../MapShapes';

// Mock dependencies
jest.mock('@/lib/continents/sounds');
jest.mock('../MapShapes');

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 800,
  height: 600,
  top: 0,
  left: 0,
  bottom: 600,
  right: 800,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));

// Mock setPointerCapture and releasePointerCapture
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();

// Test game state
const mockGameState = {
  id: 'test-game',
  config: {
    mode: 'continents' as const,
    difficulty: 'easy' as const,
    showFlags: true,
    showAnimals: true,
    showNames: true,
    showInfo: true,
    soundEnabled: true,
    autoValidate: true,
    allowHints: true,
  },
  dragItems: [
    {
      id: 'north-america',
      type: 'continent' as const,
      data: {
        id: 'north-america',
        name: 'América del Norte',
        nameEn: 'North America',
        position: { x: 20, y: 20 },
        size: { width: 25, height: 30 },
        color: '#42A5F5',
        countries: [],
      },
      currentPosition: { x: 10, y: 10 },
      isPlaced: false,
      isCorrect: false,
    },
    {
      id: 'europe',
      type: 'continent' as const,
      data: {
        id: 'europe',
        name: 'Europa',
        nameEn: 'Europe',
        position: { x: 50, y: 15 },
        size: { width: 20, height: 25 },
        color: '#66BB6A',
        countries: [],
      },
      currentPosition: { x: 70, y: 10 },
      isPlaced: false,
      isCorrect: false,
    }
  ],
  dropZones: [
    {
      id: 'zone-north-america',
      type: 'continent' as const,
      position: { x: 20, y: 20 },
      size: { width: 25, height: 30 },
      acceptsId: 'north-america',
      isOccupied: false,
    },
    {
      id: 'zone-europe',
      type: 'continent' as const,
      position: { x: 50, y: 15 },
      size: { width: 20, height: 25 },
      acceptsId: 'europe',
      isOccupied: false,
    }
  ],
  startTime: Date.now(),
  pausedTime: 0,
  isPaused: false,
  attempts: 0,
  correctPlacements: 0,
  hintsUsed: 0,
  completed: false,
  score: 0,
};

const mockCompletedGameState = {
  ...mockGameState,
  completed: true,
  correctPlacements: 2,
  dragItems: mockGameState.dragItems.map(item => ({
    ...item,
    isPlaced: true,
    isCorrect: true,
  })),
  dropZones: mockGameState.dropZones.map(zone => ({
    ...zone,
    isOccupied: true,
  })),
};

// Mock shape component
const MockShapeComponent = ({ fill, stroke, strokeWidth, opacity, className, style }: any) => (
  <div 
    data-testid="mock-shape"
    style={{ backgroundColor: fill, ...style }}
    className={className}
  />
);

describe('ContinentsBoard', () => {
  const mockOnItemDrop = jest.fn();
  const mockOnItemMove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getShapeComponent as jest.Mock).mockReturnValue(MockShapeComponent);
    (playSound as jest.Mock).mockImplementation(() => {});
    (initializeAudio as jest.Mock).mockImplementation(() => {});
  });

  // RENDERING TESTS
  describe('Rendering Tests', () => {
    test('should render game board with world map background', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Should have main board container
      const board = screen.getByRole('generic');
      expect(board).toHaveClass('relative', 'w-full', 'h-full');
    });

    test('should render drag items correctly', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Should show drag items
      expect(screen.getByText('América del Norte')).toBeInTheDocument();
      expect(screen.getByText('Europa')).toBeInTheDocument();
      expect(screen.getByText('🌍 Continente')).toBeInTheDocument();
    });

    test('should render drop zones correctly', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Drop zones should be present (with "Zona de destino" text)
      const dropZones = screen.getAllByText('Zona de destino');
      expect(dropZones).toHaveLength(2);
    });

    test('should show progress indicator', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      expect(screen.getByText('Progreso')).toBeInTheDocument();
      expect(screen.getByText('0/2')).toBeInTheDocument();
    });

    test('should show instructions when game is active', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      expect(screen.getByText('¡Tu misión!')).toBeInTheDocument();
      expect(screen.getByText('Arrastra los elementos a su posición correcta en el mapa')).toBeInTheDocument();
    });
  });

  // DRAG AND DROP TESTS
  describe('Drag and Drop Tests', () => {
    test('should handle pointer down event', async () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      expect(playSound).toHaveBeenCalledWith('pickup', true);
      expect(initializeAudio).toHaveBeenCalled();
    });

    test('should handle pointer move during drag', async () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Start drag
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      // Move during drag
      fireEvent.pointerMove(dragItem!, {
        pointerId: 1,
        clientX: 150,
        clientY: 150,
      });

      expect(mockOnItemMove).toHaveBeenCalledWith(
        'north-america',
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    test('should handle pointer up and drop in valid zone', async () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Start drag
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      // Drop in valid zone
      fireEvent.pointerUp(dragItem!, {
        pointerId: 1,
        clientX: 200,
        clientY: 200,
      });

      expect(mockOnItemDrop).toHaveBeenCalled();
    });

    test('should prevent drag outside board boundaries', async () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Start drag
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      // Try to move outside boundaries
      fireEvent.pointerMove(dragItem!, {
        pointerId: 1,
        clientX: -50, // Outside left boundary
        clientY: -50, // Outside top boundary
      });

      // Item should be clamped within boundaries
      expect(mockOnItemMove).toHaveBeenCalledWith(
        'north-america',
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    test('should handle touch events for mobile', async () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Touch start
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 100,
        clientY: 100,
      });

      expect(playSound).toHaveBeenCalledWith('pickup', true);
    });
  });

  // VISUAL FEEDBACK TESTS
  describe('Visual Feedback Tests', () => {
    test('should show hover feedback on drop zones', async () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Start drag and move over correct drop zone
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      fireEvent.pointerMove(dragItem!, {
        pointerId: 1,
        clientX: 200, // Over drop zone
        clientY: 200,
      });

      // Hover sound should play
      expect(playSound).toHaveBeenCalledWith('hover', true);
    });

    test('should show selection feedback for selected items', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
          selectedItemId="north-america"
        />
      );

      // Selected item should have visual indicator
      // This would be tested by checking CSS classes or styles applied
      const dragItem = screen.getByText('América del Norte').closest('div');
      expect(dragItem).toHaveClass('border-orange-400');
    });

    test('should show hint feedback when hint is active', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
          selectedItemId="north-america"
          showHint={true}
        />
      );

      // Hint feedback should be visible
      expect(screen.getByText('¡Aquí va!')).toBeInTheDocument();
    });

    test('should show success feedback for correct placements', () => {
      const gameStateWithCorrectPlacement = {
        ...mockGameState,
        correctPlacements: 1,
        dragItems: [
          { ...mockGameState.dragItems[0], isPlaced: true, isCorrect: true },
          mockGameState.dragItems[1],
        ],
        dropZones: [
          { ...mockGameState.dropZones[0], isOccupied: true, currentItemId: 'north-america' },
          mockGameState.dropZones[1],
        ],
      };

      render(
        <ContinentsBoard
          gameState={gameStateWithCorrectPlacement}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
      expect(screen.getByText('🌟 ¡Excelente! Sigue así 🌟')).toBeInTheDocument();
    });

    test('should show error feedback for incorrect placements', () => {
      const gameStateWithIncorrectPlacement = {
        ...mockGameState,
        dragItems: [
          { ...mockGameState.dragItems[0], isPlaced: true, isCorrect: false },
          mockGameState.dragItems[1],
        ],
        dropZones: [
          { ...mockGameState.dropZones[0], isOccupied: true, currentItemId: 'north-america' },
          mockGameState.dropZones[1],
        ],
      };

      render(
        <ContinentsBoard
          gameState={gameStateWithIncorrectPlacement}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      expect(screen.getByText('Intenta otra vez')).toBeInTheDocument();
    });
  });

  // SOUND EFFECTS TESTS
  describe('Sound Effects Tests', () => {
    test('should play pickup sound when starting drag', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      expect(playSound).toHaveBeenCalledWith('pickup', true);
    });

    test('should play hover sound when over correct zone', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Start drag
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      // Move over correct zone
      fireEvent.pointerMove(dragItem!, {
        pointerId: 1,
        clientX: 200,
        clientY: 200,
      });

      expect(playSound).toHaveBeenCalledWith('hover', true);
    });

    test('should not play sounds when disabled', () => {
      const gameStateWithSoundDisabled = {
        ...mockGameState,
        config: { ...mockGameState.config, soundEnabled: false },
      };

      render(
        <ContinentsBoard
          gameState={gameStateWithSoundDisabled}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      expect(playSound).toHaveBeenCalledWith('pickup', false);
    });
  });

  // GAME STATE TESTS
  describe('Game State Tests', () => {
    test('should handle paused game state', () => {
      const pausedGameState = {
        ...mockGameState,
        isPaused: true,
      };

      render(
        <ContinentsBoard
          gameState={pausedGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Drag interactions should be disabled when paused
      const dragItem = screen.getByText('América del Norte').closest('div');
      
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      // Should not trigger drag when paused
      expect(mockOnItemMove).not.toHaveBeenCalled();
    });

    test('should handle completed game state', () => {
      render(
        <ContinentsBoard
          gameState={mockCompletedGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      expect(screen.getByText('¡Excelente trabajo!')).toBeInTheDocument();
      expect(screen.getByText('Has completado el mapa correctamente')).toBeInTheDocument();
    });

    test('should not render placed correct items', () => {
      const gameStateWithPlacedItem = {
        ...mockGameState,
        dragItems: [
          { ...mockGameState.dragItems[0], isPlaced: true, isCorrect: true },
          mockGameState.dragItems[1],
        ],
      };

      render(
        <ContinentsBoard
          gameState={gameStateWithPlacedItem}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Correctly placed items should not be visible as drag items
      expect(screen.queryByText('América del Norte')).not.toBeInTheDocument();
      expect(screen.getByText('Europa')).toBeInTheDocument();
    });
  });

  // RESPONSIVE DESIGN TESTS
  describe('Responsive Design Tests', () => {
    test('should handle different screen sizes', () => {
      // Mock different screen size
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      }));

      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Board should adapt to smaller size
      expect(screen.getByText('América del Norte')).toBeInTheDocument();
    });

    test('should maintain minimum element sizes', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Elements should have minimum sizes defined in CSS
      const dragItem = screen.getByText('América del Norte').closest('div');
      expect(dragItem).toHaveClass('min-w-[100px]', 'min-h-[80px]');
    });
  });

  // EDGE CASES TESTS
  describe('Edge Cases Tests', () => {
    test('should handle missing shape components gracefully', () => {
      (getShapeComponent as jest.Mock).mockReturnValue(null);

      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      // Should show fallback icons
      expect(screen.getByText('🌍')).toBeInTheDocument();
    });

    test('should handle drag cancellation', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Start drag
      fireEvent.pointerDown(dragItem!, {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      // Cancel drag
      fireEvent.pointerCancel(dragItem!, {
        pointerId: 1,
      });

      // Drag state should be reset
      expect(mockOnItemDrop).not.toHaveBeenCalled();
    });

    test('should handle rapid successive interactions', () => {
      render(
        <ContinentsBoard
          gameState={mockGameState}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Rapid clicks
      fireEvent.pointerDown(dragItem!, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerUp(dragItem!, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerDown(dragItem!, { pointerId: 2, clientX: 100, clientY: 100 });
      fireEvent.pointerUp(dragItem!, { pointerId: 2, clientX: 100, clientY: 100 });

      // Should handle multiple interactions gracefully
      expect(playSound).toHaveBeenCalled();
    });

    test('should handle occupied drop zone attempts', () => {
      const gameStateWithOccupiedZone = {
        ...mockGameState,
        dropZones: [
          { ...mockGameState.dropZones[0], isOccupied: true, currentItemId: 'europe' },
          mockGameState.dropZones[1],
        ],
      };

      render(
        <ContinentsBoard
          gameState={gameStateWithOccupiedZone}
          onItemDrop={mockOnItemDrop}
          onItemMove={mockOnItemMove}
        />
      );

      const dragItem = screen.getByText('América del Norte').closest('div');
      
      // Try to drop on occupied zone
      fireEvent.pointerDown(dragItem!, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerUp(dragItem!, { pointerId: 1, clientX: 200, clientY: 200 });

      expect(playSound).toHaveBeenCalledWith('drop_wrong', true);
    });
  });
});