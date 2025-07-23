import { getCurrentProfileStorageKey } from './profiles';

export interface UserPreferences {
  autoAdvance: {
    [cardId: string]: boolean;
  };
  keepNumpadOpen: {
    [cardId: string]: boolean;
  };
}

const BASE_PREFERENCES_KEY = 'waok_preferences';

// Helper to get current preferences key
const getPreferencesKey = () => getCurrentProfileStorageKey(BASE_PREFERENCES_KEY);

export const userPreferences = {
  // Get all preferences
  getAll(): UserPreferences {
    if (typeof window === 'undefined') return { autoAdvance: {}, keepNumpadOpen: {} };
    
    try {
      // Migrate from old key if needed
      this.migrateFromOldKey();
      
      const stored = localStorage.getItem(getPreferencesKey());
      if (!stored) return { autoAdvance: {}, keepNumpadOpen: {} };
      
      const parsed = JSON.parse(stored) as UserPreferences;
      // Ensure keepNumpadOpen exists for backward compatibility
      if (!parsed.keepNumpadOpen) {
        parsed.keepNumpadOpen = {};
      }
      return parsed;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return { autoAdvance: {}, keepNumpadOpen: {} };
    }
  },

  // Get auto-advance preference for a specific card
  getAutoAdvance(cardId: string): boolean {
    const prefs = this.getAll();
    return prefs.autoAdvance[cardId] ?? false;
  },

  // Set auto-advance preference for a specific card
  setAutoAdvance(cardId: string, enabled: boolean): void {
    if (typeof window === 'undefined') return;
    
    try {
      const prefs = this.getAll();
      prefs.autoAdvance[cardId] = enabled;
      localStorage.setItem(getPreferencesKey(), JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  // Get keep numpad open preference for a specific card
  getKeepNumpadOpen(cardId: string): boolean {
    const prefs = this.getAll();
    return prefs.keepNumpadOpen[cardId] ?? false;
  },

  // Set keep numpad open preference for a specific card
  setKeepNumpadOpen(cardId: string, enabled: boolean): void {
    if (typeof window === 'undefined') return;
    
    try {
      const prefs = this.getAll();
      prefs.keepNumpadOpen[cardId] = enabled;
      localStorage.setItem(getPreferencesKey(), JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  // Clear preferences for a specific card
  clearCardPreferences(cardId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const prefs = this.getAll();
      delete prefs.autoAdvance[cardId];
      delete prefs.keepNumpadOpen[cardId];
      localStorage.setItem(getPreferencesKey(), JSON.stringify(prefs));
    } catch (error) {
      console.error('Error clearing card preferences:', error);
    }
  },

  // Clear all preferences
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getPreferencesKey());
  },
  
  // Migrate data from old key to profile-specific key
  migrateFromOldKey(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if there's data in the old key
      const oldData = localStorage.getItem(BASE_PREFERENCES_KEY);
      const currentKey = getPreferencesKey();
      
      // If old data exists and new key doesn't have data, migrate
      if (oldData && !localStorage.getItem(currentKey)) {
        console.log('Migrating preferences to profile-specific storage');
        localStorage.setItem(currentKey, oldData);
        // Don't remove old data yet, keep for other profiles that might need migration
      }
    } catch (error) {
      console.error('Error migrating preferences:', error);
    }
  }
};