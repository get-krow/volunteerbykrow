'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Terms of Service</h1>
        <p className="text-xs text-gray-500">Terms of service for Volunteer by Krow platform users.</p>
      </div>
    </MainLayout>
  );
}
