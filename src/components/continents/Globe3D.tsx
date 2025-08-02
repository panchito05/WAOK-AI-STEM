'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';

// Dynamic imports to avoid module-level loading
let Canvas: any = null;
let useFrame: any = null;
let useThree: any = null;
let OrbitControls: any = null;
let Sphere: any = null;
let Line: any = null;
let Text: any = null;
let THREE: any = null;

// Function to load Three.js components dynamically
async function loadThreeJSComponents() {
  if (typeof window !== 'undefined' && !Canvas) {
    try {
      const [fiber, drei, three] = await Promise.all([
        import('@react-three/fiber'),
        import('@react-three/drei'),
        import('three')
      ]);
      
      Canvas = fiber.Canvas;
      useFrame = fiber.useFrame;
      useThree = fiber.useThree;
      OrbitControls = drei.OrbitControls;
      Sphere = drei.Sphere;
      Line = drei.Line;
      Text = drei.Text;
      THREE = three;
      
      return true;
    } catch (error) {
      console.warn('Failed to load Three.js components:', error);
      return false;
    }
  }
  return !!Canvas;
}
import { 
  Globe3DState, 
  Continent3D, 
  Country3D,
  sphericalToCartesian,
  DEFAULT_GLOBE_CONFIG 
} from '@/lib/continents/types3d';
import { convertTo3D } from '@/lib/continents/data3d';
import GeographicLayers from './GeographicLayers';
import { Globe3DInteraction, useGlobe3DInteraction, TouchGestureHandler } from './Globe3DInteraction';

