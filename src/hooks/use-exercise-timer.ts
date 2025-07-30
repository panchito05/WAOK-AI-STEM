import { useState, useEffect, useRef, useCallback } from 'react';

interface UseExerciseTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  enabled?: boolean;
}

interface UseExerciseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  start: () => void;
  reset: () => void;
  percentage: number;
}

export function useExerciseTimer({
  initialSeconds,
  onTimeUp,
  enabled = true
}: UseExerciseTimerProps): UseExerciseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);
  
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  
  // Stop timer when disabled
  useEffect(() => {
    if (!enabled && isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [enabled, isRunning]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (!isRunning || !enabledRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Handle time up event
  useEffect(() => {
    if (timeRemaining === 0 && isRunning && enabledRef.current) {
      setIsRunning(false);
      if (onTimeUpRef.current) {
        onTimeUpRef.current();
      }
    }
  }, [timeRemaining, isRunning]);

  const start = useCallback(() => {
    if (enabledRef.current) {
      // Solo iniciar si hay tiempo restante
      setTimeRemaining(current => {
        if (current > 0) {
          setIsRunning(true);
        }
        return current;
      });
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(initialSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialSeconds]);

  // Calculate percentage for visual indicators
  const percentage = (timeRemaining / initialSeconds) * 100;

  return {
    timeRemaining,
    isRunning,
    start,
    reset,
    percentage
  };
}