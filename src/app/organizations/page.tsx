'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { OrganizationFeed } from '@/components/organizations/OrganizationFeed';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile, SystemRole } from '@/lib/types';
import { db } from '@/lib/db';

export default function OrganizationsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<SystemRole>('volunteer');

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleOpenAuth = (role: SystemRole = 'volunteer') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  return (
    <MainLayout>
      <OrganizationFeed currentUser={currentUser} onOpenAuth={() => handleOpenAuth('volunteer')} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
        onLoginSuccess={(u) => setCurrentUser(u)}
      />
    </MainLayout>
  );
}
