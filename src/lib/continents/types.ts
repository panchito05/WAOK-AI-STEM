export type ContinentsMode = 'continents' | 'countries' | 'subdivisions';
export type ContinentsDifficulty = 'easy' | 'medium' | 'hard';
export type DragItemType = 'continent' | 'country' | 'subdivision';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Continent {
  id: string;
  name: string;
  nameEn: string;
  position: Position; // Posición relativa en el mapa (0-100%)
  size: Size; // Tamaño relativo (0-100%)
  color: string;
  countries: string[]; // IDs de países
  animalId?: string;
  description?: string;
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  continentId: string;
  capital: string;
  capitalEn: string;
  population?: number;
  flagUrl?: string;
  position: Position; // Posición relativa dentro del continente
  size: Size;
  subdivisions?: string[]; // IDs de estados/provincias
  animalId?: string;
  description?: string;
  curiosities?: string[];
}

export interface Subdivision {
  id: string;
  name: string;
  nameEn: string;
  countryId: string;
  capital?: string;
  capitalEn?: string;
  flagUrl?: string;
  position: Position; // Posición relativa dentro del país
  size: Size;
  animalId?: string;
  description?: string;
}

export interface Animal {
  id: string;
  name: string;
  nameEn: string;
  imageUrl: string;
  habitat: string;
  description: string;
  regionType: 'continent' | 'country' | 'subdivision';
  regionId: string;
}

export interface DragItem {
  id: string;
  type: DragItemType;
  data: Continent | Country | Subdivision;
  currentPosition?: Position;
  isPlaced: boolean;
  isCorrect?: boolean;
}

export interface DropZone {
  id: string;
  type: DragItemType;
  position: Position;
  size: Size;
  acceptsId: string; // ID del elemento que debe ir aquí
  isOccupied: boolean;
  currentItemId?: string;
}

export interface GameConfig {
  mode: ContinentsMode;
  difficulty: ContinentsDifficulty;
  selectedCountry?: string; // Para modo subdivisiones
  showFlags: boolean;
  showAnimals: boolean;
  showNames: boolean;
  showInfo: boolean;
  soundEnabled: boolean;
  autoValidate: boolean;
  allowHints: boolean;
}

export interface GameState {
  id: string;
  config: GameConfig;
  dragItems: DragItem[];
  dropZones: DropZone[];
  startTime: number;
  endTime?: number;
  pausedTime: number;
  isPaused: boolean;
  attempts: number;
  correctPlacements: number;
  hintsUsed: number;
  completed: boolean;
  score: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesCompleted: number;
  bestTimes: {
    [key in ContinentsMode]: {
      [key in ContinentsDifficulty]: number | null;
    };
  };
  averageTimes: {
    [key in ContinentsMode]: {
      [key in ContinentsDifficulty]: number;
    };
  };
  totalHintsUsed: number;
  totalAttempts: number;
  accuracy: number; // Porcentaje de aciertos
  favoriteMode?: ContinentsMode;
  lastPlayed?: string;
}

export interface GameMove {
  timestamp: number;
  itemId: string;
  fromPosition?: Position;
  toPosition: Position;
  dropZoneId?: string;
  isCorrect: boolean;
  attemptNumber: number;
}

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Fácil',
    description: 'Nombres visibles y pistas disponibles',
    showNames: true,
    allowHints: true,
    itemsToPlace: 5,
    color: 'bg-green-500'
  },
  medium: {
    label: 'Intermedio',
    description: 'Sin nombres, con validación',
    showNames: false,
    allowHints: true,
    itemsToPlace: 8,
    color: 'bg-yellow-500'
  },
  hard: {
    label: 'Difícil',
    description: 'Sin ayudas visuales',
    showNames: false,
    allowHints: false,
    itemsToPlace: 12,
    color: 'bg-red-500'
  }
} as const;

export const MODE_CONFIG = {
  continents: {
    label: 'Continentes',
    description: 'Coloca los continentes en el mapa mundial',
    icon: 'Globe',
    color: '#3b82f6'
  },
  countries: {
    label: 'Países',
    description: 'Ubica países en su continente correcto',
    icon: 'Flag',
    color: '#10b981'
  },
  subdivisions: {
    label: 'Estados y Provincias',
    description: 'Coloca las divisiones internas de un país',
    icon: 'MapPin',
    color: '#f59e0b'
  }
} as const;