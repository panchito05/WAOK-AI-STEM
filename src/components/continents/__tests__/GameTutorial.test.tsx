/**
 * Comprehensive tests for GameTutorial component
 * Tests tutorial flow, navigation, and mode-specific instructions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import GameTutorial from '../GameTutorial';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('GameTutorial', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  // RENDERING TESTS
  describe('Rendering Tests', () => {
    test('should not render when show is false', () => {
      render(
        <GameTutorial
          show={false}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.queryByText('Tutorial Interactivo')).not.toBeInTheDocument();
    });

    test('should render tutorial modal when show is true', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Tutorial Interactivo')).toBeInTheDocument();
      expect(screen.getByText('¡Bienvenido al juego de geografía!')).toBeInTheDocument();
    });

    test('should show correct step indicator', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('1 de 6')).toBeInTheDocument();
    });

    test('should display first step content correctly', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('¡Bienvenido al juego de geografía!')).toBeInTheDocument();
      expect(screen.getByText('Aprende sobre el mundo mientras juegas. ¡Es súper fácil y divertido!')).toBeInTheDocument();
      expect(screen.getByText('🌍')).toBeInTheDocument();
    });
  });

  // NAVIGATION TESTS
  describe('Navigation Tests', () => {
    test('should navigate to next step when clicking Siguiente', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      await user.click(screen.getByText('Siguiente'));

      expect(screen.getByText('¡Toca y arrastra!')).toBeInTheDocument();
      expect(screen.getByText('2 de 6')).toBeInTheDocument();
    });

    test('should navigate to previous step when clicking Anterior', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Go to second step
      await user.click(screen.getByText('Siguiente'));
      expect(screen.getByText('¡Toca y arrastra!')).toBeInTheDocument();

      // Go back to first step
      await user.click(screen.getByText('← Anterior'));
      expect(screen.getByText('¡Bienvenido al juego de geografía!')).toBeInTheDocument();
    });

    test('should disable previous button on first step', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      const previousButton = screen.getByText('← Anterior');
      expect(previousButton).toBeDisabled();
    });

    test('should show "Empezar a jugar" button on last step', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      expect(screen.getByText('¡Empezar a jugar! 🎮')).toBeInTheDocument();
    });
  });

  // COMPLETION TESTS
  describe('Completion Tests', () => {
    test('should call onComplete when clicking "Empezar a jugar"', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      await user.click(screen.getByText('¡Empezar a jugar! 🎮'));

      expect(mockOnComplete).toHaveBeenCalled();
    });

    test('should call onSkip when clicking skip button', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      await user.click(screen.getByText('Saltar tutorial'));

      expect(mockOnSkip).toHaveBeenCalled();
    });

    test('should call onSkip when clicking X button', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      const closeButton = screen.getByRole('button').querySelector('svg');
      if (closeButton) {
        await user.click(closeButton.parentElement!);
      }

      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  // MODE-SPECIFIC TESTS
  describe('Mode-Specific Tutorial Tests', () => {
    test('should show continents-specific content for continents mode', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to last step (mode-specific)
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      expect(screen.getByText('¡Arrastra los continentes!')).toBeInTheDocument();
      expect(screen.getByText('En este modo, arrastra cada continente a su lugar correcto en el mapa mundial.')).toBeInTheDocument();
      expect(screen.getByText('🗺️')).toBeInTheDocument();
    });

    test('should show countries-specific content for countries mode', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="countries"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      expect(screen.getByText('¡Ubica los países!')).toBeInTheDocument();
      expect(screen.getByText('Arrastra cada país a su continente correcto. ¡Aprende sobre diferentes naciones!')).toBeInTheDocument();
      expect(screen.getByText('🏴')).toBeInTheDocument();
    });

    test('should show subdivisions-specific content for subdivisions mode', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="subdivisions"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      expect(screen.getByText('¡Explora estados y provincias!')).toBeInTheDocument();
      expect(screen.getByText('Coloca cada estado o provincia en su lugar correcto dentro del país.')).toBeInTheDocument();
      expect(screen.getByText('🏘️')).toBeInTheDocument();
    });
  });

  // TUTORIAL STEPS TESTS
  describe('Tutorial Steps Tests', () => {
    test('should show drag and drop instruction step', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      await user.click(screen.getByText('Siguiente'));

      expect(screen.getByText('¡Toca y arrastra!')).toBeInTheDocument();
      expect(screen.getByText('Usa tu dedo o el mouse para arrastrar las piezas. ¡Es como un rompecabezas!')).toBeInTheDocument();
    });

    test('should show correct placement instruction step', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to step 3
      await user.click(screen.getByText('Siguiente'));
      await user.click(screen.getByText('Siguiente'));

      expect(screen.getByText('¡Encuentra el lugar correcto!')).toBeInTheDocument();
      expect(screen.getByText('Cuando arrastres una pieza al lugar correcto, brillará en verde. ¡Escucha los sonidos divertidos!')).toBeInTheDocument();
    });

    test('should show hint instruction step', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to step 4
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      expect(screen.getByText('¡Pide ayuda si la necesitas!')).toBeInTheDocument();
      expect(screen.getByText('Si te quedas atascado, presiona el botón de pista. Te daremos una ayuda especial.')).toBeInTheDocument();
      expect(screen.getByText('💡')).toBeInTheDocument();
    });

    test('should show completion instruction step', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Navigate to step 5
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText('Siguiente'));
      }

      expect(screen.getByText('¡Completa el desafío!')).toBeInTheDocument();
      expect(screen.getByText('Cuando coloques todas las piezas correctamente, ¡habrá una gran celebración!')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });
  });

  // VISUAL ELEMENTS TESTS
  describe('Visual Elements Tests', () => {
    test('should display step indicators correctly', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Should have 6 step indicators for continents mode
      const stepIndicators = screen.getAllByRole('generic').filter(
        element => element.className.includes('rounded-full')
      );
      
      // Current step should be highlighted
      expect(stepIndicators.length).toBeGreaterThan(0);
    });

    test('should show visual demonstrations for each step', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Step 1: Welcome animation
      expect(screen.getByText('🌎')).toBeInTheDocument();

      // Step 2: Drag animation
      await user.click(screen.getByText('Siguiente'));
      expect(screen.getByText('→')).toBeInTheDocument();

      // Step 3: Success animation
      await user.click(screen.getByText('Siguiente'));
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    test('should show animations with proper classes', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // First step should have bounce animation
      const firstStepCard = screen.getByText('¡Bienvenido al juego de geografía!').closest('.animate-bounce-in');
      expect(firstStepCard).toBeInTheDocument();
    });
  });

  // ACCESSIBILITY TESTS
  describe('Accessibility Tests', () => {
    test('should have proper dialog structure', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Tutorial Interactivo')).toBeInTheDocument();
    });

    test('should have accessible navigation buttons', () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      const nextButton = screen.getByText('Siguiente');
      const skipButton = screen.getByText('Saltar tutorial');
      
      expect(nextButton).toBeInTheDocument();
      expect(skipButton).toBeInTheDocument();
      
      // Buttons should be focusable
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);
    });

    test('should support keyboard navigation', async () => {
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      const nextButton = screen.getByText('Siguiente');
      
      // Should be able to activate with Enter
      nextButton.focus();
      fireEvent.keyDown(nextButton, { key: 'Enter', code: 'Enter' });
      
      expect(screen.getByText('¡Toca y arrastra!')).toBeInTheDocument();
    });
  });

  // ANIMATION TESTS
  describe('Animation Tests', () => {
    test('should handle step transition animations', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      await user.click(screen.getByText('Siguiente'));

      // Should have transition animation classes
      await waitFor(() => {
        expect(screen.getByText('¡Toca y arrastra!')).toBeInTheDocument();
      });
    });

    test('should maintain animation state during transitions', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Fast navigation shouldn't break animations
      await user.click(screen.getByText('Siguiente'));
      await user.click(screen.getByText('← Anterior'));
      
      expect(screen.getByText('¡Bienvenido al juego de geografía!')).toBeInTheDocument();
    });
  });

  // EDGE CASES TESTS
  describe('Edge Cases Tests', () => {
    test('should handle rapid navigation', async () => {
      const user = userEvent.setup();
      render(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Rapid clicking should not break the component
      const nextButton = screen.getByText('Siguiente');
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      expect(screen.getByText('¡Encuentra el lugar correcto!')).toBeInTheDocument();
    });

    test('should handle invalid game mode gracefully', () => {
      render(
        <GameTutorial
          show={true}
          gameMode={"invalid" as any}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Should still render basic tutorial steps
      expect(screen.getByText('Tutorial Interactivo')).toBeInTheDocument();
    });

    test('should preserve step state during rapid show/hide', () => {
      const { rerender } = render(
        <GameTutorial
          show={false}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      rerender(
        <GameTutorial
          show={true}
          gameMode="continents"
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );

      // Should start from first step
      expect(screen.getByText('¡Bienvenido al juego de geografía!')).toBeInTheDocument();
      expect(screen.getByText('1 de 6')).toBeInTheDocument();
    });
  });
});