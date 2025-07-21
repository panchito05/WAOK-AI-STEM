'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CardsList from '@/components/CardsList';
import CardEditor from '@/components/CardEditor';
import PracticeScreen from '@/components/PracticeScreen';
import { PracticeCard } from '@/lib/storage';

type ViewMode = 'list' | 'practice' | 'edit';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedCard, setSelectedCard] = useState<PracticeCard | null>(null);
  const [editingCard, setEditingCard] = useState<PracticeCard | null>(null);

  const handleSelectCard = (card: PracticeCard) => {
    setSelectedCard(card);
    setCurrentView('practice');
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
        </div>
      </main>
    </div>
  );
}
