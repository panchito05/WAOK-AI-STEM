'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { Profile, DEFAULT_AVATARS, DEFAULT_COLORS } from '@/lib/profiles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  editingProfileId?: string | null;
}

export default function ProfileManagementDialog({
  open,
  onOpenChange,
  mode,
  editingProfileId,
}: ProfileManagementDialogProps) {
  const { profiles, currentProfile, createProfile, updateProfile, deleteProfile } = useProfile();
  const [activeTab, setActiveTab] = useState(mode === 'create' ? 'create' : 'manage');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    avatar: DEFAULT_AVATARS[0],
    color: DEFAULT_COLORS[0],
  });
  
  const [editingProfile, setEditingProfile] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && editingProfileId) {
      const profile = profiles.find(p => p.id === editingProfileId);
      if (profile) {
        setFormData({
          name: profile.name,
          age: profile.age?.toString() || '',
          avatar: profile.avatar || DEFAULT_AVATARS[0],
          color: profile.color || DEFAULT_COLORS[0],
        });
        setEditingProfile(editingProfileId);
        setActiveTab('manage');
      }
    }
  }, [mode, editingProfileId, profiles]);

  const handleCreateProfile = () => {
    if (!formData.name.trim()) return;
    
    const newProfile = createProfile({
      name: formData.name.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      avatar: formData.avatar,
      color: formData.color,
    });
    
    if (newProfile) {
      // Reset form
      setFormData({
        name: '',
        age: '',
        avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      });
      onOpenChange(false);
    }
  };

  const handleUpdateProfile = () => {
    if (!editingProfile || !formData.name.trim()) return;
    
    const updated = updateProfile(editingProfile, {
      name: formData.name.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      avatar: formData.avatar,
      color: formData.color,
    });
    
    if (updated) {
      setEditingProfile(null);
      setFormData({
        name: '',
        age: '',
        avatar: DEFAULT_AVATARS[0],
        color: DEFAULT_COLORS[0],
      });
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfileToDelete(profileId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      const success = deleteProfile(profileToDelete);
      if (success) {
        setShowDeleteConfirm(false);
        setProfileToDelete(null);
        if (profiles.length <= 2) {
          onOpenChange(false);
        }
      }
    }
  };

  const startEditingProfile = (profile: Profile) => {
    setEditingProfile(profile.id);
    setFormData({
      name: profile.name,
      age: profile.age?.toString() || '',
      avatar: profile.avatar || DEFAULT_AVATARS[0],
      color: profile.color || DEFAULT_COLORS[0],
    });
  };

  const cancelEditing = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      age: '',
      avatar: DEFAULT_AVATARS[0],
      color: DEFAULT_COLORS[0],
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestión de Perfiles</DialogTitle>
            <DialogDescription>
              Crea y administra perfiles para diferentes niños
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Crear Perfil</TabsTrigger>
              <TabsTrigger value="manage">Administrar Perfiles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del niño</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: María"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Edad (opcional)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="3"
                    max="18"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ej: 8"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Avatar</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {DEFAULT_AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setFormData({ ...formData, avatar })}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          formData.avatar === avatar
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-muted-foreground'
                        }`}
                      >
                        <span className="text-2xl">{avatar}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Color del tema</Label>
                  <div className="grid grid-cols-10 gap-2 mt-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          formData.color === color
                            ? 'border-foreground scale-110'
                            : 'border-muted hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback 
                      className="text-2xl"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{formData.name || 'Nombre'}</p>
                    {formData.age && <p className="text-sm text-muted-foreground">{formData.age} años</p>}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleCreateProfile}
                  disabled={!formData.name.trim()}
                >
                  Crear Perfil
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      {editingProfile === profile.id ? (
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Nombre"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              min="3"
                              max="18"
                              value={formData.age}
                              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                              placeholder="Edad"
                              className="w-20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleUpdateProfile}
                              disabled={!formData.name.trim()}
                            >
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Avatar className="h-12 w-12">
                            <AvatarFallback 
                              style={{ backgroundColor: profile.color || '#45B7D1' }}
                            >
                              {profile.avatar || '👤'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{profile.name}</p>
                            {profile.age && (
                              <p className="text-sm text-muted-foreground">{profile.age} años</p>
                            )}
                            {profile.id === currentProfile?.id && (
                              <p className="text-xs text-primary">Perfil activo</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditingProfile(profile)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteProfile(profile.id)}
                              disabled={profiles.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos 
              asociados a este perfil, incluyendo tarjetas, ejercicios y progreso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}