'use client';

import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, Building2 } from 'lucide-react';
import { Opportunity, UserProfile } from '@/lib/types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  currentUser: UserProfile | null;
  onRegister: (oppId: string) => void;
  onSaveToggle?: (oppId: string) => void;
  isSaved?: boolean;
  isRegistered?: boolean;
  onOpenAuth: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity: opp,
  currentUser,
  onRegister,
  isRegistered,
  onOpenAuth,
}) => {
  const max = opp.max_volunteers;
  const currentCount = opp.registered_count || 0;
  const spotsLeft = max !== null && max !== undefined ? Math.max(0, max - currentCount) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (isFull || isRegistered) return;
    onRegister(opp.id);
  };

  // Format date display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time range
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
    <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Card Image Header */}
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          <img
            src={opp.banner_url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'}
            alt={opp.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges Overlay on Top-Left */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              {opp.custom_role || 'General'}
            </span>
            <span className="bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              {opp.min_age ? `${opp.min_age}+` : 'All Ages'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Org Header */}
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
            <span className="text-xs font-bold text-gray-600 truncate">{opp.org_name || 'Krow Organization'}</span>

            {opp.org_verification_status === 'verified' && (
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ml-1 flex-shrink-0">
                Verified
              </span>
            )}
          </div>

          {/* Opportunity Title */}
          <h3 className="text-lg font-extrabold text-gray-900 leading-snug mb-3 group-hover:text-[#635BFF] transition-colors">
            {opp.title}
          </h3>

          {/* Meta Information Row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mb-3">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <span className="truncate">{opp.location_address || 'Test'}</span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <span>{formatDate(opp.date)}</span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <span>{opp.duration_hours} hrs</span>
            </div>
          </div>

          {/* Capacity and Time Subline */}
          <div className="text-xs font-semibold mb-4">
            <span className="text-[#635BFF]">
              {spotsLeft !== null ? `${spotsLeft} spots remaining` : 'Unlimited spots'}
            </span>
            <span className="text-gray-400 mx-1.5">•</span>
            <span className="text-gray-500 font-medium">
              {formatTime(opp.start_time, opp.end_time)} ({opp.duration_hours} hrs)
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-5 pb-5">
        {isRegistered ? (
          <button
            disabled
            className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4" /> Signed Up
          </button>
        ) : (
          <button
            onClick={handleActionClick}
            className="w-full py-3 bg-[#635BFF] hover:bg-[#5046E5] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/10 transition-all flex items-center justify-center gap-1.5"
          >
            Sign Up
          </button>
        )}
      </div>
    </div>
  );
};
