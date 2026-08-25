'use client';

import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, Building2, UserMinus } from 'lucide-react';
import { Opportunity, UserProfile } from '@/lib/types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  currentUser: UserProfile | null;
  onRegister: (oppId: string) => void;
  onUnsign?: (oppId: string) => void;
  onSelectCard?: (opp: Opportunity) => void;
  isRegistered?: boolean;
  onOpenAuth: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity: opp,
  currentUser,
  onRegister,
  onUnsign,
  onSelectCard,
  isRegistered,
  onOpenAuth,
}) => {
  const max = opp.max_volunteers;
  const currentCount = opp.registered_count || 0;
  const spotsLeft = max !== null && max !== undefined ? Math.max(0, max - currentCount) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const isEnded = opp.status === 'ended' || opp.date < todayStr;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (isFull || isRegistered || isEnded) return;
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

  const formatTime = (startTime: string) => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m < 10 ? '0' + m : m} ${ampm}`;
  };

  return (
    <div
      onClick={() => onSelectCard?.(opp)}
      className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Section 10 Spec: Image (consistent proportion) */}
        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
          {opp.banner_url ? (
            <img
              src={opp.banner_url}
              alt={opp.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#635BFF] via-[#5046E5] to-[#3730A3] flex items-center justify-center p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="text-center text-white space-y-1 z-10 px-2">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center font-black text-sm shadow-xs">
                  {opp.org_name ? opp.org_name.charAt(0) : 'V'}
                </div>
                <p className="font-extrabold text-xs tracking-wide opacity-90 line-clamp-1">{opp.org_name || 'Volunteer Opportunity'}</p>
              </div>
            </div>
          )}

          {/* Role & Age & Closed Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            {isEnded ? (
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                Closed
              </span>
            ) : (
              <>
                <span className="bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {opp.custom_role || 'General'}
                </span>
                <span className="bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {opp.min_age ? `${opp.min_age}+` : 'All Ages'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 space-y-2">
          {/* Opportunity Title */}
          <h3 className="text-base font-extrabold text-gray-900 leading-snug group-hover:text-[#635BFF] transition-colors line-clamp-1">
            {opp.title}
          </h3>

          {/* Organization & Verified Badge */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-[#635BFF] flex-shrink-0" />
            <span className="font-semibold truncate">{opp.org_name || 'Organization'}</span>
            {opp.org_verification_status === 'verified' && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-200 flex-shrink-0">
                ✓ Verified
              </span>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>
              {formatDate(opp.date)} · {formatTime(opp.start_time)}
            </span>
          </div>

          {/* Hours & Age */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>
              {opp.duration_hours} hours · {opp.min_age ? `Ages ${opp.min_age}+` : 'All Ages'}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{opp.location_address || 'Location TBD'}</span>
          </div>

          {/* Spots Remaining */}
          <div className="text-xs font-semibold text-[#635BFF] pt-1">
            {spotsLeft !== null ? `${spotsLeft} spots remaining` : 'Unlimited spots'}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 pt-0">
        {isEnded ? (
          <button
            disabled
            className="w-full py-2.5 bg-gray-100 text-gray-500 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 cursor-not-allowed uppercase tracking-wider"
          >
            CLOSED
          </button>
        ) : isRegistered ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Signed Up
            </div>
            {onUnsign && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Leave "${opp.title}"? Your spot will be made available to others.`)) {
                    onUnsign(opp.id);
                  }
                }}
                className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1"
                title="Leave Event"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleActionClick}
            disabled={isFull}
            className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
              isFull
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
                : 'bg-[#635BFF] hover:bg-[#5046E5] active:scale-[0.99]'
            }`}
          >
            {isFull ? 'Full' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
};