interface Globe3DProps {
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

// Componente para el océano
function Ocean({ radius }: { radius: number }) {
  if (!Sphere || !THREE) return null;
  
  return (
    <Sphere args={[radius * 0.99, 32, 32]}>
      <meshPhongMaterial 
        color={DEFAULT_GLOBE_CONFIG.oceanColor}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

// Componente para la atmósfera
function Atmosphere({ radius }: { radius: number }) {
  if (!Sphere || !THREE) return null;
  
  return (
    <Sphere args={[radius * 1.1, 32, 32]}>
      <meshPhongMaterial 
        color={DEFAULT_GLOBE_CONFIG.atmosphereColor}
        transparent
        opacity={DEFAULT_GLOBE_CONFIG.atmosphereOpacity}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

// Componente para renderizar un continente
function ContinentMesh({ 
  continent, 
  radius, 
  isHovered,
  isSelected,
  onClick 
}: { 
  continent: Continent3D;
  radius: number;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  if (!THREE) return null;

  // Convertir coordenadas esféricas a puntos 3D
  const points = continent.geometry3D.vertices.map(coord => 
    sphericalToCartesian(coord, radius)
  );

  // Crear geometría del continente
  const shape = new THREE.Shape();
  const uvPoints = continent.geometry3D.vertices.map(coord => {
    const phi = (90 - coord.lat) * (Math.PI / 180);
    const theta = (coord.lng + 180) * (Math.PI / 180);
    return new THREE.Vector2(theta / (2 * Math.PI), phi / Math.PI);
  });

  if (uvPoints.length > 0) {
    shape.moveTo(uvPoints[0].x, uvPoints[0].y);
    for (let i = 1; i < uvPoints.length; i++) {
      shape.lineTo(uvPoints[i].x, uvPoints[i].y);
    }
  }

  const geometry = new THREE.ShapeGeometry(shape);
  
  // Mapear a esfera
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const u = positions[i];
    const v = positions[i + 1];
    const phi = v * Math.PI;
    const theta = u * 2 * Math.PI;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
  }
  geometry.computeVertexNormals();

  const color = isSelected ? DEFAULT_GLOBE_CONFIG.selectedColor :
                isHovered || hovered ? DEFAULT_GLOBE_CONFIG.hoverColor :
                DEFAULT_GLOBE_CONFIG.continentColors[continent.id] || '#888888';

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhongMaterial color={color} />
    </mesh>
  );
}

// Componente para el contorno de un continente
function ContinentOutline({ continent, radius }: { continent: Continent3D; radius: number }) {
  if (!Line) return null;
  
  const points = continent.geometry3D.vertices.map(coord => 
    sphericalToCartesian(coord, radius * 1.001)
  );
  
  // Cerrar el contorno
  if (points.length > 0) {
    points.push(points[0]);
  }

  return (
    <Line
      points={points}
      color={DEFAULT_GLOBE_CONFIG.borderColor}
      lineWidth={2}
    />
  );
}

// Componente principal del globo
function GlobeContent({ 
  mode,
  onContinentClick,
  onCountryClick,
  onModeChange,
  selectedContinent,
  selectedCountry,
  showLabels = true,
  showBorders = true,
  autoRotate = true
}: Globe3DProps) {
  const { continents3D, countries3D } = convertTo3D();
  const globeRef = useRef<THREE.Group>(null);
  const radius = DEFAULT_GLOBE_CONFIG.radius;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const {
    cameraTarget,
    zoomLevel,
    selectedRegion,
    zoomToRegion,
    resetCamera,
    selectRegion
  } = useGlobe3DInteraction();

  // Auto-rotación usando useFrame si está disponible
  if (useFrame) {
    useFrame((state, delta) => {
      if (autoRotate && globeRef.current && !selectedRegion) {
        globeRef.current.rotation.y += delta * 0.1;
      }
    });
  }

  // Manejar click en items
  const handleItemClick = (id: string, type: 'continent' | 'country' | 'subdivision') => {
    if (type === 'continent') {
      const continent = continents3D.find(c => c.id === id);
      if (continent) {
        selectRegion(id, type);
        zoomToRegion(continent.geometry3D.center, type);
        onContinentClick?.(id);
        
        // Cambiar automáticamente a modo países
        if (mode === 'continents') {
          onModeChange?.('countries');
        }
      }
    } else if (type === 'country') {
      const country = countries3D.find(c => c.id === id);
      if (country) {
        selectRegion(id, type);
        zoomToRegion(country.geometry3D.center, type);
        onCountryClick?.(id);
        
        // Si el país tiene subdivisiones, cambiar a ese modo
        if (country.subdivisions && country.subdivisions.length > 0 && mode === 'countries') {
          onModeChange?.('subdivisions');
        }
      }
    }
  };

  // Manejar hover
  const handleItemHover = (id: string | null, type: 'continent' | 'country' | 'subdivision' | null) => {
    setHoveredItem(id);
  };

  return (
    <>
      <group ref={globeRef}>
        {/* Océano */}
        <Ocean radius={radius} />
        
        {/* Atmósfera */}
        <Atmosphere radius={radius} />
        
        {/* Capas geográficas */}
        <GeographicLayers
          layer={mode}
          continents={continents3D}
          countries={countries3D}
          subdivisions={[]} // Por ahora vacío
          selectedContinent={selectedContinent}
          selectedCountry={selectedCountry}
          hoveredItem={hoveredItem}
          radius={radius}
          showLabels={showLabels}
          showBorders={showBorders}
          onItemClick={handleItemClick}
          onItemHover={handleItemHover}
        />
        
        {/* Iluminación */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1} />
      </group>
      
      {/* Sistema de interacción */}
      <Globe3DInteraction
        targetPosition={cameraTarget}
        targetZoom={zoomLevel}
        onAnimationComplete={() => {
          console.log('Animation completed');
        }}
      />
      
      {/* Controles táctiles */}
      <TouchGestureHandler
        onRotate={(deltaX, deltaY) => {
          if (globeRef.current) {
            globeRef.current.rotation.y += deltaX * 0.01;
            globeRef.current.rotation.x = Math.max(
              -Math.PI / 2,
              Math.min(Math.PI / 2, globeRef.current.rotation.x + deltaY * 0.01)
            );
          }
        }}
        onZoom={(delta) => {
          // Zoom será manejado por OrbitControls
        }}
      />
      
      {/* Botón de reset */}
      {selectedRegion && Text && (
        <Text
          position={[0, radius * 1.5, 0]}
          fontSize={10}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          onClick={() => {
            resetCamera();
            if (mode !== 'continents') {
              onModeChange?.('continents');
            }
          }}
        >
          ← Volver
        </Text>
      )}
    </>
  );
}

// Simple 2D fallback component when 3D fails
function Globe2DFallback(props: Globe3DProps) {
  const { continents3D } = convertTo3D();
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Explorador de Continentes</h2>
          <p className="text-blue-600 mb-6">Haz clic en un continente para explorar</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl">
          {continents3D.map((continent) => (
            <button
              key={continent.id}
              onClick={() => props.onContinentClick?.(continent.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                props.selectedContinent === continent.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-2">
                {continent.id === 'north-america' ? '🌎' :
                 continent.id === 'south-america' ? '🌎' :
                 continent.id === 'europe' ? '🌍' :
                 continent.id === 'africa' ? '🌍' :
                 continent.id === 'asia' ? '🌏' :
                 continent.id === 'oceania' ? '🌏' : '🌍'}
              </div>
              <div className="text-sm font-semibold text-gray-800">{continent.name}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          💡 Modo 2D activado - El globo 3D no está disponible en este momento
        </div>
      </div>
    </div>
  );
}

// Enhanced 3D Globe component with dynamic loading
function Enhanced3DGlobe(props: Globe3DProps) {
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);

  useEffect(() => {
    loadThreeJSComponents()
      .then((success) => {
        if (success) {
          setComponentsLoaded(true);
        } else {
          setLoadingFailed(true);
        }
      })
      .catch(() => {
        setLoadingFailed(true);
      });
  }, []);

  // Show fallback if loading failed
  if (loadingFailed) {
    return <Globe2DFallback {...props} />;
  }

  // Show loading if components aren't ready
  if (!componentsLoaded || !Canvas || !THREE) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando globo 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [0, 0, 300], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          <GlobeContent {...props} />
          <OrbitControls 
            enablePan={false}
            minDistance={150}
            maxDistance={500}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function Globe3D(props: Globe3DProps) {
  return <Enhanced3DGlobe {...props} />;
}