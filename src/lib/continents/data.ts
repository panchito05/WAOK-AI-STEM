import { Continent, Country, Subdivision, Animal } from './types';

// Continentes con posiciones relativas en un mapa mundial (0-100%)
export const CONTINENTS: Record<string, Continent> = {
  'north-america': {
    id: 'north-america',
    name: 'América del Norte',
    nameEn: 'North America',
    position: { x: 20, y: 25 },
    size: { width: 25, height: 30 },
    color: '#FF6B6B',
    countries: ['usa', 'canada', 'mexico', 'guatemala', 'cuba'],
    animalId: 'bald-eagle',
    description: 'Tercer continente más grande del mundo'
  },
  'south-america': {
    id: 'south-america',
    name: 'América del Sur',
    nameEn: 'South America',
    position: { x: 30, y: 65 },
    size: { width: 15, height: 25 },
    color: '#4ECDC4',
    countries: ['brazil', 'argentina', 'peru', 'colombia', 'chile'],
    animalId: 'jaguar',
    description: 'Hogar del Amazonas, el río más largo del mundo'
  },
  'europe': {
    id: 'europe',
    name: 'Europa',
    nameEn: 'Europe',
    position: { x: 50, y: 30 },
    size: { width: 15, height: 20 },
    color: '#6C5CE7',
    countries: ['spain', 'france', 'germany', 'italy', 'uk'],
    animalId: 'brown-bear',
    description: 'Cuna de la civilización occidental'
  },
  'africa': {
    id: 'africa',
    name: 'África',
    nameEn: 'Africa',
    position: { x: 50, y: 55 },
    size: { width: 20, height: 30 },
    color: '#FFE66D',
    countries: ['egypt', 'south-africa', 'kenya', 'nigeria', 'morocco'],
    animalId: 'lion',
    description: 'Segundo continente más grande y poblado'
  },
  'asia': {
    id: 'asia',
    name: 'Asia',
    nameEn: 'Asia',
    position: { x: 70, y: 35 },
    size: { width: 25, height: 35 },
    color: '#95E1D3',
    countries: ['china', 'india', 'japan', 'russia', 'indonesia'],
    animalId: 'panda',
    description: 'El continente más grande y poblado del mundo'
  },
  'oceania': {
    id: 'oceania',
    name: 'Oceanía',
    nameEn: 'Oceania',
    position: { x: 80, y: 75 },
    size: { width: 15, height: 15 },
    color: '#FFA502',
    countries: ['australia', 'new-zealand', 'fiji', 'papua-new-guinea'],
    animalId: 'kangaroo',
    description: 'El continente más pequeño, formado por miles de islas'
  }
};

