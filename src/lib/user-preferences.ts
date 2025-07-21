export interface UserPreferences {
  autoAdvance: {
    [cardId: string]: boolean;
  };
}

const PREFERENCES_KEY = 'mathminds_preferences';

export const userPreferences = {
  // Get all preferences
  getAll(): UserPreferences {
    if (typeof window === 'undefined') return { autoAdvance: {} };
    
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (!stored) return { autoAdvance: {} };
      
      return JSON.parse(stored) as UserPreferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return { autoAdvance: {} };
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
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
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
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error clearing card preferences:', error);
    }
  },

  // Clear all preferences
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PREFERENCES_KEY);
  }
};