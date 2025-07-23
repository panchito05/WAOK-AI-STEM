'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Settings, Check } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ProfileManagementDialog from './ProfileManagementDialog';

export default function ProfileSelector() {
  const { currentProfile, profiles, switchProfile, isLoading } = useProfile();
  const [showManagementDialog, setShowManagementDialog] = useState(false);
  const [managementMode, setManagementMode] = useState<'create' | 'edit'>('create');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateProfile = () => {
    setManagementMode('create');
    setEditingProfileId(null);
    setShowManagementDialog(true);
  };

  const handleEditProfile = (profileId: string) => {
    setManagementMode('edit');
    setEditingProfileId(profileId);
    setShowManagementDialog(true);
  };

  const handleProfileChange = async (profileId: string) => {
    if (profileId === currentProfile?.id) return;
    
    // Check if there's a practice session in progress
    const hasActiveSession = localStorage.getItem('waok_multi_practice_session');
    
    if (hasActiveSession) {
      const confirmed = window.confirm(
        '¿Estás seguro de cambiar de perfil? Perderás el progreso de la sesión actual.'
      );
      if (!confirmed) return;
    }
    
    await switchProfile(profileId);
  };

  // Show consistent loading state during SSR and initial mount
  if (!mounted || isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled 
        className="w-[180px] justify-between font-normal"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-sm bg-muted">
              <span className="text-xs">...</span>
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">Cargando...</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  if (!currentProfile) {
    return (
      <Button variant="outline" size="sm" className="w-[180px]" onClick={handleCreateProfile}>
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Crear perfil</span>
        </div>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-[180px] justify-between font-normal"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback 
                  className="text-sm"
                  style={{ backgroundColor: currentProfile.color || '#45B7D1' }}
                >
                  {currentProfile.avatar || '👤'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm truncate max-w-[100px]">
                {currentProfile.name}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Perfiles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleProfileChange(profile.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-6 w-6">
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: profile.color || '#45B7D1' }}
                  >
                    {profile.avatar || '👤'}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm truncate">
                  {profile.name}
                </span>
                {profile.id === currentProfile.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCreateProfile} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <span>Crear nuevo perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleEditProfile(currentProfile.id)} 
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Gestionar perfiles</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showManagementDialog && (
        <ProfileManagementDialog
          open={showManagementDialog}
          onOpenChange={setShowManagementDialog}
          mode={managementMode}
          editingProfileId={editingProfileId}
        />
      )}
    </>
  );
}