// Países principales con sus datos
export const COUNTRIES: Record<string, Country> = {
  // América del Norte
  'usa': {
    id: 'usa',
    name: 'Estados Unidos',
    nameEn: 'United States',
    continentId: 'north-america',
    capital: 'Washington D.C.',
    capitalEn: 'Washington D.C.',
    population: 331000000,
    flagUrl: '🇺🇸',
    position: { x: 30, y: 40 },
    size: { width: 40, height: 30 },
    subdivisions: ['california', 'texas', 'florida', 'new-york', 'illinois'],
    animalId: 'bald-eagle',
    description: 'País con 50 estados',
    curiosities: ['Tiene el Gran Cañón', 'Inventó el avión', 'Tiene 62 parques nacionales']
  },
  'canada': {
    id: 'canada',
    name: 'Canadá',
    nameEn: 'Canada',
    continentId: 'north-america',
    capital: 'Ottawa',
    capitalEn: 'Ottawa',
    population: 38000000,
    flagUrl: '🇨🇦',
    position: { x: 30, y: 20 },
    size: { width: 45, height: 25 },
    subdivisions: ['ontario', 'quebec', 'british-columbia', 'alberta'],
    animalId: 'beaver',
    description: 'Segundo país más grande del mundo',
    curiosities: ['Tiene dos idiomas oficiales', 'Produce el 71% del jarabe de arce mundial']
  },
  'mexico': {
    id: 'mexico',
    name: 'México',
    nameEn: 'Mexico',
    continentId: 'north-america',
    capital: 'Ciudad de México',
    capitalEn: 'Mexico City',
    population: 128000000,
    flagUrl: '🇲🇽',
    position: { x: 25, y: 60 },
    size: { width: 25, height: 20 },
    subdivisions: ['jalisco', 'nuevo-leon', 'puebla', 'yucatan'],
    animalId: 'golden-eagle',
    description: 'Cuna de la civilización azteca',
    curiosities: ['Inventó el chocolate', 'Tiene 35 sitios UNESCO', 'La mariposa monarca migra aquí']
  },
  
  // América del Sur
  'brazil': {
    id: 'brazil',
    name: 'Brasil',
    nameEn: 'Brazil',
    continentId: 'south-america',
    capital: 'Brasilia',
    capitalEn: 'Brasilia',
    population: 212000000,
    flagUrl: '🇧🇷',
    position: { x: 50, y: 40 },
    size: { width: 45, height: 50 },
    subdivisions: ['sao-paulo', 'rio-de-janeiro', 'minas-gerais', 'bahia'],
    animalId: 'toucan',
    description: 'País más grande de Sudamérica',
    curiosities: ['Tiene el Amazonas', 'Habla portugués', 'Famoso por el carnaval']
  },
  'argentina': {
    id: 'argentina',
    name: 'Argentina',
    nameEn: 'Argentina',
    continentId: 'south-america',
    capital: 'Buenos Aires',
    capitalEn: 'Buenos Aires',
    population: 45000000,
    flagUrl: '🇦🇷',
    position: { x: 35, y: 70 },
    size: { width: 25, height: 40 },
    animalId: 'condor',
    description: 'Tierra del tango y el fútbol',
    curiosities: ['Tiene el pico más alto de América', 'Inventó el bolígrafo']
  },
  
  // Europa
  'spain': {
    id: 'spain',
    name: 'España',
    nameEn: 'Spain',
    continentId: 'europe',
    capital: 'Madrid',
    capitalEn: 'Madrid',
    population: 47000000,
    flagUrl: '🇪🇸',
    position: { x: 20, y: 60 },
    size: { width: 15, height: 15 },
    animalId: 'iberian-lynx',
    description: 'País de flamenco y paella',
    curiosities: ['Tiene 47 sitios UNESCO', 'Inventó la fregona', 'Segundo país con más bares']
  },
  'france': {
    id: 'france',
    name: 'Francia',
    nameEn: 'France',
    continentId: 'europe',
    capital: 'París',
    capitalEn: 'Paris',
    population: 67000000,
    flagUrl: '🇫🇷',
    position: { x: 35, y: 50 },
    size: { width: 15, height: 20 },
    animalId: 'rooster',
    description: 'País de la Torre Eiffel',
    curiosities: ['Más visitado del mundo', 'Inventó el cine', 'Tiene 400 tipos de queso']
  },
  
  // África
  'egypt': {
    id: 'egypt',
    name: 'Egipto',
    nameEn: 'Egypt',
    continentId: 'africa',
    capital: 'El Cairo',
    capitalEn: 'Cairo',
    population: 102000000,
    flagUrl: '🇪🇬',
    position: { x: 60, y: 25 },
    size: { width: 15, height: 20 },
    animalId: 'camel',
    description: 'Tierra de faraones y pirámides',
    curiosities: ['Tiene las pirámides de Giza', 'El río Nilo es su vida', 'Inventó el papel']
  },
  'south-africa': {
    id: 'south-africa',
    name: 'Sudáfrica',
    nameEn: 'South Africa',
    continentId: 'africa',
    capital: 'Pretoria',
    capitalEn: 'Pretoria',
    population: 59000000,
    flagUrl: '🇿🇦',
    position: { x: 55, y: 85 },
    size: { width: 20, height: 15 },
    animalId: 'african-elephant',
    description: 'Nación arcoíris',
    curiosities: ['Tiene 3 capitales', 'Hogar del Gran Cinco', '11 idiomas oficiales']
  },
  
  // Asia
  'china': {
    id: 'china',
    name: 'China',
    nameEn: 'China',
    continentId: 'asia',
    capital: 'Pekín',
    capitalEn: 'Beijing',
    population: 1440000000,
    flagUrl: '🇨🇳',
    position: { x: 70, y: 40 },
    size: { width: 30, height: 30 },
    subdivisions: ['guangdong', 'shandong', 'sichuan', 'henan'],
    animalId: 'giant-panda',
    description: 'País más poblado del mundo',
    curiosities: ['Construyó la Gran Muralla', 'Inventó el papel', 'Tiene 56 grupos étnicos']
  },
  'india': {
    id: 'india',
    name: 'India',
    nameEn: 'India',
    continentId: 'asia',
    capital: 'Nueva Delhi',
    capitalEn: 'New Delhi',
    population: 1380000000,
    flagUrl: '🇮🇳',
    position: { x: 60, y: 55 },
    size: { width: 20, height: 25 },
    subdivisions: ['maharashtra', 'uttar-pradesh', 'tamil-nadu', 'rajasthan'],
    animalId: 'bengal-tiger',
    description: 'Tierra de especias y colores',
    curiosities: ['Inventó el ajedrez', 'Tiene 22 idiomas oficiales', 'Produce más películas que Hollywood']
  },
  'japan': {
    id: 'japan',
    name: 'Japón',
    nameEn: 'Japan',
    continentId: 'asia',
    capital: 'Tokio',
    capitalEn: 'Tokyo',
    population: 126000000,
    flagUrl: '🇯🇵',
    position: { x: 90, y: 40 },
    size: { width: 8, height: 20 },
    animalId: 'japanese-crane',
    description: 'País del sol naciente',
    curiosities: ['Tiene más de 6,800 islas', 'Inventó el karaoke', 'Tiene trenes bala']
  },
  
  // Oceanía
  'australia': {
    id: 'australia',
    name: 'Australia',
    nameEn: 'Australia',
    continentId: 'oceania',
    capital: 'Canberra',
    capitalEn: 'Canberra',
    population: 25000000,
    flagUrl: '🇦🇺',
    position: { x: 50, y: 50 },
    size: { width: 40, height: 35 },
    subdivisions: ['new-south-wales', 'victoria', 'queensland', 'western-australia'],
    animalId: 'kangaroo',
    description: 'País continente',
    curiosities: ['Único país que es continente', 'Tiene la Gran Barrera de Coral', 'Hogar de animales únicos']
  }
};

