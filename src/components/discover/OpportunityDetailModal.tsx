'use client';

import React from 'react';
import { X, Calendar, Clock, MapPin, Building2, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { Opportunity, UserProfile } from '@/lib/types';
import { createGoogleCalendarUrl } from '@/lib/google-calendar';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (oppId: string) => void;
  isRegistered?: boolean;
  onOpenAuth: () => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity: opp,
  currentUser,
  isOpen,
  onClose,
  onRegister,
  isRegistered,
  onOpenAuth,
}) => {
  if (!isOpen || !opp) return null;

  const max = opp.max_volunteers;
  const currentCount = opp.registered_count || 0;
  const spotsLeft = max !== null && max !== undefined ? Math.max(0, max - currentCount) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const handleActionClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (isFull || isRegistered) return;
    onRegister(opp.id);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month] || parts[1]} ${day}, ${year}`;
  };

  const formatTime = (startTime: string, endTime: string) => {
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };
    return `${parseTime(startTime)} to ${parseTime(endTime)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white sm:rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full min-h-screen sm:min-h-0 overflow-hidden relative flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-gray-900 rounded-full shadow-md transition-colors"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Section 11 Spec: Desktop Two-Column Layout / Mobile Single Column */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 p-0 md:p-8">
            {/* Left Column: Image, Description, Instructions */}
            <div className="md:col-span-7 space-y-6">
              {/* Banner Image */}
              <div className="relative h-56 sm:h-72 w-full bg-gray-100 overflow-hidden sm:rounded-2xl">
                {opp.banner_url ? (
                  <img
                    src={opp.banner_url}
                    alt={opp.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#635BFF] via-[#5046E5] to-[#3730A3] flex items-center justify-center p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="text-center text-white space-y-2 z-10 px-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center font-black text-xl shadow-md border border-white/20">
                        {opp.org_name ? opp.org_name.charAt(0) : 'V'}
                      </div>
                      <p className="font-extrabold text-sm sm:text-base tracking-wide opacity-95">{opp.org_name || 'Volunteer Opportunity'}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {opp.custom_role || 'General'}
                  </span>
                  <span className="bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {opp.min_age ? `${opp.min_age}+` : 'All Ages'}
                  </span>
                </div>
              </div>

              {/* Title & Org on Mobile */}
              <div className="px-6 md:px-0 space-y-2 md:hidden">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#635BFF]" />
                  <span className="text-xs font-bold text-gray-600">{opp.org_name}</span>
                  {opp.org_verification_status === 'verified' && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-gray-900">{opp.title}</h1>
              </div>

              {/* Description Section */}
              <div className="px-6 md:px-0 space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  About this opportunity
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {opp.description || 'Join community volunteers for this meaningful event.'}
                </p>
              </div>

              {/* Instructions Section */}
              {opp.instructions && (
                <div className="px-6 md:px-0 space-y-3 pt-2">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                    What you'll do & Instructions
                  </h3>
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/80 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {opp.instructions}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Summary & Action Card */}
            <div className="md:col-span-5 p-6 md:p-0">
              <div className="bg-gray-50/80 md:bg-white rounded-2xl p-5 border border-gray-200/80 space-y-5 sticky top-4">
                {/* Title & Org Header (Desktop) */}
                <div className="hidden md:block space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#635BFF]" />
                    <span className="text-xs font-bold text-gray-600">{opp.org_name}</span>
                    {opp.org_verification_status === 'verified' && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">{opp.title}</h2>
                </div>

                {/* Key Details Summary List */}
                <div className="space-y-3 text-xs text-gray-700 font-medium divide-y divide-gray-100">
                  <div className="pt-2 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">{formatDate(opp.date)}</div>
                      <div className="text-gray-500 text-[11px]">{formatTime(opp.start_time, opp.end_time)}</div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">{opp.location_address || 'Location TBD'}</div>
                      <div className="text-gray-500 text-[11px] uppercase tracking-wider">{opp.location_type}</div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-gray-500">Awarded Hours</span>
                    <span className="font-extrabold text-gray-900 bg-purple-50 px-2.5 py-1 rounded-lg text-brand-700">
                      {opp.duration_hours} Hours
                    </span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-gray-500">Age Requirement</span>
                    <span className="font-bold text-gray-900">
                      {opp.min_age ? `${opp.min_age}+` : 'All Ages'}
                    </span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-bold text-[#635BFF]">
                      {spotsLeft !== null ? `${spotsLeft} spots remaining` : 'Unlimited spots'}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {isRegistered ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> You are Registered
                      </button>
                      <a
                        href={createGoogleCalendarUrl(opp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Add to Google Calendar
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={handleActionClick}
                      disabled={isFull}
                      className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                        isFull
                          ? 'bg-gray-300 cursor-not-allowed shadow-none'
                          : 'bg-[#635BFF] hover:bg-[#5046E5] active:scale-[0.99] shadow-purple-500/20'
                      }`}
                    >
                      {isFull ? 'Opportunity Full' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
