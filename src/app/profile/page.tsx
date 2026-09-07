'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VolunteerProfile } from '@/components/profile/VolunteerProfile';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { LegalSafetyNav } from '@/components/profile/LegalSafetyNav';
import { ShieldCheck, User } from 'lucide-react';

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
        <div className="py-4 sm:py-8">
          {/* Mobile Layout (< md) */}
          <div className="block md:hidden space-y-4 max-w-lg mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold text-xl mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Volunteer Profile</h2>
              <p className="text-xs text-gray-500 font-medium">
                Sign in to manage your volunteer settings, date of birth, age-verified credentials, and official Krow ID.
              </p>
              <div>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Sign In to Volunteer Account
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <LegalSafetyNav />
            </div>
          </div>

          {/* Desktop Layout (>= md): Side-by-Side 2-Column Split */}
          <div className="hidden md:grid md:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
            <div className="md:col-span-5 p-8 bg-white rounded-3xl border border-gray-100 shadow-card text-center space-y-4 sticky top-24">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold text-2xl mx-auto shadow-2xs">
                <User className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Volunteer Profile</h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Sign in to access your volunteer hours dashboard, personalize your profile settings, and earn verified service awards with your unique Krow ID.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Sign In to Volunteer Account
                </button>
              </div>
              <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Community & Youth Safety
              </div>
            </div>

            <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-card">
              <LegalSafetyNav />
            </div>
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
