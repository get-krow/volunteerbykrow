'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { OpportunityFeed } from '@/components/discover/OpportunityFeed';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile, SystemRole } from '@/lib/types';
import { db } from '@/lib/db';

export default function OpportunitiesPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<SystemRole>('volunteer');

  useEffect(() => {
    const u = db.getCurrentUser();
    setCurrentUser(u);
    if (u?.role === 'organizer') {
      window.location.href = '/organizer/opportunities';
    }
  }, []);

  const handleOpenAuth = (role: SystemRole = 'volunteer') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'organizer') {
      window.location.href = '/organizer/opportunities';
    }
  };

  return (
    <MainLayout>
      <OpportunityFeed currentUser={currentUser} onOpenAuth={() => handleOpenAuth('volunteer')} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
        onLoginSuccess={handleLoginSuccess}
      />
    </MainLayout>
  );
}
