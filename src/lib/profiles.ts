export interface Profile {
  id: string;
  name: string;
  age?: number;
  avatar?: string; // emoji or image URL
  color?: string; // theme color
  createdAt: string;
  lastActiveAt: string;
}

const PROFILES_KEY = 'waok_profiles';
const ACTIVE_PROFILE_KEY = 'waok_active_profile';
const DEFAULT_PROFILE_ID = 'default';

// Default avatars for profiles
export const DEFAULT_AVATARS = [
  '🦁', '🐯', '🦊', '🐨', '🐼', '🐸', '🐙', '🦄',
  '🦋', '🐢', '🦉', '🐝', '🦈', '🦕', '🐳', '🦜'
];

// Default colors for profiles
export const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export const profilesStorage = {
  // Get all profiles
  getAll(): Profile[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (!stored) {
        // Create default profile on first load
        const defaultProfile = this.createDefaultProfile();
        this.saveAll([defaultProfile]);
        this.setActiveProfile(defaultProfile.id);
        return [defaultProfile];
      }
      
      return JSON.parse(stored) as Profile[];
    } catch (error) {
      console.error('Error loading profiles:', error);
      return [];
    }
  },

  // Get single profile
  getById(id: string): Profile | null {
    const profiles = this.getAll();
    return profiles.find(profile => profile.id === id) || null;
  },

  // Get active profile
  getActiveProfile(): Profile | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (!activeId) {
        return null;
      }
      return this.getById(activeId);
    } catch (error) {
      console.error('Error getting active profile:', error);
      return null;
    }
  },

  // Set active profile
  setActiveProfile(profileId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const profile = this.getById(profileId);
      if (!profile) return false;
      
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
      
      // Update last active timestamp
      this.update(profileId, { lastActiveAt: new Date().toISOString() });
      
      return true;
    } catch (error) {
      console.error('Error setting active profile:', error);
      return false;
    }
  },

  // Create new profile
  create(data: Omit<Profile, 'id' | 'createdAt' | 'lastActiveAt'>): Profile {
    const newProfile: Profile = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    
    // Assign random avatar and color if not provided
    if (!newProfile.avatar) {
      newProfile.avatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    }
    if (!newProfile.color) {
      newProfile.color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
    }
    
    const profiles = this.getAll();
    profiles.push(newProfile);
    this.saveAll(profiles);
    
    return newProfile;
  },

  // Update profile
  update(id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Profile | null {
    const profiles = this.getAll();
    const index = profiles.findIndex(profile => profile.id === id);
    
    if (index === -1) return null;
    
    profiles[index] = {
      ...profiles[index],
      ...updates,
      lastActiveAt: new Date().toISOString(),
    };
    
    this.saveAll(profiles);
    return profiles[index];
  },

  // Delete profile
  delete(id: string): boolean {
    const profiles = this.getAll();
    const filtered = profiles.filter(profile => profile.id !== id);
    
    // Don't allow deleting the last profile
    if (filtered.length === 0) return false;
    
    // If deleting active profile, switch to another
    const activeProfile = this.getActiveProfile();
    if (activeProfile?.id === id) {
      this.setActiveProfile(filtered[0].id);
    }
    
    this.saveAll(filtered);
    return true;
  },

  // Save all profiles
  saveAll(profiles: Profile[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  },

  // Create default profile
  createDefaultProfile(): Profile {
    return {
      id: DEFAULT_PROFILE_ID,
      name: 'Mi Perfil',
      avatar: '🦁',
      color: '#45B7D1',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
  },

  // Migrate existing data to default profile
  migrateExistingData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if migration is needed
      const profiles = localStorage.getItem(PROFILES_KEY);
      if (profiles) return; // Already migrated
      
      // Check if there's existing data
      const hasExistingData = 
        localStorage.getItem('waok_practice_cards') ||
        localStorage.getItem('waok_exercise_pools') ||
        localStorage.getItem('waok_preferences') ||
        localStorage.getItem('waok_multi_practice_session');
      
      if (!hasExistingData) return; // No data to migrate
      
      // Create default profile
      const defaultProfile = this.createDefaultProfile();
      this.saveAll([defaultProfile]);
      this.setActiveProfile(defaultProfile.id);
      
      console.log('Migrated existing data to default profile');
    } catch (error) {
      console.error('Error migrating data:', error);
    }
  },

  // Clear all profiles (for testing)
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
};

// Storage key helpers for profile-specific data
export const getProfileStorageKey = (baseKey: string, profileId: string): string => {
  return `${baseKey}_${profileId}`;
};

export const getCurrentProfileStorageKey = (baseKey: string): string => {
  let activeProfile = profilesStorage.getActiveProfile();
  if (!activeProfile) {
    const profiles = profilesStorage.getAll();
    if (profiles.length > 0) {
      profilesStorage.setActiveProfile(profiles[0].id);
      activeProfile = profiles[0];
    } else {
      // This case should ideally not be reached if getAll() creates a default
      console.warn('No active profile found, creating a new default profile.');
      activeProfile = profilesStorage.createDefaultProfile();
      profilesStorage.saveAll([activeProfile]);
      profilesStorage.setActiveProfile(activeProfile.id);
    }
  }
  return getProfileStorageKey(baseKey, activeProfile.id);
};