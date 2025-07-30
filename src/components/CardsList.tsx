'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCards } from '@/hooks/use-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
  Shuffle,
  Search,
  X,
  Puzzle,
  Route
} from 'lucide-react';
import EmptyState from './EmptyState';
import { PracticeCard } from '@/lib/storage';
import { exerciseCache } from '@/lib/exercise-cache';
import DynamicIcon from './DynamicIcon';
import { findTopicConfig, getNormalizedTopicName } from '@/lib/topic-mapping';
import { fuzzySearch, isSpecialSearchTerm, applySpecialSearch } from '@/lib/search-utils';
import { useProfile } from '@/contexts/ProfileContext';

interface CardsListProps {
  onSelectCard: (card: PracticeCard) => void;
  onCreateCard: () => void;
  onEditCard: (card: PracticeCard) => void;
  onMultiPractice: (type: 'favorites' | 'all') => void;
}

const SEARCH_STORAGE_KEY = 'waok_search_filters';

export default function CardsList({ onSelectCard, onCreateCard, onEditCard, onMultiPractice }: CardsListProps) {
  const { cards, isLoading, toggleFavorite } = useCards();
  const { currentProfile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Cargar filtros guardados al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFilters = sessionStorage.getItem(SEARCH_STORAGE_KEY);
        if (savedFilters) {
          const { query, favoritesOnly } = JSON.parse(savedFilters);
          if (query) setSearchQuery(query);
          if (favoritesOnly) setShowFavoritesOnly(favoritesOnly);
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Limpiar filtros cuando cambie el perfil
  useEffect(() => {
    setSearchQuery('');
    setShowFavoritesOnly(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    }
  }, [currentProfile?.id]);

  // Implementar debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Guardar filtros cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify({
          query: searchQuery,
          favoritesOnly: showFavoritesOnly
        }));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    }
  }, [searchQuery, showFavoritesOnly]);

  // Función de filtrado inteligente
  const filteredCards = useMemo(() => {
    let filtered = cards;

    // Filtrar por favoritos si está activado
    if (showFavoritesOnly) {
      filtered = filtered.filter(card => card.isFavorite);
    }

    // Filtrar por búsqueda si hay query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      
      // Primero verificar si es un término de búsqueda especial
      if (isSpecialSearchTerm(query)) {
        filtered = filtered.filter(card => applySpecialSearch(query, card));
      } else {
        filtered = filtered.filter(card => {
          // Buscar en el nombre del módulo
          if (card.topic.toLowerCase().includes(query)) return true;
          
          // Buscar en el nombre personalizado si existe
          if (card.name && card.name.toLowerCase().includes(query)) return true;
          
          // Buscar en las instrucciones personalizadas
          if (card.customInstructions && card.customInstructions.toLowerCase().includes(query)) return true;
          
          // Buscar con mapeo bilingüe
          const topicConfig = findTopicConfig(query);
          if (topicConfig && topicConfig !== findTopicConfig('default')) {
            // Si encontramos un tema que coincide, verificar si la tarjeta es de ese tema
            const cardTopicConfig = findTopicConfig(card.topic);
            if (cardTopicConfig === topicConfig) return true;
          }
          
          // Buscar si el query normalizado coincide con el topic normalizado
          const normalizedQuery = getNormalizedTopicName(query);
          const normalizedCardTopic = getNormalizedTopicName(card.topic);
          if (normalizedCardTopic.toLowerCase().includes(normalizedQuery.toLowerCase())) return true;
          
          // Búsqueda fuzzy para errores tipográficos
          if (query.length > 3) {
            // Buscar con tolerancia a errores en el topic
            if (fuzzySearch(query, card.topic, 2)) return true;
            
            // Buscar con tolerancia en el nombre personalizado
            if (card.name && fuzzySearch(query, card.name, 2)) return true;
          }
          
          return false;
        });
      }
    }

    return filtered;
  }, [cards, debouncedSearchQuery, showFavoritesOnly]);

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

      {/* Barra de búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar módulos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {searchQuery !== debouncedSearchQuery ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="default"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="flex items-center gap-2"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Solo favoritos</span>
            <span className="sm:hidden">Favoritos</span>
          </Button>
        </div>
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
                    filteredCards.filter(c => c.isFavorite).length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={filteredCards.filter(c => c.isFavorite).length === 0}
                  onClick={() => onMultiPractice('favorites')}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">Solo Favoritas</span>
                    <span className="text-xs opacity-90">
                      {filteredCards.filter(c => c.isFavorite).length === 0 
                        ? 'No tienes favoritas' 
                        : `${filteredCards.filter(c => c.isFavorite).length} disponibles`}
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
                      {filteredCards.length} disponibles
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de tarjetas con animaciones */}
      {filteredCards.length === 0 && (debouncedSearchQuery || showFavoritesOnly) ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No se encontraron resultados</h3>
              <p className="text-sm text-muted-foreground">
                {showFavoritesOnly && !debouncedSearchQuery ? (
                  "No tienes módulos marcados como favoritos"
                ) : debouncedSearchQuery ? (
                  `No se encontraron módulos que coincidan con "${debouncedSearchQuery}"`
                ) : (
                  "Intenta con otros términos de búsqueda"
                )}
              </p>
              {(debouncedSearchQuery || showFavoritesOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setShowFavoritesOnly(false);
                  }}
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => {
            const poolStatus = exerciseCache.getPoolStatus(card.id);
            return (
              <Card 
                key={card.id} 
                className={`relative transition-all duration-300 hover:shadow-lg overflow-hidden animate-in fade-in-50 ${
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
                    {poolStatus.ready && card.type !== 'module' && (
                      <Badge variant="secondary" className="gap-1">
                        <Zap className="h-3 w-3" />
                        Listo
                      </Badge>
                    )}
                    {card.type === 'module' && (
                      <Badge variant="secondary" className="gap-1 bg-indigo-100 text-indigo-700">
                        <Puzzle className="h-3 w-3" />
                        Módulo
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
                {card.type !== 'module' ? (
                  <>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{card.exerciseCount} ejercicios</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>{card.attemptsPerExercise} intentos</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Puzzle className="h-3 w-3" />
                      <span>3 variantes</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>3 niveles</span>
                    </div>
                  </>
                )}
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
                {card.type !== 'module' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditCard(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  className="flex-1"
                  onClick={() => onSelectCard(card)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {card.type === 'module' ? 'Jugar' : (exerciseCache.getPoolStatus(card.id).ready ? 'Practicar' : 'Usar')}
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}