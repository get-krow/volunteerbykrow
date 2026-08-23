'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function RosterPage() {
  return (
    <MainLayout>
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Volunteer Roster</h1>
        <p className="text-xs text-gray-500">View registered community volunteers and rank achievements.</p>
      </div>
    </MainLayout>
  );
}
