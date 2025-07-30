'use client';

import { useState, useEffect, useCallback } from 'react';
import { PracticeCard, cardStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { exerciseCache } from '@/lib/exercise-cache';
import { useProfile } from '@/contexts/ProfileContext';

export function useCards() {
  const [cards, setCards] = useState<PracticeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentProfile } = useProfile();

  // Load cards on mount and when profile changes
  useEffect(() => {
    if (currentProfile) {
      loadCards();
    }
    
    // Limpiar ejercicios antiguos al cargar la app
    setTimeout(() => {
      console.log('Running exercise cache cleanup...');
      exerciseCache.cleanOldExercises();
      
      // Log métricas globales
      const metrics = exerciseCache.getUsageMetrics();
      console.log('Global exercise pool metrics:', metrics);
    }, 2000); // Esperar a que se carguen las tarjetas
  }, [currentProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCards = useCallback(() => {
    setIsLoading(true);
    try {
      const storedCards = cardStorage.getAll();
      
      // Crear tarjeta Sudoku predefinida si no existe
      const sudokuCard: PracticeCard = {
        id: 'sudoku-module',
        type: 'module',
        name: 'Sudoku Educativo',
        topic: 'Sudoku',
        difficulty: 5,
        customInstructions: 'Módulo de Sudoku con 3 variantes: Clásico 9x9, Dosdoku 4x4 y 6x6',
        exerciseCount: 0, // No aplica para módulos
        attemptsPerExercise: 0, // No aplica para módulos
        autoCompensation: false,
        adaptiveDifficulty: false,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#6366f1', // Indigo
        icon: 'Grid3x3',
        timerEnabled: true,
        timerSeconds: 0, // El módulo maneja su propio timer
      };
      
      // Verificar si ya existe la tarjeta Sudoku
      const hasSudokuCard = storedCards.some(card => card.id === 'sudoku-module');
      
      // Combinar tarjetas almacenadas con módulos predefinidos
      const allCards = hasSudokuCard ? storedCards : [...storedCards, sudokuCard];
      
      setCards(allCards);
      
      if (allCards.length > 0) {
        
        // Preload exercises with intelligent prioritization (solo para tarjetas de práctica)
        console.log('Starting intelligent exercise preloading...');
        
        // Filtrar solo tarjetas de práctica (no módulos)
        const practiceCards = allCards.filter(card => card.type !== 'module');
        
        // Separar tarjetas por prioridad
        const favoriteCards = practiceCards.filter(card => card.isFavorite);
        const regularCards = practiceCards.filter(card => !card.isFavorite);
        
        // Precargar favoritos primero con más ejercicios
        favoriteCards.forEach(async (card) => {
          const poolStatus = exerciseCache.getPoolStatus(card.id);
          const targetSize = 30; // Pool completo para favoritos
          
          if (poolStatus.size < targetSize) {
            console.log(`⭐ Favorite card "${card.name}" needs preloading (current: ${poolStatus.size}/${targetSize})`);
            await exerciseCache.preloadExercises({
              id: card.id,
              topic: card.topic,
              difficulty: card.difficulty,
              customInstructions: card.customInstructions,
              levelExamples: card.levelExamples,
              structuredExamples: card.structuredExamples
            });
          }
        });
        
        // Precargar tarjetas regulares con menos ejercicios
        setTimeout(() => {
          regularCards.forEach(async (card) => {
            const poolStatus = exerciseCache.getPoolStatus(card.id);
            const targetSize = 15; // Pool reducido para no favoritos
            
            if (poolStatus.size < targetSize) {
              console.log(`Card "${card.name}" needs preloading (current: ${poolStatus.size}/${targetSize})`);
              // Generar solo lo necesario para alcanzar el objetivo
              await exerciseCache.maintainPoolSize(card.id, targetSize);
            }
          });
        }, 1000); // Retrasar precarga de regulares para priorizar favoritos
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tarjetas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createCard = useCallback((card: Omit<PracticeCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCard = cardStorage.create(card);
      setCards(cardStorage.getAll());
      toast({
        title: 'Tarjeta creada',
        description: `La tarjeta "${newCard.topic}" se ha creado correctamente`,
      });
      return newCard;
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la tarjeta',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updateCard = useCallback((id: string, updates: Partial<Omit<PracticeCard, 'id' | 'createdAt'>>) => {
    try {
      const updatedCard = cardStorage.update(id, updates);
      if (updatedCard) {
        setCards(cardStorage.getAll());
        toast({
          title: 'Tarjeta actualizada',
          description: `La tarjeta "${updatedCard.topic}" se ha actualizado`,
        });
      }
      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la tarjeta',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteCard = useCallback((id: string) => {
    try {
      const card = cardStorage.getById(id);
      const success = cardStorage.delete(id);
      if (success) {
        // Clear the exercise cache for this card
        exerciseCache.clearPool(id);
        
        setCards(cardStorage.getAll());
        toast({
          title: 'Tarjeta eliminada',
          description: card ? `La tarjeta "${card.topic}" se ha eliminado` : 'Tarjeta eliminada',
        });
      }
      return success;
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarjeta',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const toggleFavorite = useCallback((id: string) => {
    try {
      const updatedCard = cardStorage.toggleFavorite(id);
      if (updatedCard) {
        setCards(cardStorage.getAll());
        toast({
          title: updatedCard.isFavorite ? 'Agregado a favoritos' : 'Removido de favoritos',
          description: `"${updatedCard.topic}" ${updatedCard.isFavorite ? 'es ahora favorito' : 'ya no es favorito'}`,
        });
      }
      return updatedCard;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el favorito',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const getCardById = useCallback((id: string) => {
    return cards.find(card => card.id === id) || null;
  }, [cards]);

  return {
    cards,
    isLoading,
    createCard,
    updateCard,
    deleteCard,
    toggleFavorite,
    getCardById,
    refreshCards: loadCards,
  };
}