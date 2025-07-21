'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Sparkles, BookOpen, Target } from 'lucide-react';

interface EmptyStateProps {
  onCreateCard: () => void;
}

export default function EmptyState({ onCreateCard }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="text-2xl font-semibold mb-2">
        ¡Comienza tu aventura matemática!
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Crea tu primera tarjeta de práctica personalizada y mejora tus habilidades matemáticas de forma divertida.
      </p>
      
      <Button onClick={onCreateCard} size="lg" className="mb-8">
        <Plus className="mr-2 h-5 w-5" />
        Crear Mi Primera Tarjeta
      </Button>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <h4 className="font-medium">Personaliza</h4>
          <p className="text-sm text-muted-foreground">
            Define el tema, dificultad y cantidad de ejercicios
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <h4 className="font-medium">Practica</h4>
          <p className="text-sm text-muted-foreground">
            Resuelve ejercicios con retroalimentación inteligente
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="font-medium">Mejora</h4>
          <p className="text-sm text-muted-foreground">
            Aprende de tus errores con pistas personalizadas
          </p>
        </div>
      </div>
    </Card>
  );
}