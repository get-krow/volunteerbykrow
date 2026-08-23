'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from './TopHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { AuthModal } from '../auth/AuthModal';
import { db } from '@/lib/db';
import { UserProfile } from '@/lib/types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-[#635BFF] selection:text-white">
      {/* Top Desktop Navigation Header (Section 5 Spec) */}
      <TopHeader currentUser={currentUser} onOpenAuth={handleOpenAuth} />

      {/* Centered Main Content Area (Section 7 Spec: Max-width centered layout) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (Section 6 Spec) */}
      <MobileBottomNav currentUser={currentUser} onOpenAuth={handleOpenAuth} />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole="volunteer"
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
