'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VolunteerProfile } from '@/components/profile/VolunteerProfile';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleLogout = () => {
    db.setCurrentUser(null);
    setCurrentUser(null);
  };

  return (
    <MainLayout>
      {currentUser ? (
        <VolunteerProfile currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm text-center space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900">Volunteer Profile</h2>
          <p className="text-xs text-gray-500 font-medium">Sign in to manage your profile settings, date of birth, and location.</p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-6 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Sign In to Volunteer Account
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole="volunteer"
        onLoginSuccess={(u) => setCurrentUser(u)}
      />
    </MainLayout>
  );
}