// Estados/Provincias de países grandes
export const SUBDIVISIONS: Record<string, Subdivision> = {
  // Estados de USA
  'california': {
    id: 'california',
    name: 'California',
    nameEn: 'California',
    countryId: 'usa',
    capital: 'Sacramento',
    capitalEn: 'Sacramento',
    flagUrl: '🐻',
    position: { x: 10, y: 40 },
    size: { width: 8, height: 20 },
    animalId: 'california-bear',
    description: 'El Estado Dorado'
  },
  'texas': {
    id: 'texas',
    name: 'Texas',
    nameEn: 'Texas',
    countryId: 'usa',
    capital: 'Austin',
    capitalEn: 'Austin',
    flagUrl: '⭐',
    position: { x: 45, y: 70 },
    size: { width: 15, height: 15 },
    animalId: 'armadillo',
    description: 'El Estado de la Estrella Solitaria'
  },
  'florida': {
    id: 'florida',
    name: 'Florida',
    nameEn: 'Florida',
    countryId: 'usa',
    capital: 'Tallahassee',
    capitalEn: 'Tallahassee',
    flagUrl: '🌴',
    position: { x: 75, y: 80 },
    size: { width: 10, height: 8 },
    animalId: 'manatee',
    description: 'El Estado del Sol'
  },
  'new-york': {
    id: 'new-york',
    name: 'Nueva York',
    nameEn: 'New York',
    countryId: 'usa',
    capital: 'Albany',
    capitalEn: 'Albany',
    flagUrl: '🗽',
    position: { x: 80, y: 35 },
    size: { width: 8, height: 10 },
    animalId: 'beaver',
    description: 'El Estado Imperio'
  },
  
  // Estados de Brasil
  'sao-paulo': {
    id: 'sao-paulo',
    name: 'São Paulo',
    nameEn: 'São Paulo',
    countryId: 'brazil',
    capital: 'São Paulo',
    capitalEn: 'São Paulo',
    position: { x: 45, y: 60 },
    size: { width: 15, height: 12 },
    description: 'Estado más poblado de Brasil'
  },
  'rio-de-janeiro': {
    id: 'rio-de-janeiro',
    name: 'Río de Janeiro',
    nameEn: 'Rio de Janeiro',
    countryId: 'brazil',
    capital: 'Río de Janeiro',
    capitalEn: 'Rio de Janeiro',
    position: { x: 50, y: 65 },
    size: { width: 10, height: 8 },
    description: 'Ciudad Maravillosa'
  },
  
  // Provincias de Canadá
  'ontario': {
    id: 'ontario',
    name: 'Ontario',
    nameEn: 'Ontario',
    countryId: 'canada',
    capital: 'Toronto',
    capitalEn: 'Toronto',
    position: { x: 60, y: 70 },
    size: { width: 20, height: 25 },
    description: 'Provincia más poblada de Canadá'
  },
  'quebec': {
    id: 'quebec',
    name: 'Quebec',
    nameEn: 'Quebec',
    countryId: 'canada',
    capital: 'Quebec',
    capitalEn: 'Quebec City',
    position: { x: 75, y: 65 },
    size: { width: 25, height: 30 },
    description: 'Provincia francófona de Canadá'
  }
};

