import { SphericalCoordinate, Geometry3D, Continent3D, Country3D } from './types3d';
import { continents, countries } from './data';

// Función helper para crear geometría 3D
function createGeometry3D(vertices: SphericalCoordinate[]): Geometry3D {
  const center = calculateCenter(vertices);
  const bounds = calculateBounds(vertices);
  const area = calculateApproximateArea(vertices);
  
  return {
    vertices,
    center,
    bounds,
    area
  };
}

function calculateCenter(vertices: SphericalCoordinate[]): SphericalCoordinate {
  let sumLat = 0;
  let sumLng = 0;
  
  vertices.forEach(v => {
    sumLat += v.lat;
    sumLng += v.lng;
  });
  
  return {
    lat: sumLat / vertices.length,
    lng: sumLng / vertices.length
  };
}

function calculateBounds(vertices: SphericalCoordinate[]): { north: number; south: number; east: number; west: number } {
  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;
  
  vertices.forEach(v => {
    north = Math.max(north, v.lat);
    south = Math.min(south, v.lat);
    east = Math.max(east, v.lng);
    west = Math.min(west, v.lng);
  });
  
  return { north, south, east, west };
}

function calculateApproximateArea(vertices: SphericalCoordinate[]): number {
  // Aproximación simple del área usando el método del polígono esférico
  // Para fines educativos, no necesita ser exacto
  const bounds = calculateBounds(vertices);
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;
  return latRange * lngRange * 100; // Factor de escala arbitrario
}

// Datos geográficos simplificados pero reconocibles para cada continente
export const continentGeometries: Record<string, SphericalCoordinate[]> = {
  'north-america': [
    { lat: 71, lng: -168 },  // Alaska
    { lat: 71, lng: -130 },
    { lat: 60, lng: -130 },
    { lat: 49, lng: -123 },  // Vancouver
    { lat: 32, lng: -117 },  // San Diego
    { lat: 25, lng: -97 },   // México sur
    { lat: 15, lng: -91 },   // Guatemala
    { lat: 9, lng: -79 },    // Panamá
    { lat: 9, lng: -75 },
    { lat: 18, lng: -65 },   // Caribe
    { lat: 25, lng: -80 },   // Florida
    { lat: 45, lng: -67 },   // Maine
    { lat: 47, lng: -52 },   // Newfoundland
    { lat: 58, lng: -94 },   // Hudson Bay
    { lat: 71, lng: -168 }   // Cierre
  ],
  
  'south-america': [
    { lat: 12, lng: -81 },   // Venezuela norte
    { lat: 10, lng: -75 },
    { lat: 5, lng: -78 },    // Colombia
    { lat: 0, lng: -80 },    // Ecuador
    { lat: -5, lng: -81 },   // Perú norte
    { lat: -18, lng: -70 },  // Chile norte
    { lat: -33, lng: -71 },  // Santiago
    { lat: -55, lng: -68 },  // Tierra del Fuego
    { lat: -55, lng: -65 },
    { lat: -52, lng: -58 },  // Argentina sur
    { lat: -33, lng: -56 },  // Uruguay
    { lat: -23, lng: -43 },  // Río
    { lat: -5, lng: -35 },   // Brasil noreste
    { lat: 5, lng: -52 },    // Guyana
    { lat: 12, lng: -81 }    // Cierre
  ],
  
  'europe': [
    { lat: 71, lng: 25 },    // Noruega norte
    { lat: 70, lng: 30 },
    { lat: 60, lng: 30 },    // Finlandia
    { lat: 54, lng: 40 },    // Rusia oeste
    { lat: 45, lng: 40 },    // Mar Negro
    { lat: 36, lng: 28 },    // Turquía
    { lat: 36, lng: 23 },    // Grecia
    { lat: 37, lng: 15 },    // Sicilia
    { lat: 36, lng: -5 },    // Gibraltar
    { lat: 43, lng: -9 },    // España norte
    { lat: 50, lng: -5 },    // Inglaterra sur
    { lat: 59, lng: -3 },    // Escocia
    { lat: 64, lng: -22 },   // Islandia
    { lat: 71, lng: 25 }     // Cierre
  ],
  
  'africa': [
    { lat: 37, lng: 10 },    // Túnez
    { lat: 32, lng: 32 },    // Egipto
    { lat: 15, lng: 39 },    // Eritrea
    { lat: 12, lng: 51 },    // Somalia norte
    { lat: -4, lng: 40 },    // Kenia
    { lat: -26, lng: 33 },   // Mozambique
    { lat: -34, lng: 18 },   // Ciudad del Cabo
    { lat: -32, lng: 17 },
    { lat: -15, lng: 12 },   // Angola
    { lat: 0, lng: 9 },      // Gabón
    { lat: 5, lng: -8 },     // Liberia
    { lat: 15, lng: -17 },   // Senegal
    { lat: 32, lng: -5 },    // Marruecos
    { lat: 37, lng: 10 }     // Cierre
  ],
  
  'asia': [
    { lat: 77, lng: 105 },   // Siberia norte
    { lat: 73, lng: 140 },
    { lat: 60, lng: 170 },   // Kamchatka
    { lat: 35, lng: 140 },   // Japón
    { lat: 23, lng: 121 },   // Taiwán
    { lat: 10, lng: 107 },   // Vietnam
    { lat: 1, lng: 104 },    // Singapur
    { lat: -10, lng: 120 },  // Indonesia
    { lat: -8, lng: 140 },   // Papua
    { lat: 5, lng: 95 },     // Sumatra
    { lat: 8, lng: 77 },     // India sur
    { lat: 20, lng: 70 },    // India oeste
    { lat: 30, lng: 60 },    // Irán
    { lat: 40, lng: 45 },    // Cáucaso
    { lat: 55, lng: 40 },    // Rusia
    { lat: 70, lng: 60 },    // Siberia oeste
    { lat: 77, lng: 105 }    // Cierre
  ],
  
  'oceania': [
    { lat: -10, lng: 142 },  // Papua Nueva Guinea
    { lat: -20, lng: 145 },  // Queensland norte
    { lat: -28, lng: 153 },  // Brisbane
    { lat: -38, lng: 145 },  // Melbourne
    { lat: -43, lng: 147 },  // Tasmania
    { lat: -45, lng: 167 },  // Nueva Zelanda sur
    { lat: -41, lng: 174 },  // Wellington
    { lat: -35, lng: 173 },  // Auckland
    { lat: -20, lng: 165 },  // Nueva Caledonia
    { lat: -15, lng: 150 },
    { lat: -10, lng: 142 }   // Cierre
  ],
  
  'antarctica': [
    { lat: -60, lng: -180 }, // Círculo antártico
    { lat: -65, lng: -140 },
    { lat: -70, lng: -100 },
    { lat: -75, lng: -60 },
    { lat: -78, lng: -20 },
    { lat: -80, lng: 20 },
    { lat: -82, lng: 60 },
    { lat: -83, lng: 100 },
    { lat: -82, lng: 140 },
    { lat: -80, lng: 180 },
    { lat: -75, lng: 180 },
    { lat: -70, lng: 160 },
    { lat: -65, lng: 140 },
    { lat: -60, lng: 180 },
    { lat: -60, lng: -180 }  // Cierre
  ]
};

