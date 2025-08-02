'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ArrowRight, Hand, Target, Trophy } from 'lucide-react';

interface GameTutorialProps {
  show: boolean;
  gameMode: 'continents' | 'countries' | 'subdivisions';
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  animation: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

export default function GameTutorial({ show, gameMode, onComplete, onSkip }: GameTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Tutorial steps based on game mode
  const getTutorialSteps = (mode: string): TutorialStep[] => {
    const baseSteps = [
      {
        id: 1,
        title: "¡Bienvenido al juego de geografía!",
        description: "Aprende sobre el mundo mientras juegas. ¡Es súper fácil y divertido!",
        animation: "animate-bounce-in",
        icon: <div className="text-4xl">🌍</div>,
        visual: (
          <div className="flex justify-center items-center h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
            <div className="text-6xl animate-bounce">🌎</div>
          </div>
        )
      },
      {
        id: 2,
        title: "¡Toca y arrastra!",
        description: "Usa tu dedo o el mouse para arrastrar las piezas. ¡Es como un rompecabezas!",
        animation: "animate-bounce",
        icon: <Hand className="w-8 h-8 text-blue-600" />,
        visual: (
          <div className="relative h-32 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="absolute left-8 top-8 w-12 h-8 bg-blue-500 rounded-lg animate-pulse"></div>
            <div className="text-2xl">→</div>
            <div className="absolute right-8 bottom-8 w-12 h-8 border-2 border-dashed border-gray-400 rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Hand className="w-6 h-6 text-blue-600 animate-bounce" />
            </div>
          </div>
        )
      },
      {
        id: 3,
        title: "¡Encuentra el lugar correcto!",
        description: "Cuando arrastres una pieza al lugar correcto, brillará en verde. ¡Escucha los sonidos divertidos!",
        animation: "animate-glow",
        icon: <Target className="w-8 h-8 text-green-600" />,
        visual: (
          <div className="h-32 bg-green-50 rounded-lg flex items-center justify-center">
            <div className="w-16 h-12 bg-green-500 rounded-lg animate-pulse-success flex items-center justify-center">
              <div className="text-white text-2xl">✓</div>
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "¡Pide ayuda si la necesitas!",
        description: "Si te quedas atascado, presiona el botón de pista. Te daremos una ayuda especial.",
        animation: "animate-pulse",
        icon: <div className="text-2xl">💡</div>,
        visual: (
          <div className="h-32 bg-orange-50 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-bounce">💡</div>
              <div className="text-sm bg-orange-200 px-3 py-2 rounded-full">
                ¡Aquí va esta pieza!
              </div>
            </div>
          </div>
        )
      },
      {
        id: 5,
        title: "¡Completa el desafío!",
        description: "Cuando coloques todas las piezas correctamente, ¡habrá una gran celebración!",
        animation: "animate-celebrate",
        icon: <Trophy className="w-8 h-8 text-yellow-600" />,
        visual: (
          <div className="h-32 bg-yellow-50 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-4xl animate-bounce">🏆</div>
            <div className="absolute top-2 left-4 text-xl animate-bounce animation-delay-100">🎉</div>
            <div className="absolute top-4 right-4 text-lg animate-bounce animation-delay-200">⭐</div>
            <div className="absolute bottom-4 left-8 text-lg animate-bounce animation-delay-300">✨</div>
            <div className="absolute bottom-2 right-8 text-xl animate-bounce animation-delay-150">🎊</div>
          </div>
        )
      }
    ];

    // Add mode-specific step
    const modeSpecificStep = {
      continents: {
        id: 6,
        title: "¡Arrastra los continentes!",
        description: "En este modo, arrastra cada continente a su lugar correcto en el mapa mundial.",
        animation: "animate-bounce",
        icon: <div className="text-2xl">🗺️</div>,
        visual: (
          <div className="h-32 bg-blue-50 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2">
              {['🌍', '🌎', '🌏'].map((globe, i) => (
                <div key={i} className={`text-2xl animate-bounce animation-delay-${i * 100}`}>
                  {globe}
                </div>
              ))}
            </div>
          </div>
        )
      },
      countries: {
        id: 6,
        title: "¡Ubica los países!",
        description: "Arrastra cada país a su continente correcto. ¡Aprende sobre diferentes naciones!",
        animation: "animate-bounce",
        icon: <div className="text-2xl">🏴</div>,
        visual: (
          <div className="h-32 bg-green-50 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🇺🇸</div>
              <div className="text-lg">→</div>
              <div className="text-2xl">🌎</div>
            </div>
          </div>
        )
      },
      subdivisions: {
        id: 6,
        title: "¡Explora estados y provincias!",
        description: "Coloca cada estado o provincia en su lugar correcto dentro del país.",
        animation: "animate-bounce",
        icon: <div className="text-2xl">🏘️</div>,
        visual: (
          <div className="h-32 bg-orange-50 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-orange-300 rounded"></div>
              <div className="text-lg">→</div>
              <div className="w-16 h-12 bg-orange-200 rounded flex items-center justify-center">
                <div className="w-6 h-4 bg-orange-400 rounded"></div>
              </div>
            </div>
          </div>
        )
      }
    };

    return [...baseSteps, modeSpecificStep[mode]];
  };

  const steps = getTutorialSteps(gameMode);
  const isLastStep = currentStep >= steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  if (!show) return null;

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-blue-700">
              Tutorial Interactivo
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className={`space-y-6 transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Step indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-blue-500 scale-125' 
                    : index < currentStep 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Current step content */}
          <Card className={`border-2 border-blue-200 ${currentStepData.animation}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                {currentStepData.icon}
              </div>

              <h3 className="text-lg font-bold text-center mb-3 text-gray-800">
                {currentStepData.title}
              </h3>

              <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Visual demonstration */}
              <div className="mb-4">
                {currentStepData.visual}
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="disabled:opacity-50"
            >
              ← Anterior
            </Button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </div>

            {isLastStep ? (
              <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                ¡Empezar a jugar! 🎮
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Siguiente <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-gray-500">
              Saltar tutorial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}