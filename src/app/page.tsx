'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import CardsList from '@/components/CardsList';
import CardEditor from '@/components/CardEditor';
import PracticeScreen from '@/components/PracticeScreen';
import MultiPracticeScreen from '@/components/MultiPracticeScreen';
import SudokuScreen from '@/components/sudoku/SudokuScreen';
import { MazeScreen } from '@/components/maze/MazeScreen';
import TicTacToeScreen from '@/components/tictactoe/TicTacToeScreen';
import { PracticeCard } from '@/lib/storage';

type ViewMode = 'list' | 'practice' | 'edit' | 'multi-practice' | 'sudoku' | 'maze' | 'tictactoe';

export default function Home() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedCard, setSelectedCard] = useState<PracticeCard | null>(null);
  const [editingCard, setEditingCard] = useState<PracticeCard | null>(null);
  const [multiPracticeType, setMultiPracticeType] = useState<'favorites' | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle search params safely after mounting
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const view = searchParams?.get('view');
      if (view && ['list', 'practice', 'edit', 'multi-practice'].includes(view)) {
        setCurrentView(view as ViewMode);
      }
    } catch (error) {
      console.warn('Error reading search params:', error);
    }
  }, [mounted, searchParams]);

  // Don't render until mounted to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 bg-background/90 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSelectCard = (card: PracticeCard) => {
    if (card.type === 'module') {
      if (card.id === 'sudoku-module') {
        setCurrentView('sudoku');
      } else if (card.id === 'maze-module') {
        setCurrentView('maze');
      } else if (card.id === 'tictactoe-module') {
        setCurrentView('tictactoe');
      }
    } else {
      setSelectedCard(card);
      setCurrentView('practice');
    }
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setCurrentView('edit');
  };

  const handleEditCard = (card: PracticeCard) => {
    setEditingCard(card);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCard(null);
    setEditingCard(null);
  };

  const handleMultiPractice = (type: 'favorites' | 'all') => {
    setMultiPracticeType(type);
    setCurrentView('multi-practice');
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background/90 p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          {currentView === 'list' && (
            <CardsList
              onSelectCard={handleSelectCard}
              onCreateCard={handleCreateCard}
              onEditCard={handleEditCard}
              onMultiPractice={handleMultiPractice}
            />
          )}
          
          {currentView === 'practice' && selectedCard && (
            <PracticeScreen
              card={selectedCard}
              onBack={handleBackToList}
            />
          )}
          
          {currentView === 'edit' && (
            <div className="space-y-4">
              <button
                onClick={handleBackToList}
                className="text-primary hover:underline"
              >
                ← Volver a mis tarjetas
              </button>
              <CardEditor
                card={editingCard}
                onSave={handleBackToList}
                onCancel={handleBackToList}
              />
            </div>
          )}
          
          {currentView === 'multi-practice' && (
            <MultiPracticeScreen
              type={multiPracticeType}
              onBack={handleBackToList}
            />
          )}
          
          {currentView === 'sudoku' && (
            <SudokuScreen
              onBack={handleBackToList}
            />
          )}
          
          {currentView === 'maze' && (
            <MazeScreen
              onBack={handleBackToList}
            />
          )}
          
          {currentView === 'tictactoe' && (
            <TicTacToeScreen
              onBack={handleBackToList}
            />
          )}
        </div>
      </main>
    </div>
  );
}
