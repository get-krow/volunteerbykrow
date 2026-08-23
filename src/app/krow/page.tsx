'use client';

import React from 'react';
import { AdminPortal } from '@/components/admin/AdminPortal';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <AdminPortal />
    </div>
  );
}
