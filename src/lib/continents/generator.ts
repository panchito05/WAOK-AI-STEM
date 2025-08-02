import { 
  GameState, 
  GameConfig, 
  DragItem, 
  DropZone, 
  ContinentsMode,
  ContinentsDifficulty,
  DIFFICULTY_CONFIG 
} from './types';
import { 
  CONTINENTS, 
  COUNTRIES, 
  SUBDIVISIONS,
  getContinentsList,
  getCountriesByContinent,
  getSubdivisionsByCountry,
  COUNTRIES_WITH_SUBDIVISIONS
} from './data';
import type { Country } from './types';

// Función para mezclar array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Función para generar posiciones aleatorias para items no colocados
function generateRandomPosition(): { x: number; y: number } {
  return {
    x: 5 + Math.random() * 20, // Entre 5% y 25%
    y: 10 + Math.random() * 80  // Entre 10% y 90%
  };
}

// Generar ejercicio de continentes
function generateContinentsExercise(difficulty: ContinentsDifficulty): {
  dragItems: DragItem[];
  dropZones: DropZone[];
} {
  const allContinents = getContinentsList();
  const config = DIFFICULTY_CONFIG[difficulty];
  
  // Seleccionar continentes según dificultad
  let selectedContinents = allContinents;
  if (difficulty === 'easy') {
    // En fácil, usar solo 4 continentes
    selectedContinents = shuffleArray(allContinents).slice(0, 4);
  }
  
  // Crear drop zones para cada continente
  const dropZones: DropZone[] = selectedContinents.map(continent => ({
    id: `drop-${continent.id}`,
    type: 'continent',
    position: continent.position,
    size: continent.size,
    acceptsId: continent.id,
    isOccupied: false
  }));
  
  // Crear drag items
  const dragItems: DragItem[] = selectedContinents.map((continent, index) => ({
    id: continent.id,
    type: 'continent',
    data: continent,
    currentPosition: generateRandomPosition(),
    isPlaced: false
  }));
  
  return { dragItems: shuffleArray(dragItems), dropZones };
}

// Generar ejercicio de países
function generateCountriesExercise(difficulty: ContinentsDifficulty): {
  dragItems: DragItem[];
  dropZones: DropZone[];
} {
  const config = DIFFICULTY_CONFIG[difficulty];
  const dragItems: DragItem[] = [];
  const dropZones: DropZone[] = [];
  
  // Seleccionar continentes para el ejercicio
  let continentsToUse = getContinentsList();
  if (difficulty === 'easy') {
    // En fácil, usar solo 2 continentes
    continentsToUse = shuffleArray(continentsToUse).slice(0, 2);
  } else if (difficulty === 'medium') {
    // En medio, usar 3 continentes
    continentsToUse = shuffleArray(continentsToUse).slice(0, 3);
  }
  
  // Para cada continente, seleccionar algunos países
  continentsToUse.forEach(continent => {
    const countriesInContinent = getCountriesByContinent(continent.id);
    let selectedCountries = countriesInContinent;
    
    if (difficulty === 'easy') {
      selectedCountries = shuffleArray(countriesInContinent).slice(0, 2);
    } else if (difficulty === 'medium') {
      selectedCountries = shuffleArray(countriesInContinent).slice(0, 3);
    }
    
    // Crear drop zones para países dentro del continente
    selectedCountries.forEach(country => {
      // Calcular posición absoluta del país
      const absolutePosition = {
        x: continent.position.x + (country.position.x * continent.size.width / 100),
        y: continent.position.y + (country.position.y * continent.size.height / 100)
      };
      
      const absoluteSize = {
        width: country.size.width * continent.size.width / 100,
        height: country.size.height * continent.size.height / 100
      };
      
      dropZones.push({
        id: `drop-${country.id}`,
        type: 'country',
        position: absolutePosition,
        size: absoluteSize,
        acceptsId: country.id,
        isOccupied: false
      });
      
      // Crear drag item
      dragItems.push({
        id: country.id,
        type: 'country',
        data: country,
        currentPosition: generateRandomPosition(),
        isPlaced: false
      });
    });
  });
  
  return { dragItems: shuffleArray(dragItems), dropZones };
}

// Generar ejercicio de subdivisiones
function generateSubdivisionsExercise(
  countryId: string, 
  difficulty: ContinentsDifficulty
): {
  dragItems: DragItem[];
  dropZones: DropZone[];
} {
  const country = COUNTRIES[countryId];
  if (!country || !country.subdivisions) {
    throw new Error(`País ${countryId} no tiene subdivisiones disponibles`);
  }
  
  const continent = CONTINENTS[country.continentId];
  const subdivisions = getSubdivisionsByCountry(countryId);
  const config = DIFFICULTY_CONFIG[difficulty];
  
  // Seleccionar subdivisiones según dificultad
  let selectedSubdivisions = subdivisions;
  if (difficulty === 'easy') {
    selectedSubdivisions = shuffleArray(subdivisions).slice(0, Math.min(3, subdivisions.length));
  } else if (difficulty === 'medium') {
    selectedSubdivisions = shuffleArray(subdivisions).slice(0, Math.min(5, subdivisions.length));
  }
  
  // Calcular posición base del país en coordenadas absolutas
  const countryAbsolutePosition = {
    x: continent.position.x + (country.position.x * continent.size.width / 100),
    y: continent.position.y + (country.position.y * continent.size.height / 100)
  };
  
  const countryAbsoluteSize = {
    width: country.size.width * continent.size.width / 100,
    height: country.size.height * continent.size.height / 100
  };
  
  // Crear drop zones y drag items
  const dropZones: DropZone[] = [];
  const dragItems: DragItem[] = [];
  
  selectedSubdivisions.forEach(subdivision => {
    // Calcular posición absoluta de la subdivisión
    const absolutePosition = {
      x: countryAbsolutePosition.x + (subdivision.position.x * countryAbsoluteSize.width / 100),
      y: countryAbsolutePosition.y + (subdivision.position.y * countryAbsoluteSize.height / 100)
    };
    
    const absoluteSize = {
      width: subdivision.size.width * countryAbsoluteSize.width / 100,
      height: subdivision.size.height * countryAbsoluteSize.height / 100
    };
    
    dropZones.push({
      id: `drop-${subdivision.id}`,
      type: 'subdivision',
      position: absolutePosition,
      size: absoluteSize,
      acceptsId: subdivision.id,
      isOccupied: false
    });
    
    dragItems.push({
      id: subdivision.id,
      type: 'subdivision',
      data: subdivision,
      currentPosition: generateRandomPosition(),
      isPlaced: false
    });
  });
  
  return { dragItems: shuffleArray(dragItems), dropZones };
}

