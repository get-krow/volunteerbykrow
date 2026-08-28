'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  UserMinus,
} from 'lucide-react';
import { UserProfile, Opportunity, Registration, AttendanceRecord } from '@/lib/types';
import { db } from '@/lib/db';
import { getNextBadgeInfo, getBadgeForHours } from '@/lib/badges';
import { generateVolunteerHoursReport } from '@/lib/pdf-report';
import { createGoogleCalendarUrl, openAllUpcomingInCalendar } from '@/lib/google-calendar';

interface VolunteerDashboardProps {
  currentUser: UserProfile;
  onOpenAuth: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ currentUser }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    refreshData();
    db.syncWithSupabase().then(() => refreshData());
  }, [currentUser]);

  const refreshData = () => {
    setRegistrations(db.getVolunteerRegistrations(currentUser.id));
    setOpportunities(db.getOpportunities());
    setSavedIds(db.getSavedOpportunityIds());
    setAttendance(db.getVolunteerAttendance(currentUser.id));
  };

  const totalHours = useMemo(() => {
    return db.calculateVolunteerTotalHours(currentUser.id);
  }, [attendance, currentUser.id]);

  const completedShiftsCount = useMemo(() => {
    return db.calculateVolunteerCompletedShifts(currentUser.id);
  }, [attendance, currentUser.id]);

  const currentBadge = useMemo(() => getBadgeForHours(totalHours), [totalHours]);
  const badgeInfo = useMemo(() => getNextBadgeInfo(totalHours), [totalHours]);

  const upcomingRegisteredOpps = useMemo(() => {
    const activeRegs = registrations.filter((r) => r.status === 'registered');
    const regSet = new Set(activeRegs.map((r) => r.opportunity_id));
    const todayStr = new Date().toISOString().split('T')[0];
    return opportunities
      .filter((o) => regSet.has(o.id) && o.status === 'published' && o.date >= todayStr)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [opportunities, registrations]);

  const savedOpportunities = useMemo(() => {
    const savedSet = new Set(savedIds);
    return opportunities.filter((o) => savedSet.has(o.id) && o.status === 'published');
  }, [opportunities, savedIds]);

  const handleUnsign = (oppId: string) => {
    if (confirm('Are you sure you want to unsign from this opportunity? Your spot will be made available to others.')) {
      const res = db.unsignFromOpportunity(oppId, currentUser.id);
      alert(res.message);
      refreshData();
    }
  };

  const handleGenerateReport = async () => {
    await generateVolunteerHoursReport(currentUser, totalHours, completedShiftsCount, currentBadge);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Greeting Header (Section 17 Spec) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Good day, {currentUser.name || 'Volunteer'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Keep making an impact in your community.</p>
      </div>

      {/* Hours Hero Card & Badge Progression Card (Section 17 & 18 Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Total Volunteer Hours Hero Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#635BFF] to-[#4F46E5] rounded-3xl p-6 text-white shadow-lg shadow-purple-500/15 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">Total Awarded</span>
            <h2 className="text-5xl font-black tracking-tight">{totalHours}</h2>
            <p className="text-xs font-semibold text-purple-100">Volunteer Hours</p>
          </div>

          <button
            onClick={handleGenerateReport}
            className="mt-6 w-full py-2.5 bg-white/15 hover:bg-white/25 active:scale-[0.99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all"
          >
            <Download className="w-4 h-4" /> Download Hours Report
          </button>
        </div>

        {/* Badge Progression & Completed Shifts Stat Card (Section 19 & 20 Spec) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#635BFF]" />
                <span className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">{currentBadge.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-500">
                {totalHours} / {badgeInfo.nextBadge ? badgeInfo.nextBadge.min_hours : totalHours} hours
              </span>
            </div>

            {/* Badge Progress Bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#635BFF] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, badgeInfo.progressPercent))}%` }}
              />
            </div>

            <p className="text-xs font-medium text-gray-500">
              {badgeInfo.nextBadge
                ? `${badgeInfo.hoursNeeded} hours until ${badgeInfo.nextBadge.name}`
                : 'Highest badge level achieved!'}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500">Completed Shifts</div>
              <div className="text-2xl font-black text-gray-900">{completedShiftsCount}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-gray-400 block">Attended shifts marked HERE</span>
              <span className="text-xs font-bold text-[#635BFF]">Verified & Pending Orgs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 21 Spec: Upcoming Registered Shifts */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-extrabold text-base text-gray-900">Upcoming Registered Shifts</h2>
          {upcomingRegisteredOpps.length > 0 && (
            <button
              onClick={() => openAllUpcomingInCalendar(upcomingRegisteredOpps)}
              className="text-xs font-bold text-[#635BFF] hover:underline flex items-center gap-1"
            >
              Add All to Calendar →
            </button>
          )}
        </div>

        {upcomingRegisteredOpps.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-2xl">🗓️</div>
            <p className="text-xs text-gray-500 font-medium">You have no upcoming volunteer shifts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              // Group same_volunteers series together
              const seriesMap = new Map<string, Opportunity[]>();
              const standaloneOpps: Opportunity[] = [];

              upcomingRegisteredOpps.forEach((opp) => {
                if (opp.recurrence_type === 'same_volunteers' && opp.recurrence_series_id) {
                  const existing = seriesMap.get(opp.recurrence_series_id) || [];
                  seriesMap.set(opp.recurrence_series_id, [...existing, opp]);
                } else if (opp.occurrence_number === undefined) {
                  standaloneOpps.push(opp);
                }
              });

              return (
                <>
                  {/* Recurring Series Group Cards */}
                  {Array.from(seriesMap.entries()).map(([seriesId, seriesOpps]) => {
                    const mainOpp = seriesOpps.find((o) => o.occurrence_number === undefined) || seriesOpps[0];
                    const allChildOpps = opportunities.filter((o) => o.recurrence_series_id === seriesId && o.occurrence_number !== undefined);
                    const totalOccurrences = mainOpp.recurrence_count || allChildOpps.length || 1;
                    const completedOccurrences = allChildOpps.filter((o) => {
                      const att = attendance.find((a) => a.opportunity_id === o.id && a.status === 'here');
                      return !!att;
                    }).length;

                    return (
                      <div
                        key={seriesId}
                        className="p-5 rounded-2xl border border-purple-200/90 bg-gradient-to-r from-purple-50/60 via-white to-purple-50/30 space-y-3 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-purple-600 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                Recurring Commitment
                              </span>
                              <span className="font-extrabold text-xs text-purple-900">
                                {completedOccurrences} / {totalOccurrences} completed
                              </span>
                            </div>
                            <h4 className="font-black text-base text-gray-900">{mainOpp.title}</h4>
                            <p className="text-xs font-semibold text-gray-600">{mainOpp.org_name} · {formatDate(mainOpp.series_start_date || mainOpp.date)} – {formatDate(mainOpp.series_end_date || mainOpp.date)}</p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleUnsign(mainOpp.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Leave Series</span>
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-gray-700">
                            <span>Series Progress</span>
                            <span>{Math.round((completedOccurrences / totalOccurrences) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#635BFF] to-purple-600 transition-all duration-300"
                              style={{ width: `${Math.min(100, (completedOccurrences / totalOccurrences) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Expandable Occurrences Breakdown */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-gray-700 block mb-2">Scheduled Occurrences:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {allChildOpps.sort((a,b) => a.date.localeCompare(b.date)).map((cOpp, idx) => {
                              const att = attendance.find((a) => a.opportunity_id === cOpp.id);
                              const isHere = att?.status === 'here';
                              const isNotHere = att?.status === 'not_here';

                              return (
                                <div
                                  key={cOpp.id}
                                  className="p-2.5 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between text-xs shadow-2xs"
                                >
                                  <div>
                                    <div className="font-extrabold text-gray-900">
                                      #{idx + 1} · {formatDate(cOpp.date)}
                                    </div>
                                    <div className="text-[10px] text-gray-500">{cOpp.start_time} - {cOpp.end_time}</div>
                                  </div>

                                  {isHere ? (
                                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                      ✓ Completed (+{cOpp.duration_hours}h)
                                    </span>
                                  ) : isNotHere ? (
                                    <span className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                                      Absent (0h)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Standalone / Different Volunteers Cards */}
                  {standaloneOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-200 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-extrabold text-sm text-gray-900 truncate">{opp.title}</div>
                        <div className="text-xs font-semibold text-gray-600">{opp.org_name}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatDate(opp.date)} · {opp.start_time}</span>
                          <span>{opp.duration_hours} hours</span>
                          <span className="truncate">{opp.location_address || 'Location TBD'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={createGoogleCalendarUrl(opp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#635BFF]" />
                          <span>Calendar</span>
                        </a>
                        <button
                          onClick={() => handleUnsign(opp.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Leave Event"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Leave Event</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Section 22 Spec: Volunteer History & Saved Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Opportunities */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
          <h2 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">
            Saved Opportunities ({savedOpportunities.length})
          </h2>
          {savedOpportunities.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">No saved opportunities.</div>
          ) : (
            <div className="space-y-2">
              {savedOpportunities.map((opp) => (
                <div key={opp.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900 truncate max-w-[200px]">{opp.title}</div>
                    <div className="text-gray-500">{formatDate(opp.date)} · {opp.duration_hours}h</div>
                  </div>
                  <span className="font-extrabold text-[#635BFF]">{opp.duration_hours} hrs</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shift History */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
          <h2 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">
            Shift History
          </h2>
          {(() => {
            const shiftHistoryList = attendance.filter((a) => a.opportunity_id !== 'admin-adjustment');
            if (shiftHistoryList.length === 0) {
              return <div className="py-6 text-center text-xs text-gray-400">No shift history recorded yet.</div>;
            }
            return (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {shiftHistoryList.map((att) => {
                  const opp = opportunities.find((o) => o.id === att.opportunity_id);
                  const title = att.opportunity_title || opp?.title || 'Volunteer Shift';
                  return (
                    <div key={att.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{title}</div>
                        <div className="text-gray-500">{att.marked_at ? att.marked_at.split('T')[0] : 'Past'}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600 block">
                          {att.status === 'here' ? `+${att.hours_awarded} hrs` : 'Did Not Attend'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {att.is_verified_org_at_completion ? 'Verified Org' : 'Pending Org (0 hrs)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
