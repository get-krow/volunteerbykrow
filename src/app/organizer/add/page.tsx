'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { OrganizerPortal } from '@/components/organizer/OrganizerPortal';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

export default function OrganizerAddPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  return (
    <MainLayout>
      {currentUser ? (
        <OrganizerPortal initialTab="add" currentUser={currentUser} onLogout={() => { db.setCurrentUser(null); setCurrentUser(null); }} />
      ) : (
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm text-center">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Organizer Portal</h2>
          <p className="text-xs text-gray-500 font-medium">Please sign in to post new volunteer opportunities.</p>
        </div>
      )}
    </MainLayout>
  );
}