// Función principal para generar un nuevo juego
export function generateGame(config: GameConfig): GameState {
  let dragItems: DragItem[] = [];
  let dropZones: DropZone[] = [];
  
  // Generar ejercicio según el modo
  switch (config.mode) {
    case 'continents':
      ({ dragItems, dropZones } = generateContinentsExercise(config.difficulty));
      break;
      
    case 'countries':
      ({ dragItems, dropZones } = generateCountriesExercise(config.difficulty));
      break;
      
    case 'subdivisions':
      if (!config.selectedCountry) {
        throw new Error('Debe seleccionar un país para el modo subdivisiones');
      }
      ({ dragItems, dropZones } = generateSubdivisionsExercise(
        config.selectedCountry,
        config.difficulty
      ));
      break;
  }
  
  // Crear estado inicial del juego
  const gameState: GameState = {
    id: Date.now().toString(),
    config,
    dragItems,
    dropZones,
    startTime: Date.now(),
    pausedTime: 0,
    isPaused: false,
    attempts: 0,
    correctPlacements: 0,
    hintsUsed: 0,
    completed: false,
    score: 0
  };
  
  return gameState;
}

// Validar si un item está en la zona correcta
export function validatePlacement(
  itemId: string,
  dropZoneId: string,
  gameState: GameState
): boolean {
  const dropZone = gameState.dropZones.find(zone => zone.id === dropZoneId);
  if (!dropZone) return false;
  
  return dropZone.acceptsId === itemId;
}

// Calcular si un item está cerca de su zona correcta (para hints)
export function getDistanceToCorrectZone(
  item: DragItem,
  gameState: GameState
): number {
  const correctZone = gameState.dropZones.find(zone => zone.acceptsId === item.id);
  if (!correctZone || !item.currentPosition) return Infinity;
  
  // Calcular distancia euclidiana
  const dx = (item.currentPosition.x - correctZone.position.x);
  const dy = (item.currentPosition.y - correctZone.position.y);
  return Math.sqrt(dx * dx + dy * dy);
}

// Obtener una pista para el jugador
export function getHint(gameState: GameState): {
  itemId: string;
  targetZoneId: string;
  message: string;
} | null {
  // Buscar items no colocados
  const unplacedItems = gameState.dragItems.filter(item => !item.isPlaced);
  if (unplacedItems.length === 0) return null;
  
  // Encontrar el item más cercano a su posición correcta
  let closestItem = unplacedItems[0];
  let minDistance = getDistanceToCorrectZone(closestItem, gameState);
  
  unplacedItems.forEach(item => {
    const distance = getDistanceToCorrectZone(item, gameState);
    if (distance < minDistance) {
      minDistance = distance;
      closestItem = item;
    }
  });
  
  const targetZone = gameState.dropZones.find(zone => zone.acceptsId === closestItem.id);
  if (!targetZone) return null;
  
  // Generar mensaje según el tipo
  let message = '';
  switch (closestItem.type) {
    case 'continent':
      message = `${closestItem.data.name} está ${minDistance < 20 ? 'cerca' : 'lejos'} de su posición`;
      break;
    case 'country':
      const country = closestItem.data as any;
      message = `${country.name} pertenece a ${CONTINENTS[country.continentId].name}`;
      break;
    case 'subdivision':
      const subdivision = closestItem.data as any;
      message = `${subdivision.name} está en ${COUNTRIES[subdivision.countryId].name}`;
      break;
  }
  
  return {
    itemId: closestItem.id,
    targetZoneId: targetZone.id,
    message
  };
}

// Calcular puntuación
export function calculateScore(gameState: GameState): number {
  const baseScore = gameState.correctPlacements * 100;
  const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - gameState.startTime) / 1000));
  const accuracyBonus = Math.max(0, 100 - (gameState.attempts - gameState.correctPlacements) * 10);
  const hintPenalty = gameState.hintsUsed * 20;
  
  return Math.max(0, baseScore + timeBonus + accuracyBonus - hintPenalty);
}

// Obtener países disponibles para modo subdivisiones
export function getAvailableCountriesForSubdivisions(): Country[] {
  return COUNTRIES_WITH_SUBDIVISIONS.map(id => COUNTRIES[id]).filter(Boolean);
}