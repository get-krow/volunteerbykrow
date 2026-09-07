'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VolunteerProfile } from '@/components/profile/VolunteerProfile';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

import { LegalSafetyNav } from '@/components/profile/LegalSafetyNav';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const u = db.getCurrentUser();
    setCurrentUser(u);
    if (u) {
      db.syncVolunteerData(u.id).then(() => {
        setCurrentUser(db.getCurrentUser());
      });
    }
  }, []);

  const handleLogout = async () => {
    await db.logout();
    setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <MainLayout>
      {currentUser ? (
        <VolunteerProfile currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold text-xl mx-auto">
              V
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Volunteer Profile</h2>
            <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">
              Sign in to manage your volunteer settings, date of birth, age-verified credentials, and official Krow ID.
            </p>
            <div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Sign In to Volunteer Account
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card">
            <LegalSafetyNav />
          </div>
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
