'use client';

import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      {children}
      <Toaster />
    </ProfileProvider>
  );
}