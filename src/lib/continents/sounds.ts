/**
 * Sound effects system for the Continents game
 * Provides child-friendly audio feedback
 */

export type SoundType = 
  | 'pickup'       // When starting to drag an item
  | 'drop_correct' // When placing item correctly
  | 'drop_wrong'   // When placing item incorrectly
  | 'hint'         // When showing a hint
  | 'complete'     // When completing the game
  | 'celebration'  // Victory sound
  | 'hover';       // When hovering over correct zone

// Audio context for Web Audio API
let audioContext: AudioContext | null = null;

// Initialize audio context
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Generate tone with Web Audio API
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Could not play sound:', error);
  }
}

// Play chord progression
function playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.05): void {
  frequencies.forEach(freq => {
    playTone(freq, duration, type, volume);
  });
}

// Sound effect functions
export const SoundEffects = {
  // When picking up an item to drag
  pickup(): void {
    playTone(440, 0.1, 'triangle', 0.08);
  },

  // When successfully placing an item
  dropCorrect(): void {
    // Play happy ascending chord
    const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
    playChord(chord, 0.3, 'triangle', 0.06);
    
    // Add sparkle effect
    setTimeout(() => {
      playTone(1046.5, 0.15, 'sine', 0.04); // C6
    }, 100);
  },

  // When placing item incorrectly (gentle, not scary)
  dropWrong(): void {
    // Gentle "try again" sound
    playTone(349.23, 0.2, 'triangle', 0.05); // F4
    setTimeout(() => {
      playTone(329.63, 0.2, 'triangle', 0.05); // E4
    }, 100);
  },

  // When showing a hint
  hint(): void {
    // Magical "ding" sound
    playTone(880, 0.1, 'triangle', 0.07);
    setTimeout(() => {
      playTone(1174.66, 0.1, 'triangle', 0.05);
    }, 80);
  },

  // When hovering over correct drop zone
  hover(): void {
    playTone(523.25, 0.05, 'sine', 0.03); // Very subtle C5
  },

  // When completing the entire game
  complete(): void {
    // Victory fanfare
    const melody = [
      { freq: 523.25, time: 0 },      // C5
      { freq: 659.25, time: 150 },   // E5
      { freq: 783.99, time: 300 },   // G5
      { freq: 1046.5, time: 450 },   // C6
    ];
    
    melody.forEach(note => {
      setTimeout(() => {
        playTone(note.freq, 0.4, 'triangle', 0.08);
      }, note.time);
    });

    // Add celebration harmony
    setTimeout(() => {
      playChord([523.25, 659.25, 783.99, 1046.5], 0.8, 'sine', 0.04);
    }, 200);
  },

  // Celebration sound (for confetti effects)
  celebration(): void {
    // Sparkly celebration sounds
    const sparkles = [
      { freq: 1046.5, time: 0 },
      { freq: 1318.5, time: 50 },
      { freq: 1568, time: 100 },
      { freq: 1046.5, time: 150 },
      { freq: 1318.5, time: 200 },
      { freq: 2093, time: 250 }
    ];
    
    sparkles.forEach(sparkle => {
      setTimeout(() => {
        playTone(sparkle.freq, 0.15, 'triangle', 0.06);
      }, sparkle.time);
    });
  }
};

// Main sound player function
export function playSound(soundType: SoundType, enabled: boolean = true): void {
  if (!enabled) return;
  
  // Resume audio context if suspended (required by modern browsers)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  switch (soundType) {
    case 'pickup':
      SoundEffects.pickup();
      break;
    case 'drop_correct':
      SoundEffects.dropCorrect();
      break;
    case 'drop_wrong':
      SoundEffects.dropWrong();
      break;
    case 'hint':
      SoundEffects.hint();
      break;
    case 'hover':
      SoundEffects.hover();
      break;
    case 'complete':
      SoundEffects.complete();
      break;
    case 'celebration':
      SoundEffects.celebration();
      break;
    default:
      console.warn('Unknown sound type:', soundType);
  }
}

// Initialize audio context on user interaction
export function initializeAudio(): void {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
}

// Check if audio is supported
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}