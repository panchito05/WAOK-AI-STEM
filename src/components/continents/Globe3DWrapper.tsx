'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Por ahora usar el componente simple para evitar errores
const Globe3DComponent = dynamic(() => import('./Globe3DSimple'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando globo interactivo...</p>
      </div>
    </div>
  )
});

interface Globe3DWrapperProps {
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

export default function Globe3DWrapper(props: Globe3DWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render the 3D component after mounting to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando globo 3D...</p>
        </div>
      </div>
    );
  }

  return <Globe3DComponent {...props} />;
}