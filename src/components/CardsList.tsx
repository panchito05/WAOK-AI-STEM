'use client';

import { useState } from 'react';
import { useCards } from '@/hooks/use-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  StarOff, 
  Edit, 
  Play, 
  Plus,
  BookOpen,
  Target,
  Clock,
  RotateCcw,
  Zap,
  Loader2,
  Sparkles,
  TrendingUp,
  Eye,
  Shuffle
} from 'lucide-react';
import EmptyState from './EmptyState';
import { PracticeCard } from '@/lib/storage';
import { exerciseCache } from '@/lib/exercise-cache';
import DynamicIcon from './DynamicIcon';

interface CardsListProps {
  onSelectCard: (card: PracticeCard) => void;
  onCreateCard: () => void;
  onEditCard: (card: PracticeCard) => void;
  onMultiPractice: (type: 'favorites' | 'all') => void;
}

export default function CardsList({ onSelectCard, onCreateCard, onEditCard, onMultiPractice }: CardsListProps) {
  const { cards, isLoading, toggleFavorite } = useCards();

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'bg-green-500';
    if (difficulty <= 6) return 'bg-yellow-500';
    if (difficulty <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Fácil';
    if (difficulty <= 6) return 'Intermedio';
    if (difficulty <= 8) return 'Difícil';
    return 'Experto';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Mis Tarjetas de Práctica</h2>
            <p className="text-muted-foreground">Selecciona una tarjeta para comenzar a practicar</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Mis Tarjetas de Práctica</h2>
            <p className="text-muted-foreground">Crea tu primera tarjeta para comenzar</p>
          </div>
        </div>
        <EmptyState onCreateCard={onCreateCard} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Mis Tarjetas de Práctica</h2>
          <p className="text-muted-foreground">Selecciona una tarjeta para comenzar a practicar</p>
        </div>
        <Button onClick={onCreateCard} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Crear Nueva Tarjeta
        </Button>
      </div>

      {/* Sección de Práctica Múltiple */}
      <div className="mb-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Shuffle className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Práctica Múltiple</CardTitle>
              </div>
              <CardDescription className="text-xs text-right">
                Practica varias operaciones en una sesión continua
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid md:grid-cols-2 gap-2">
              {/* Botón Solo Favoritas */}
              <div className="relative">
                <Button
                  variant="default"
                  size="sm"
                  className={`w-full h-auto py-2 px-3 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-sm ${
                    cards.filter(c => c.isFavorite).length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={cards.filter(c => c.isFavorite).length === 0}
                  onClick={() => onMultiPractice('favorites')}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">Solo Favoritas</span>
                    <span className="text-xs opacity-90">
                      {cards.filter(c => c.isFavorite).length === 0 
                        ? 'No tienes favoritas' 
                        : `${cards.filter(c => c.isFavorite).length} disponibles`}
                    </span>
                  </div>
                </Button>
              </div>

              {/* Botón Todas las Operaciones */}
              <div className="relative">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full h-auto py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                  onClick={() => onMultiPractice('all')}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Todas las Operaciones</span>
                    <span className="text-xs opacity-90">
                      {cards.length} disponibles
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const poolStatus = exerciseCache.getPoolStatus(card.id);
          return (
            <Card 
              key={card.id} 
              className={`relative transition-all hover:shadow-lg overflow-hidden ${
                card.isFavorite ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
            {/* Colored Header */}
            {card.color && (
              <div 
                className="h-12 flex items-center justify-center"
                style={{ backgroundColor: card.color }}
              >
                <DynamicIcon 
                  name={card.icon} 
                  className="text-white" 
                  size={24} 
                />
              </div>
            )}
            <CardHeader className={card.color ? 'pt-3' : ''}>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{card.topic}</CardTitle>
                    {poolStatus.ready && (
                      <Badge variant="secondary" className="gap-1">
                        <Zap className="h-3 w-3" />
                        Listo
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(card.id)}
                  className="h-8 w-8"
                >
                  {card.isFavorite ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dificultad</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < card.difficulty
                            ? getDifficultyColor(card.difficulty)
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getDifficultyLabel(card.difficulty)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{card.exerciseCount} ejercicios</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{card.attemptsPerExercise} intentos</span>
                </div>
                {card.levelExamples && Object.keys(card.levelExamples).length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      {Object.values(card.levelExamples).reduce((total, examples) => total + examples.length, 0)} ejemplos
                    </span>
                  </div>
                )}
                {card.autoCompensation && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <RotateCcw className="h-3 w-3" />
                    <span>Compensación automática</span>
                  </div>
                )}
                {card.adaptiveDifficulty && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Dificultad adaptativa</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditCard(card)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => onSelectCard(card)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {exerciseCache.getPoolStatus(card.id).ready ? 'Practicar' : 'Usar'}
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}