// Datos para algunos países principales (simplificados)
export const countryGeometries: Record<string, SphericalCoordinate[]> = {
  'usa': [
    { lat: 49, lng: -123 },  // Washington
    { lat: 49, lng: -95 },   // Minnesota
    { lat: 49, lng: -67 },   // Maine
    { lat: 45, lng: -67 },
    { lat: 25, lng: -80 },   // Florida
    { lat: 26, lng: -97 },   // Texas sur
    { lat: 32, lng: -117 },  // California
    { lat: 49, lng: -123 }   // Cierre
  ],
  
  'brazil': [
    { lat: 5, lng: -60 },    // Norte
    { lat: 5, lng: -35 },    // Noreste
    { lat: -5, lng: -35 },
    { lat: -10, lng: -38 },  // Bahía
    { lat: -23, lng: -43 },  // Río
    { lat: -33, lng: -53 },  // Sur
    { lat: -30, lng: -57 },
    { lat: -20, lng: -58 },  // Pantanal
    { lat: -10, lng: -65 },  // Acre
    { lat: 0, lng: -70 },    // Amazonas
    { lat: 5, lng: -60 }     // Cierre
  ],
  
  'china': [
    { lat: 53, lng: 123 },   // Noreste
    { lat: 40, lng: 120 },   // Beijing
    { lat: 30, lng: 122 },   // Shanghai
    { lat: 22, lng: 114 },   // Hong Kong
    { lat: 20, lng: 108 },   // Hainan
    { lat: 25, lng: 98 },    // Yunnan
    { lat: 30, lng: 80 },    // Tibet
    { lat: 40, lng: 75 },    // Xinjiang
    { lat: 45, lng: 85 },
    { lat: 50, lng: 90 },    // Mongolia Interior
    { lat: 53, lng: 123 }    // Cierre
  ],
  
  'australia': [
    { lat: -10, lng: 142 },  // Cabo York
    { lat: -20, lng: 145 },
    { lat: -25, lng: 153 },  // Brisbane
    { lat: -34, lng: 151 },  // Sydney
    { lat: -38, lng: 145 },  // Melbourne
    { lat: -35, lng: 136 },  // Adelaide
    { lat: -32, lng: 116 },  // Perth
    { lat: -20, lng: 114 },
    { lat: -12, lng: 130 },  // Darwin
    { lat: -10, lng: 142 }   // Cierre
  ]
};

// Convertir datos 2D existentes a 3D
export function convertTo3D(): { continents3D: Continent3D[], countries3D: Country3D[] } {
  const continents3D: Continent3D[] = continents.map(continent => {
    const geometry = continentGeometries[continent.id] || [];
    return {
      ...continent,
      geometry3D: createGeometry3D(geometry)
    };
  });
  
  const countries3D: Country3D[] = countries.map(country => {
    const geometry = countryGeometries[country.id] || [];
    // Si no hay geometría específica, usar un punto en el centro del continente
    if (geometry.length === 0) {
      const parentContinent = continents3D.find(c => c.id === country.continentId);
      if (parentContinent) {
        const center = parentContinent.geometry3D.center;
        geometry.push({
          lat: center.lat + (Math.random() - 0.5) * 10,
          lng: center.lng + (Math.random() - 0.5) * 10
        });
      }
    }
    
    return {
      ...country,
      geometry3D: createGeometry3D(geometry)
    };
  });
  
  return { continents3D, countries3D };
}