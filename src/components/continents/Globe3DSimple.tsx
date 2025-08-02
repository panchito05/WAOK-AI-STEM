'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, Flag, MapPin } from 'lucide-react';

interface Globe3DSimpleProps {
  mode: 'continents' | 'countries' | 'subdivisions';
  onContinentClick?: (continentId: string) => void;
  onCountryClick?: (countryId: string) => void;
  onModeChange?: (mode: 'continents' | 'countries' | 'subdivisions') => void;
  selectedContinent?: string;
  selectedCountry?: string;
  showLabels?: boolean;
  showBorders?: boolean;
  autoRotate?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

// Datos simplificados de continentes con emojis
const CONTINENT_DATA = [
  { id: 'north-america', name: 'América del Norte', emoji: '🗽', color: 'bg-red-500' },
  { id: 'south-america', name: 'América del Sur', emoji: '🌴', color: 'bg-green-500' },
  { id: 'europe', name: 'Europa', emoji: '🏰', color: 'bg-blue-500' },
  { id: 'africa', name: 'África', emoji: '🦁', color: 'bg-yellow-500' },
  { id: 'asia', name: 'Asia', emoji: '🏯', color: 'bg-purple-500' },
  { id: 'oceania', name: 'Oceanía', emoji: '🏄', color: 'bg-pink-500' },
  { id: 'antarctica', name: 'Antártida', emoji: '🐧', color: 'bg-gray-400' }
];

export default function Globe3DSimple({
  mode,
  onContinentClick,
  onCountryClick,
  onModeChange,
  selectedContinent,
  selectedCountry,
  showLabels = true
}: Globe3DSimpleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [canLoad3D, setCanLoad3D] = useState(false);

  useEffect(() => {
    // Verificar si podemos cargar 3D (por ahora siempre false para evitar errores)
    setCanLoad3D(false);
  }, []);

  // Por ahora, siempre mostrar la versión 2D simplificada
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">
          🌍 Explora el Mundo 🌎
        </h2>
        <p className="text-lg text-blue-600">
          {mode === 'continents' ? 'Haz click en un continente para explorarlo' :
           mode === 'countries' ? 'Selecciona un país' :
           'Explora las regiones'}
        </p>
      </div>

      {mode === 'continents' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
          {CONTINENT_DATA.map((continent) => (
            <Card
              key={continent.id}
              className={`
                p-6 cursor-pointer transform transition-all duration-300
                hover:scale-105 hover:shadow-xl
                ${selectedContinent === continent.id ? 'ring-4 ring-blue-400' : ''}
              `}
              onClick={() => {
                onContinentClick?.(continent.id);
                // Cambiar automáticamente a modo países
                setTimeout(() => onModeChange?.('countries'), 300);
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-2">{continent.emoji}</div>
                <h3 className="font-bold text-lg">{continent.name}</h3>
                <div className={`mt-2 h-2 ${continent.color} rounded-full`}></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mode === 'countries' && selectedContinent && (
        <div className="text-center">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => onModeChange?.('continents')}
              className="mb-4"
            >
              ← Volver a continentes
            </Button>
          </div>
          <Card className="p-8">
            <Flag className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-2xl font-bold mb-2">Países de {CONTINENT_DATA.find(c => c.id === selectedContinent)?.name}</h3>
            <p className="text-gray-600">Próximamente: Lista de países interactiva</p>
          </Card>
        </div>
      )}

      {mode === 'subdivisions' && selectedCountry && (
        <div className="text-center">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => onModeChange?.('countries')}
              className="mb-4"
            >
              ← Volver a países
            </Button>
          </div>
          <Card className="p-8">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-bold mb-2">Estados/Provincias</h3>
            <p className="text-gray-600">Próximamente: Divisiones territoriales</p>
          </Card>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          {isLoading ? '⏳ Cargando experiencia 3D...' : '✨ Modo interactivo 2D'}
        </p>
      </div>
    </div>
  );
}