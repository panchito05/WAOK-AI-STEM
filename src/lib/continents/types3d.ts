import * as THREE from 'three';
import { Continent, Country, Subdivision } from './types';

export interface SphericalCoordinate {
  lat: number;  // Latitud: -90 a 90
  lng: number;  // Longitud: -180 a 180
  altitude?: number;  // Elevación sobre la superficie (opcional)
}

export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Geometry3D {
  vertices: SphericalCoordinate[];
  center: SphericalCoordinate;
  bounds: GeographicBounds;
  area: number;  // km²
}

export interface Continent3D extends Continent {
  geometry3D: Geometry3D;
  meshRef?: THREE.Mesh;
  outlineRef?: THREE.Line;
  labelRef?: THREE.Sprite;
  isHovered?: boolean;
  isSelected?: boolean;
  zoomLevel?: number;
}

export interface Country3D extends Country {
  geometry3D: Geometry3D;
  meshRef?: THREE.Mesh;
  outlineRef?: THREE.Line;
  labelRef?: THREE.Sprite;
  isHovered?: boolean;
  isSelected?: boolean;
  parentContinent3D?: Continent3D;
}

export interface Subdivision3D extends Subdivision {
  geometry3D: Geometry3D;
  meshRef?: THREE.Mesh;
  outlineRef?: THREE.Line;
  labelRef?: THREE.Sprite;
  isHovered?: boolean;
  isSelected?: boolean;
  parentCountry3D?: Country3D;
}

export interface CameraState {
  position: SphericalCoordinate;
  target: SphericalCoordinate;
  zoom: number;
  rotation: number;
  tilt: number;
}

export interface Globe3DState {
  continents: Continent3D[];
  countries: Country3D[];
  subdivisions: Subdivision3D[];
  camera: CameraState;
  selectedLayer: 'continents' | 'countries' | 'subdivisions';
  selectedContinent?: string;
  selectedCountry?: string;
  hoveredItem?: string;
  isDragging: boolean;
  dragStart?: { x: number; y: number };
  autoRotate: boolean;
  showLabels: boolean;
  showBorders: boolean;
  showOcean: boolean;
  showClouds: boolean;
  quality: 'low' | 'medium' | 'high';
}

export interface InteractionEvent3D {
  type: 'click' | 'hover' | 'drag' | 'zoom' | 'rotate';
  target?: string;
  targetType?: 'continent' | 'country' | 'subdivision' | 'ocean';
  position?: SphericalCoordinate;
  screenPosition?: { x: number; y: number };
  delta?: { x: number; y: number };
  zoomDelta?: number;
}

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  onComplete?: () => void;
}

export interface ZoomAnimation extends AnimationConfig {
  from: CameraState;
  to: CameraState;
}

export interface LayerVisibility {
  continents: boolean;
  countries: boolean;
  subdivisions: boolean;
  labels: boolean;
  borders: boolean;
  ocean: boolean;
  clouds: boolean;
  animals: boolean;
  flags: boolean;
}

export interface GlobeConfig3D {
  radius: number;
  segments: number;
  oceanColor: string;
  continentColors: Record<string, string>;
  countryColors: Record<string, string>;
  borderColor: string;
  hoverColor: string;
  selectedColor: string;
  labelScale: number;
  cloudOpacity: number;
  atmosphereColor: string;
  atmosphereOpacity: number;
}

export const DEFAULT_GLOBE_CONFIG: GlobeConfig3D = {
  radius: 100,
  segments: 64,
  oceanColor: '#006994',
  continentColors: {
    'north-america': '#FF6B6B',
    'south-america': '#4ECDC4',
    'europe': '#45B7D1',
    'africa': '#FFA07A',
    'asia': '#98D8C8',
    'oceania': '#9B59B6',
    'antarctica': '#E0E0E0'
  },
  countryColors: {
    default: '#90EE90'
  },
  borderColor: '#333333',
  hoverColor: '#FFD700',
  selectedColor: '#FF4500',
  labelScale: 1,
  cloudOpacity: 0.3,
  atmosphereColor: '#87CEEB',
  atmosphereOpacity: 0.1
};

export interface Touch3D {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

export interface GestureState {
  touches: Touch3D[];
  isPinching: boolean;
  pinchStartDistance?: number;
  pinchCurrentDistance?: number;
  isRotating: boolean;
  rotationStartAngle?: number;
  rotationCurrentAngle?: number;
}

export function sphericalToCartesian(coord: SphericalCoordinate, radius: number): THREE.Vector3 {
  const phi = (90 - coord.lat) * (Math.PI / 180);
  const theta = (coord.lng + 180) * (Math.PI / 180);
  const alt = radius + (coord.altitude || 0);
  
  const x = alt * Math.sin(phi) * Math.cos(theta);
  const y = alt * Math.cos(phi);
  const z = alt * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

export function cartesianToSpherical(position: THREE.Vector3, radius: number): SphericalCoordinate {
  const alt = position.length();
  const lat = 90 - Math.acos(position.y / alt) * (180 / Math.PI);
  const lng = Math.atan2(position.z, position.x) * (180 / Math.PI) - 180;
  
  return {
    lat,
    lng,
    altitude: alt - radius
  };
}

export function calculateGeographicCenter(vertices: SphericalCoordinate[]): SphericalCoordinate {
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

export function calculateGeographicBounds(vertices: SphericalCoordinate[]): GeographicBounds {
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