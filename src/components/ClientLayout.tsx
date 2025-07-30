'use client';

import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from 'react';
import { isMigrationNeeded, migrateUserData } from '@/lib/data-migration';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Run migration on app startup
    if (isMigrationNeeded()) {
      const migratedCount = migrateUserData();
      if (migratedCount > 0) {
        console.log(`Successfully migrated ${migratedCount} data keys to WAOK-AI-STEM`);
      }
    }
  }, []);

  return (
    <ProfileProvider>
      {children}
      <Toaster />
    </ProfileProvider>
  );
}