'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, profilesStorage } from '@/lib/profiles';
import { useToast } from '@/hooks/use-toast';

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  switchProfile: (profileId: string) => Promise<boolean>;
  createProfile: (data: Omit<Profile, 'id' | 'createdAt' | 'lastActiveAt'>) => Profile | null;
  updateProfile: (id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => Profile | null;
  deleteProfile: (id: string) => boolean;
  refreshProfiles: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    setIsLoading(true);
    try {
      profilesStorage.migrateExistingData();
      
      let allProfiles = profilesStorage.getAll();
      let activeProfile = profilesStorage.getActiveProfile();

      if (allProfiles.length === 0) {
        // If no profiles exist, create a default one
        activeProfile = profilesStorage.createDefaultProfile();
        profilesStorage.saveAll([activeProfile]);
        profilesStorage.setActiveProfile(activeProfile.id);
        allProfiles = [activeProfile];
      } else if (!activeProfile) {
        // If profiles exist but none are active, set the first one
        activeProfile = allProfiles[0];
        profilesStorage.setActiveProfile(activeProfile.id);
      }

      setProfiles(allProfiles);
      setCurrentProfile(activeProfile);

    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los perfiles. Intenta refrescar la página.',
        variant: 'destructive',
      });
      // Ensure we don't get stuck in a loading state
      setProfiles([]);
      setCurrentProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchProfile = async (profileId: string): Promise<boolean> => {
    try {
      const success = profilesStorage.setActiveProfile(profileId);
      if (success) {
        const newProfile = profilesStorage.getById(profileId);
        setCurrentProfile(newProfile);
        
        // Reload profiles to update lastActiveAt
        loadProfiles();
        
        toast({
          title: 'Perfil cambiado',
          description: `Ahora estás usando el perfil de ${newProfile?.name}`,
        });
        
        // Force a page reload to ensure all data is refreshed
        // This is the simplest way to ensure all components pick up the new profile
        window.location.reload();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error switching profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el perfil',
        variant: 'destructive',
      });
      return false;
    }
  };

  const createProfile = (data: Omit<Profile, 'id' | 'createdAt' | 'lastActiveAt'>): Profile | null => {
    try {
      const newProfile = profilesStorage.create(data);
      loadProfiles(); // Reload to update list
      
      toast({
        title: 'Perfil creado',
        description: `El perfil "${newProfile.name}" se ha creado correctamente`,
      });
      
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el perfil',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProfile = (id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Profile | null => {
    try {
      const updatedProfile = profilesStorage.update(id, updates);
      if (updatedProfile) {
        loadProfiles(); // Reload to update list
        
        // Update current profile if it's the one being edited
        if (currentProfile?.id === id) {
          setCurrentProfile(updatedProfile);
        }
        
        toast({
          title: 'Perfil actualizado',
          description: `El perfil "${updatedProfile.name}" se ha actualizado`,
        });
      }
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteProfile = (id: string): boolean => {
    try {
      // Check if it's the last profile
      if (profiles.length <= 1) {
        toast({
          title: 'No permitido',
          description: 'No puedes eliminar el último perfil',
          variant: 'destructive',
        });
        return false;
      }
      
      const profile = profilesStorage.getById(id);
      const success = profilesStorage.delete(id);
      
      if (success) {
        loadProfiles(); // Reload to update list
        
        toast({
          title: 'Perfil eliminado',
          description: profile ? `El perfil "${profile.name}" se ha eliminado` : 'Perfil eliminado',
        });
        
        // If we deleted the active profile, reload the page
        if (currentProfile?.id === id) {
          window.location.reload();
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el perfil',
        variant: 'destructive',
      });
      return false;
    }
  };

  const value: ProfileContextType = {
    currentProfile,
    profiles,
    isLoading,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles: loadProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}