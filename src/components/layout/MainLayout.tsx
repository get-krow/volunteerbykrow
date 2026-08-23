'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopHeader } from './TopHeader';
import { AuthModal } from '../auth/AuthModal';
import { db } from '@/lib/db';
import { UserProfile } from '@/lib/types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    typeof window !== 'undefined' ? db.getCurrentUser() : null
  );

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {/* Left Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        {/* Top Sticky Header */}
        <TopHeader />

        {/* Page Inner Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

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