// Animales representativos
export const ANIMALS: Record<string, Animal> = {
  // Continentes
  'bald-eagle': {
    id: 'bald-eagle',
    name: 'Águila Calva',
    nameEn: 'Bald Eagle',
    imageUrl: '🦅',
    habitat: 'Bosques y costas de Norteamérica',
    description: 'Símbolo nacional de Estados Unidos',
    regionType: 'continent',
    regionId: 'north-america'
  },
  'jaguar': {
    id: 'jaguar',
    name: 'Jaguar',
    nameEn: 'Jaguar',
    imageUrl: '🐆',
    habitat: 'Selvas de América del Sur',
    description: 'El felino más grande de América',
    regionType: 'continent',
    regionId: 'south-america'
  },
  'lion': {
    id: 'lion',
    name: 'León',
    nameEn: 'Lion',
    imageUrl: '🦁',
    habitat: 'Sabanas africanas',
    description: 'El rey de la selva',
    regionType: 'continent',
    regionId: 'africa'
  },
  'panda': {
    id: 'panda',
    name: 'Panda Gigante',
    nameEn: 'Giant Panda',
    imageUrl: '🐼',
    habitat: 'Bosques de bambú en China',
    description: 'Símbolo de conservación mundial',
    regionType: 'continent',
    regionId: 'asia'
  },
  'kangaroo': {
    id: 'kangaroo',
    name: 'Canguro',
    nameEn: 'Kangaroo',
    imageUrl: '🦘',
    habitat: 'Llanuras de Australia',
    description: 'Marsupial saltador icónico',
    regionType: 'continent',
    regionId: 'oceania'
  },
  'brown-bear': {
    id: 'brown-bear',
    name: 'Oso Pardo',
    nameEn: 'Brown Bear',
    imageUrl: '🐻',
    habitat: 'Bosques de Europa',
    description: 'Gran mamífero europeo',
    regionType: 'continent',
    regionId: 'europe'
  },
  
  // Países
  'toucan': {
    id: 'toucan',
    name: 'Tucán',
    nameEn: 'Toucan',
    imageUrl: '🦜',
    habitat: 'Selvas tropicales de Brasil',
    description: 'Ave colorida del Amazonas',
    regionType: 'country',
    regionId: 'brazil'
  },
  'beaver': {
    id: 'beaver',
    name: 'Castor',
    nameEn: 'Beaver',
    imageUrl: '🦫',
    habitat: 'Ríos y lagos de Canadá',
    description: 'Ingeniero de la naturaleza',
    regionType: 'country',
    regionId: 'canada'
  },
  'golden-eagle': {
    id: 'golden-eagle',
    name: 'Águila Real',
    nameEn: 'Golden Eagle',
    imageUrl: '🦅',
    habitat: 'Montañas de México',
    description: 'Ave del escudo nacional mexicano',
    regionType: 'country',
    regionId: 'mexico'
  },
  'giant-panda': {
    id: 'giant-panda',
    name: 'Panda Gigante',
    nameEn: 'Giant Panda',
    imageUrl: '🐼',
    habitat: 'Bosques de bambú en China',
    description: 'Tesoro nacional de China',
    regionType: 'country',
    regionId: 'china'
  },
  'bengal-tiger': {
    id: 'bengal-tiger',
    name: 'Tigre de Bengala',
    nameEn: 'Bengal Tiger',
    imageUrl: '🐅',
    habitat: 'Selvas de India',
    description: 'Animal nacional de India',
    regionType: 'country',
    regionId: 'india'
  },
  
  // Estados
  'california-bear': {
    id: 'california-bear',
    name: 'Oso Grizzly de California',
    nameEn: 'California Grizzly Bear',
    imageUrl: '🐻',
    habitat: 'Montañas de California',
    description: 'Símbolo del estado de California',
    regionType: 'subdivision',
    regionId: 'california'
  },
  'armadillo': {
    id: 'armadillo',
    name: 'Armadillo',
    nameEn: 'Armadillo',
    imageUrl: '🦔',
    habitat: 'Desiertos de Texas',
    description: 'Mamífero acorazado de Texas',
    regionType: 'subdivision',
    regionId: 'texas'
  },
  'manatee': {
    id: 'manatee',
    name: 'Manatí',
    nameEn: 'Manatee',
    imageUrl: '🦭',
    habitat: 'Costas de Florida',
    description: 'Gentil gigante marino',
    regionType: 'subdivision',
    regionId: 'florida'
  }
};

// Export arrays as expected by data3d.ts
export const continents = Object.values(CONTINENTS);
export const countries = Object.values(COUNTRIES);
export const subdivisions = Object.values(SUBDIVISIONS);
export const animals = Object.values(ANIMALS);

// Función helper para obtener elementos por tipo
export function getContinentsList(): Continent[] {
  return Object.values(CONTINENTS);
}

export function getCountriesByContinent(continentId: string): Country[] {
  return Object.values(COUNTRIES).filter(country => country.continentId === continentId);
}

export function getSubdivisionsByCountry(countryId: string): Subdivision[] {
  return Object.values(SUBDIVISIONS).filter(sub => sub.countryId === countryId);
}

export function getAnimalsByRegion(regionId: string): Animal[] {
  return Object.values(ANIMALS).filter(animal => animal.regionId === regionId);
}

// Países con subdivisiones disponibles
export const COUNTRIES_WITH_SUBDIVISIONS = ['usa', 'canada', 'brazil', 'china', 'india', 'australia'];