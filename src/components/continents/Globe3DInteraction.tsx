'use client';

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  CameraState,
  SphericalCoordinate,
  sphericalToCartesian,
  AnimationConfig 
} from '@/lib/continents/types3d';

interface Globe3DInteractionProps {
  targetPosition?: SphericalCoordinate;
  targetZoom?: number;
  animationConfig?: AnimationConfig;
  onAnimationComplete?: () => void;
  enableUserControl?: boolean;
}

export function Globe3DInteraction({
  targetPosition,
  targetZoom = 200,
  animationConfig = { duration: 1000, easing: 'easeInOut' },
  onAnimationComplete,
  enableUserControl = true
}: Globe3DInteractionProps) {
  const { camera, gl } = useThree();
  const animationRef = useRef<{
    startTime: number;
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    startZoom: number;
    endZoom: number;
    isAnimating: boolean;
  }>({
    startTime: 0,
    startPosition: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    startZoom: 300,
    endZoom: 300,
    isAnimating: false
  });

  // Función de easing
  const getEasing = (t: number, type: string): number => {
    switch (type) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  };

  // Iniciar animación cuando cambia el target
  useEffect(() => {
    if (targetPosition) {
      const targetCartesian = sphericalToCartesian(targetPosition, targetZoom);
      
      animationRef.current = {
        startTime: Date.now(),
        startPosition: camera.position.clone(),
        endPosition: targetCartesian,
        startZoom: camera.position.length(),
        endZoom: targetZoom,
        isAnimating: true
      };
    }
  }, [targetPosition, targetZoom, camera]);

  // Animar la cámara
  useFrame(() => {
    const anim = animationRef.current;
    
    if (anim.isAnimating) {
      const elapsed = Date.now() - anim.startTime;
      const progress = Math.min(elapsed / animationConfig.duration, 1);
      const easedProgress = getEasing(progress, animationConfig.easing);
      
      // Interpolar posición
      const newPosition = new THREE.Vector3().lerpVectors(
        anim.startPosition,
        anim.endPosition,
        easedProgress
      );
      
      // Interpolar zoom (distancia)
      const currentDistance = THREE.MathUtils.lerp(
        anim.startZoom,
        anim.endZoom,
        easedProgress
      );
      
      // Normalizar y aplicar distancia
      newPosition.normalize().multiplyScalar(currentDistance);
      camera.position.copy(newPosition);
      
      // Mirar al centro
      camera.lookAt(0, 0, 0);
      
      // Completar animación
      if (progress >= 1) {
        anim.isAnimating = false;
        onAnimationComplete?.();
      }
    }
  });

  return null;
}

// Hook para manejar interacciones del globo
export function useGlobe3DInteraction() {
  const [cameraTarget, setCameraTarget] = React.useState<SphericalCoordinate | null>(null);
  const [zoomLevel, setZoomLevel] = React.useState(300);
  const [selectedRegion, setSelectedRegion] = React.useState<{
    id: string;
    type: 'continent' | 'country' | 'subdivision';
  } | null>(null);

  const zoomToRegion = (center: SphericalCoordinate, type: 'continent' | 'country' | 'subdivision') => {
    const zoomLevels = {
      continent: 200,
      country: 150,
      subdivision: 100
    };
    
    setCameraTarget(center);
    setZoomLevel(zoomLevels[type]);
  };

  const resetCamera = () => {
    setCameraTarget({ lat: 0, lng: 0 });
    setZoomLevel(300);
    setSelectedRegion(null);
  };

  const selectRegion = (id: string, type: 'continent' | 'country' | 'subdivision') => {
    setSelectedRegion({ id, type });
  };

  return {
    cameraTarget,
    zoomLevel,
    selectedRegion,
    zoomToRegion,
    resetCamera,
    selectRegion
  };
}

// Componente para manejar gestos táctiles
export function TouchGestureHandler({ 
  onRotate,
  onZoom,
  onPan
}: {
  onRotate?: (deltaX: number, deltaY: number) => void;
  onZoom?: (delta: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
}) {
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ distance: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        touchesRef.current.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY
        });
      }
      
      // Detectar pinch
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        pinchRef.current = { distance };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      // Rotación con un dedo
      if (e.touches.length === 1 && onRotate) {
        const touch = e.touches[0];
        const prevTouch = touchesRef.current.get(touch.identifier);
        
        if (prevTouch) {
          const deltaX = touch.clientX - prevTouch.x;
          const deltaY = touch.clientY - prevTouch.y;
          onRotate(deltaX, deltaY);
          
          touchesRef.current.set(touch.identifier, {
            x: touch.clientX,
            y: touch.clientY
          });
        }
      }
      
      // Zoom con dos dedos (pinch)
      if (e.touches.length === 2 && pinchRef.current && onZoom) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const delta = distance - pinchRef.current.distance;
        onZoom(delta * 0.01);
        pinchRef.current.distance = distance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        touchesRef.current.delete(e.changedTouches[i].identifier);
      }
      
      if (e.touches.length < 2) {
        pinchRef.current = null;
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [onRotate, onZoom, onPan]);

  return null;
}