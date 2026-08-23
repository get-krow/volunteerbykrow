'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  Download,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { UserProfile, Opportunity, Registration, AttendanceRecord } from '@/lib/types';
import { db } from '@/lib/db';
import { getNextBadgeInfo } from '@/lib/badges';
import { generateVolunteerHoursReport } from '@/lib/pdf-report';
import { createGoogleCalendarUrl, openAllUpcomingInCalendar } from '@/lib/google-calendar';

interface VolunteerDashboardProps {
  currentUser: UserProfile;
  onOpenAuth: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ currentUser }) => {
  const [registrations, setRegistrations] = useState<Registration[]>(() =>
    db.getVolunteerRegistrations(currentUser.id)
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => db.getOpportunities());
  const [savedIds, setSavedIds] = useState<string[]>(() => db.getSavedOpportunityIds());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => db.getAllAttendanceRecords());

  const refreshData = () => {
    setRegistrations(db.getVolunteerRegistrations(currentUser.id));
    setOpportunities(db.getOpportunities());
    setSavedIds(db.getSavedOpportunityIds());
    setAttendance(db.getAllAttendanceRecords());
  };

  // Calculations
  const totalAwardedHours = useMemo(() => {
    return db.calculateVolunteerTotalHours(currentUser.id);
  }, [attendance, currentUser.id]);

  const completedShiftsCount = useMemo(() => {
    return db.calculateVolunteerCompletedShifts(currentUser.id);
  }, [attendance, currentUser.id]);

  const badgeInfo = useMemo(() => {
    return getNextBadgeInfo(totalAwardedHours);
  }, [totalAwardedHours]);

  // Upcoming shifts registered by volunteer
  const upcomingShifts = useMemo(() => {
    const regOppIds = new Set(registrations.map((r) => r.opportunity_id));
    return opportunities.filter(
      (opp) => regOppIds.has(opp.id) && opp.status === 'published' && new Date(opp.date).getTime() >= new Date().setHours(0, 0, 0, 0)
    );
  }, [registrations, opportunities]);

  // Saved Opportunities
  const savedOpportunities = useMemo(() => {
    return opportunities.filter((o) => savedIds.includes(o.id) && o.status === 'published');
  }, [opportunities, savedIds]);

  // History of completed or past shifts
  const shiftHistory = useMemo(() => {
    const userAttendance = attendance.filter((a) => a.volunteer_id === currentUser.id);
    return userAttendance.map((att) => {
      const opp = opportunities.find((o) => o.id === att.opportunity_id);
      return {
        attendance: att,
        opportunity: opp,
      };
    });
  }, [attendance, opportunities, currentUser.id]);

  const handleUnsign = (oppId: string) => {
    if (confirm('Are you sure you want to unsign from this shift?')) {
      db.unsignFromOpportunity(oppId, currentUser.id);
      refreshData();
    }
  };

  const handleRemoveSaved = (oppId: string) => {
    db.toggleSavedOpportunity(currentUser.id, oppId);
    refreshData();
  };

  const handleDownloadPdf = () => {
    generateVolunteerHoursReport(currentUser, totalAwardedHours, completedShiftsCount, badgeInfo.currentBadge);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Awarded Hours Hero Card */}
        <div className="bg-gradient-to-br from-brand-900 via-brand-700 to-purple-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">Total Awarded Hours</span>
              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1 bg-white/20 hover:bg-white text-brand-900 hover:text-brand-700 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> PDF Report
              </button>
            </div>
            <div className="text-4xl sm:text-5xl font-black mt-2 tracking-tight">{totalAwardedHours} <span className="text-lg font-normal text-purple-200">hrs</span></div>
            <p className="text-xs text-purple-100 mt-1">Verified by Krow Partner Organizations</p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
            <span>Completed Shifts: <strong className="text-white text-sm">{completedShiftsCount}</strong></span>
            <span>Verified Status</span>
          </div>
        </div>

        {/* Badge Progress Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Badge Progression</span>
              <span className="text-xs font-bold text-brand-600 px-2.5 py-0.5 rounded-full bg-purple-50">
                {badgeInfo.currentBadge.name}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-400 text-white flex items-center justify-center text-xl font-bold shadow-md">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{badgeInfo.currentBadge.name}</h3>
                <p className="text-xs text-gray-500">
                  {badgeInfo.nextBadge
                    ? `${badgeInfo.hoursNeeded} more hours to unlock ${badgeInfo.nextBadge.name}`
                    : 'Maximum rank level reached!'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Progress to next rank</span>
              <span>{badgeInfo.progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${badgeInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Action & Calendar Sync Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Google Calendar Sync</span>
            <h3 className="font-bold text-gray-900 text-sm mt-2">Export Upcoming Shifts</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Generate pre-filled Google Calendar event links for your registered volunteer shifts.
            </p>
          </div>

          <button
            onClick={() => openAllUpcomingInCalendar(upcomingShifts)}
            disabled={upcomingShifts.length === 0}
            className="w-full py-2.5 mt-4 bg-purple-50 hover:bg-purple-100 text-brand-700 rounded-2xl text-xs font-bold border border-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" /> Add All Upcoming Shifts ({upcomingShifts.length})
          </button>
        </div>
      </div>

      {/* Upcoming Shifts Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-gray-900 text-base">Upcoming Shifts ({upcomingShifts.length})</h2>
          </div>
          {upcomingShifts.length > 0 && (
            <button
              onClick={() => openAllUpcomingInCalendar(upcomingShifts)}
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Sync to Google Calendar
            </button>
          )}
        </div>

        {upcomingShifts.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            You have no upcoming registered shifts. Browse Discover to register!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingShifts.map((opp) => {
              const gcalUrl = createGoogleCalendarUrl(opp);
              return (
                <div
                  key={opp.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-600 mb-1">
                      <span>{opp.org_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-brand-700 text-[10px]">
                        {opp.duration_hours} Hours
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm">{opp.title}</h4>

                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{opp.date} ({opp.start_time} - {opp.end_time})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{opp.location_address || opp.location_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Add to Google Calendar
                    </a>

                    <button
                      onClick={() => handleUnsign(opp.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Unsign / Quit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Opportunities Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-brand-600 fill-current" />
            <h2 className="font-bold text-gray-900 text-base">Saved Opportunities ({savedOpportunities.length})</h2>
          </div>
        </div>

        {savedOpportunities.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            No saved opportunities yet. Click the bookmark icon on any opportunity card to save it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedOpportunities.map((opp) => (
              <div key={opp.id} className="p-4 rounded-2xl border border-gray-100 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-brand-600">{opp.org_name}</span>
                    <button
                      onClick={() => handleRemoveSaved(opp.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs mb-2">{opp.title}</h4>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    <span>{opp.date}</span>
                    <span>•</span>
                    <span>{opp.duration_hours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shift History Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-gray-900 text-base">Shift History</h2>
          </div>
        </div>

        {shiftHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            No past completed shifts recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {shiftHistory.map(({ attendance: att, opportunity: opp }) => (
              <div key={att.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-900">{opp?.title || 'Volunteer Shift'}</div>
                  <div className="text-gray-500 mt-0.5">{opp?.org_name} • {opp?.date}</div>
                  {!att.is_verified_org_at_completion && att.status === 'here' && (
                    <div className="text-[10px] text-amber-600 font-medium mt-1">
                      0 hours awarded because organization was Pending at shift completion.
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-900 text-sm">
                    {att.status === 'here' ? `+${att.hours_awarded} hrs` : '0 hrs'}
                  </span>
                  <div className="text-[10px] text-gray-400 capitalize">
                    {att.status === 'here' ? 'Completed Shift (+1)' : 'Did Not Attend'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
