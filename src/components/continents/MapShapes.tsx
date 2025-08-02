'use client';

import { CSSProperties } from 'react';

interface ShapeProps {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  style?: CSSProperties;
  className?: string;
}

// Formas simplificadas pero reconocibles de continentes
export const ContinentShapes = {
  // América del Norte - forma característica con Canadá, USA y México
  'north-america': ({ fill = '#FF6B6B', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 20,10 Q 25,8 30,10 L 35,8 Q 40,7 45,10 L 50,15 L 48,20 L 52,25 L 50,30 L 45,35 L 40,40 L 35,45 L 30,50 L 25,55 L 20,60 L 15,55 L 10,50 L 8,45 L 10,40 L 12,35 L 15,30 L 18,25 L 20,20 L 18,15 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
      {/* Alaska */}
      <path
        d="M 5,15 L 8,12 L 10,15 L 8,18 L 5,15 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // América del Sur - forma característica alargada
  'south-america': ({ fill = '#4ECDC4', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,20 L 45,25 L 50,30 L 48,35 L 45,40 L 40,45 L 35,50 L 30,55 L 28,60 L 25,65 L 23,70 L 22,75 L 21,80 L 20,85 L 19,88 L 20,20 Q 30,18 40,20 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Europa - forma con península ibérica, italiana y escandinava
  'europe': ({ fill = '#6C5CE7', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 30,40 L 35,38 L 40,40 L 45,38 L 50,40 L 48,45 L 45,48 L 40,50 L 35,48 L 32,50 L 30,55 L 28,50 L 25,48 L 20,45 L 22,40 L 25,38 L 30,40 Z M 35,52 L 37,55 L 35,58 L 33,55 L 35,52 Z M 45,50 L 47,54 L 45,58 L 43,54 L 45,50 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // África - forma característica con cuerno de África
  'africa': ({ fill = '#FFE66D', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,25 L 45,20 L 50,22 L 55,25 L 58,30 L 60,35 L 58,40 L 55,45 L 50,50 L 45,55 L 40,60 L 35,65 L 30,70 L 28,75 L 30,60 L 32,55 L 35,50 L 38,45 L 40,40 L 38,35 L 35,30 L 38,25 L 40,25 Z M 55,30 L 60,28 L 62,32 L 60,35 L 55,30 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Asia - forma más grande con India y sudeste asiático
  'asia': ({ fill = '#95E1D3', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,20 L 50,18 L 60,20 L 70,22 L 75,25 L 80,30 L 78,35 L 75,40 L 70,45 L 65,50 L 60,48 L 55,50 L 50,55 L 45,58 L 40,55 L 35,50 L 30,45 L 32,40 L 35,35 L 38,30 L 40,25 L 40,20 Z M 50,55 L 52,60 L 50,65 L 48,62 L 50,55 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Oceanía - Australia con forma característica
  'oceania': ({ fill = '#FFA502', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 30,50 L 40,48 L 50,50 L 55,52 L 60,55 L 58,60 L 55,62 L 50,65 L 45,63 L 40,60 L 35,58 L 30,55 L 28,52 L 30,50 Z M 62,55 L 65,57 L 63,60 L 60,58 L 62,55 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  )
};

// Formas simplificadas de países principales
export const CountryShapes = {
  // Estados Unidos - forma característica con Florida y Texas
  'usa': ({ fill = '#FF6B6B', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 20,30 L 60,30 L 65,35 L 60,40 L 55,45 L 50,50 L 45,48 L 40,50 L 35,48 L 30,45 L 25,40 L 20,35 L 20,30 Z M 50,48 L 52,52 L 50,55 L 48,52 L 50,48 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Brasil - forma característica con costa este
  'brazil': ({ fill = '#4ECDC4', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 30,30 L 50,28 L 60,32 L 65,40 L 60,50 L 55,55 L 50,60 L 45,58 L 40,55 L 35,50 L 30,45 L 28,40 L 30,35 L 30,30 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // China - forma característica con costa este
  'china': ({ fill = '#95E1D3', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 25,35 L 40,30 L 55,32 L 65,35 L 70,40 L 68,45 L 65,50 L 60,52 L 55,50 L 50,48 L 45,50 L 40,48 L 35,45 L 30,42 L 25,40 L 25,35 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // India - forma triangular característica
  'india': ({ fill = '#FFE66D', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,30 L 50,28 L 55,32 L 52,40 L 50,45 L 48,50 L 45,55 L 43,60 L 40,55 L 38,50 L 35,45 L 37,40 L 40,35 L 40,30 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Australia - forma característica
  'australia': ({ fill = '#FFA502', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 25,45 L 40,43 L 55,45 L 65,48 L 70,52 L 68,57 L 65,60 L 60,62 L 55,60 L 50,58 L 45,60 L 40,58 L 35,55 L 30,52 L 25,48 L 25,45 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Canadá - forma con muchas islas al norte
  'canada': ({ fill = '#FF6B6B', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 20,25 L 30,23 L 40,25 L 50,23 L 60,25 L 65,30 L 60,35 L 55,40 L 50,38 L 45,40 L 40,38 L 35,40 L 30,38 L 25,35 L 20,30 L 20,25 Z M 25,20 L 28,18 L 30,20 L 28,22 L 25,20 Z M 35,18 L 38,16 L 40,18 L 38,20 L 35,18 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // México - forma característica con Baja California
  'mexico': ({ fill = '#4ECDC4', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 30,40 L 45,38 L 50,42 L 48,48 L 45,52 L 40,55 L 35,52 L 30,48 L 28,45 L 30,40 Z M 25,42 L 23,50 L 25,52 L 27,45 L 25,42 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Argentina - forma alargada característica
  'argentina': ({ fill = '#6C5CE7', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 45,30 L 50,32 L 48,40 L 46,48 L 44,56 L 42,64 L 40,72 L 38,80 L 37,85 L 35,80 L 36,72 L 38,64 L 40,56 L 42,48 L 44,40 L 45,32 L 45,30 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // España - península ibérica
  'spain': ({ fill = '#FFE66D', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 35,45 L 45,43 L 52,45 L 50,50 L 45,52 L 40,50 L 35,48 L 35,45 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Francia - forma hexagonal
  'france': ({ fill = '#95E1D3', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,40 L 48,38 L 52,42 L 50,48 L 45,52 L 40,50 L 38,45 L 40,40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  )
};

// Estados/Provincias principales
export const SubdivisionShapes = {
  // California
  'california': ({ fill = '#FF6B6B', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,35 L 45,40 L 43,50 L 40,55 L 38,50 L 36,45 L 38,40 L 40,35 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Texas - forma característica
  'texas': ({ fill = '#4ECDC4', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 35,40 L 50,40 L 52,45 L 50,52 L 45,55 L 40,52 L 35,48 L 33,45 L 35,40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Florida - península característica
  'florida': ({ fill = '#6C5CE7', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 45,40 L 50,42 L 48,48 L 46,54 L 44,60 L 42,58 L 43,52 L 44,46 L 45,40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  ),

  // Nueva York
  'new-york': ({ fill = '#FFE66D', stroke = '#333', strokeWidth = 1, opacity = 1, style, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" style={style} className={className}>
      <path
        d="M 40,42 L 48,40 L 50,45 L 48,48 L 45,50 L 42,48 L 40,45 L 40,42 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </svg>
  )
};

// Función helper para obtener el componente de forma correcto
export function getShapeComponent(type: 'continent' | 'country' | 'subdivision', id: string) {
  switch (type) {
    case 'continent':
      return ContinentShapes[id as keyof typeof ContinentShapes];
    case 'country':
      return CountryShapes[id as keyof typeof CountryShapes];
    case 'subdivision':
      return SubdivisionShapes[id as keyof typeof SubdivisionShapes];
    default:
      return null;
  }
}