'use client';

import React from 'react';
import { 
  Continent3D, 
  Country3D,
  Subdivision3D,
  sphericalToCartesian,
  DEFAULT_GLOBE_CONFIG 
} from '@/lib/continents/types3d';

// Dynamic imports to avoid module-level loading
let THREE: any = null;
let Line: any = null;
let Text: any = null;

async function loadThreeComponents() {
  if (typeof window !== 'undefined' && !THREE) {
    try {
      THREE = await import('three');
      const drei = await import('@react-three/drei');
      Line = drei.Line;
      Text = drei.Text;
    } catch (error) {
      console.warn('Failed to load Three.js components:', error);
    }
  }
}

interface GeographicLayersProps {
  layer: 'continents' | 'countries' | 'subdivisions';
  continents: Continent3D[];
  countries: Country3D[];
  subdivisions: Subdivision3D[];
  selectedContinent?: string;
  selectedCountry?: string;
  hoveredItem?: string;
  radius: number;
  showLabels: boolean;
  showBorders: boolean;
  onItemClick: (id: string, type: 'continent' | 'country' | 'subdivision') => void;
  onItemHover: (id: string | null, type: 'continent' | 'country' | 'subdivision' | null) => void;
}

// Componente para renderizar una región geográfica genérica
function GeographicRegion({ 
  id,
  type,
  vertices,
  center,
  label,
  color,
  radius,
  isHovered,
  isSelected,
  showLabel,
  onClick,
  onHover
}: {
  id: string;
  type: 'continent' | 'country' | 'subdivision';
  vertices: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  label: string;
  color: string;
  radius: number;
  isHovered: boolean;
  isSelected: boolean;
  showLabel: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const [componentsLoaded, setComponentsLoaded] = React.useState(false);

  React.useEffect(() => {
    loadThreeComponents().then(() => {
      setComponentsLoaded(!!THREE && !!Text);
    });
  }, []);

  if (!componentsLoaded || !THREE) {
    return null; // Return nothing if components aren't loaded
  }

  const points = vertices.map(coord => sphericalToCartesian(coord, radius));
  
  // Crear la forma
  const shape = React.useMemo(() => {
    if (!THREE) return null;
    const s = new THREE.Shape();
    
    if (points.length > 0) {
      s.moveTo(points[0].x, points[0].z);
      for (let i = 1; i < points.length; i++) {
        s.lineTo(points[i].x, points[i].z);
      }
      s.closePath();
    }
    
    return s;
  }, [points]);

  // Crear geometría extruida
  const geometry = React.useMemo(() => {
    if (!THREE || !shape) return null;
    
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 0.5,
      bevelSegments: 1
    });
    
    // Mapear a la superficie de la esfera
    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Convertir a coordenadas esféricas y ajustar radio
      const length = Math.sqrt(x * x + z * z);
      const theta = Math.atan2(z, x);
      const r = radius + y * 0.1; // Pequeña extrusión sobre la superficie
      
      positions[i] = r * Math.cos(theta);
      positions[i + 1] = 0; // Temporalmente plano
      positions[i + 2] = r * Math.sin(theta);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [shape, radius]);

  if (!geometry) return null;

  const finalColor = isSelected ? DEFAULT_GLOBE_CONFIG.selectedColor :
                    isHovered ? DEFAULT_GLOBE_CONFIG.hoverColor :
                    color;

  const labelPosition = sphericalToCartesian(center, radius * 1.1);

  return (
    <>
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={() => onHover(false)}
      >
        <meshPhongMaterial 
          color={finalColor}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
      </mesh>
      
      {showLabel && Text && (
        <Text
          position={[labelPosition.x, labelPosition.y, labelPosition.z]}
          fontSize={type === 'continent' ? 8 : 6}
          color={isSelected ? '#FFFFFF' : '#333333'}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </>
  );
}

// Componente para renderizar bordes
function GeographicBorder({ vertices, radius }: { vertices: { lat: number; lng: number }[]; radius: number }) {
  const [componentsLoaded, setComponentsLoaded] = React.useState(false);

  React.useEffect(() => {
    loadThreeComponents().then(() => {
      setComponentsLoaded(!!Line);
    });
  }, []);

  if (!componentsLoaded || !Line) {
    return null; // Return nothing if components aren't loaded
  }

  const points = vertices.map(coord => sphericalToCartesian(coord, radius * 1.001));
  
  // Cerrar el borde
  if (points.length > 0) {
    points.push(points[0]);
  }

  return (
    <Line
      points={points}
      color={DEFAULT_GLOBE_CONFIG.borderColor}
      lineWidth={1}
    />
  );
}

export default function GeographicLayers({
  layer,
  continents,
  countries,
  subdivisions,
  selectedContinent,
  selectedCountry,
  hoveredItem,
  radius,
  showLabels,
  showBorders,
  onItemClick,
  onItemHover
}: GeographicLayersProps) {
  // Renderizar continentes
  if (layer === 'continents') {
    return (
      <>
        {continents.map(continent => (
          <React.Fragment key={continent.id}>
            <GeographicRegion
              id={continent.id}
              type="continent"
              vertices={continent.geometry3D.vertices}
              center={continent.geometry3D.center}
              label={continent.name}
              color={DEFAULT_GLOBE_CONFIG.continentColors[continent.id] || '#888888'}
              radius={radius}
              isHovered={hoveredItem === continent.id}
              isSelected={selectedContinent === continent.id}
              showLabel={showLabels}
              onClick={() => onItemClick(continent.id, 'continent')}
              onHover={(hovering) => onItemHover(hovering ? continent.id : null, hovering ? 'continent' : null)}
            />
            {showBorders && <GeographicBorder vertices={continent.geometry3D.vertices} radius={radius} />}
          </React.Fragment>
        ))}
      </>
    );
  }

  // Renderizar países (filtrados por continente seleccionado)
  if (layer === 'countries' && selectedContinent) {
    const filteredCountries = countries.filter(country => country.continentId === selectedContinent);
    
    return (
      <>
        {filteredCountries.map(country => (
          <React.Fragment key={country.id}>
            <GeographicRegion
              id={country.id}
              type="country"
              vertices={country.geometry3D.vertices}
              center={country.geometry3D.center}
              label={country.name}
              color={DEFAULT_GLOBE_CONFIG.countryColors[country.id] || DEFAULT_GLOBE_CONFIG.countryColors.default}
              radius={radius}
              isHovered={hoveredItem === country.id}
              isSelected={selectedCountry === country.id}
              showLabel={showLabels}
              onClick={() => onItemClick(country.id, 'country')}
              onHover={(hovering) => onItemHover(hovering ? country.id : null, hovering ? 'country' : null)}
            />
            {showBorders && <GeographicBorder vertices={country.geometry3D.vertices} radius={radius} />}
          </React.Fragment>
        ))}
      </>
    );
  }

  // Renderizar subdivisiones (filtradas por país seleccionado)
  if (layer === 'subdivisions' && selectedCountry) {
    const filteredSubdivisions = subdivisions.filter(sub => sub.countryId === selectedCountry);
    
    return (
      <>
        {filteredSubdivisions.map(subdivision => (
          <React.Fragment key={subdivision.id}>
            <GeographicRegion
              id={subdivision.id}
              type="subdivision"
              vertices={subdivision.geometry3D.vertices}
              center={subdivision.geometry3D.center}
              label={subdivision.name}
              color="#FFA500" // Color naranja para subdivisiones
              radius={radius}
              isHovered={hoveredItem === subdivision.id}
              isSelected={false}
              showLabel={showLabels}
              onClick={() => onItemClick(subdivision.id, 'subdivision')}
              onHover={(hovering) => onItemHover(hovering ? subdivision.id : null, hovering ? 'subdivision' : null)}
            />
            {showBorders && <GeographicBorder vertices={subdivision.geometry3D.vertices} radius={radius} />}
          </React.Fragment>
        ))}
      </>
    );
  }

  return null;
}