'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ShieldCheck, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PublicVerifyPortalPage() {
  const router = useRouter();
  const [certId, setCertId] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    const cleanId = certId.trim().toUpperCase();
    router.push(`/verify/${cleanId}`);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center mx-auto border-2 border-purple-200 shadow-2xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-purple-50 text-[#635BFF] rounded-full text-xs font-black tracking-wider uppercase border border-purple-100">
              Official Krow Verification Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Verify a Krow Certificate</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
              Verify official volunteer hours certificates issued to students for schools, universities, scholarships, and organizations.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-3 max-w-md mx-auto pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. CERT-4D92X7PQ"
                className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-xs font-mono font-black text-gray-900 focus:ring-2 focus:ring-purple-500 uppercase shadow-2xs"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                Verify <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Database Direct
              </span>
              <p className="text-[11px] text-gray-400">Compares directly against Krow's official records.</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Account Needed
              </span>
              <p className="text-[11px] text-gray-400">Schools and employers verify without signing up.</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Anti-Fraud Secure
              </span>
              <p className="text-[11px] text-gray-400">PDF modifications cannot alter database truth.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
