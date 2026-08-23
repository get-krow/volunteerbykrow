'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Volunteer Calendar</h1>
        <p className="text-xs text-gray-500">Upcoming volunteer event calendar and schedule.</p>
      </div>
    </MainLayout>
  );
}
