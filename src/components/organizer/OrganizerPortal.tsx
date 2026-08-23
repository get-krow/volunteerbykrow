'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Check,
  X,
  User,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  LogOut,
  Save,
} from 'lucide-react';
import { Opportunity, OrganizerProfile, UserProfile, AttendanceRecord } from '@/lib/types';
import { db } from '@/lib/db';
import { getBadgeForHours } from '@/lib/badges';

interface OrganizerPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({ currentUser, onLogout }) => {
  const [tab, setTab] = useState<'opportunities' | 'add' | 'attendance' | 'profile'>('opportunities');

  // Organizer info
  const [org, setOrg] = useState<OrganizerProfile>(() => {
    return (
      db.getOrganizer(currentUser.id) || {
        id: currentUser.id,
        org_name: currentUser.name || 'My Organization',
        hq_country: 'Canada',
        hq_province_state: 'BC',
        hq_city: 'Vancouver',
        hq_address: '1428 Charles St, Vancouver, BC',
        no_hq: false,
        bio: 'Partnering with community volunteers across Metro Vancouver.',
        verification_status: 'verified',
        created_at: new Date().toISOString(),
      }
    );
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => db.getOpportunities());
  const [selectedOppForAttendance, setSelectedOppForAttendance] = useState<Opportunity | null>(null);

  // Add Opportunity Form State
  const [title, setTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [locationType, setLocationType] = useState<'physical' | 'online' | 'tbd'>('physical');
  const [locationAddress, setLocationAddress] = useState('1428 Charles St, Vancouver, BC');
  const [categoryId, setCategoryId] = useState('community');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [maxVolunteers, setMaxVolunteers] = useState<string>('10');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'same_volunteers' | 'different_volunteers'>('different_volunteers');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  // Volunteer Credential View Modal
  const [credentialUser, setCredentialUser] = useState<UserProfile | null>(null);

  const refreshData = () => {
    setOpportunities(db.getOpportunities());
  };

  // Calculate duration in hours automatically per specification #37
  const calculatedDuration = useMemo(() => {
    try {
      const [sH, sM] = startTime.split(':').map(Number);
      const [eH, eM] = endTime.split(':').map(Number);
      const diffMinutes = eH * 60 + eM - (sH * 60 + sM);
      const hrs = Math.max(0.5, diffMinutes / 60);
      return Math.round(hrs * 10) / 10;
    } catch (e) {
      return 4;
    }
  }, [startTime, endTime]);

  const activeOpportunities = useMemo(() => {
    return opportunities.filter((o) => o.org_id === org.id && o.status === 'published');
  }, [opportunities, org.id]);

  const endedOpportunities = useMemo(() => {
    return opportunities.filter((o) => o.org_id === org.id && (o.status === 'ended' || o.status === 'cancelled'));
  }, [opportunities, org.id]);

  const handlePostOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an opportunity title.');
      return;
    }

    db.createOpportunity({
      org_id: org.id,
      title,
      description,
      instructions,
      category_id: categoryId,
      banner_url: bannerUrl || undefined,
      date,
      start_time: startTime,
      end_time: endTime,
      duration_hours: calculatedDuration,
      location_type: locationType,
      location_address: locationType === 'physical' ? locationAddress : undefined,
      min_age: minAge ? parseInt(minAge) : null,
      max_age: maxAge ? parseInt(maxAge) : null,
      max_volunteers: maxVolunteers ? parseInt(maxVolunteers) : null,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : undefined,
    });

    alert('Opportunity posted successfully!');
    setTitle('');
    setDescription('');
    setInstructions('');
    refreshData();
    setTab('opportunities');
  };

  const handleSoftDelete = (oppId: string) => {
    if (confirm('Are you sure you want to cancel this opportunity? Registered volunteers will be notified.')) {
      db.cancelOpportunity(oppId);
      refreshData();
    }
  };

  const handleMarkAttendance = (oppId: string, volId: string, status: 'here' | 'not_here') => {
    db.markAttendance(oppId, volId, status);
    refreshData();
  };

  const handleEndEvent = (oppId: string) => {
    if (confirm('End this event? Unmarked volunteers will automatically be marked Not Here, and attendance will be finalized.')) {
      db.endEvent(oppId);
      refreshData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Organizer Header & Verification Status Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 text-brand-700 flex items-center justify-center font-bold text-xl overflow-hidden">
            {org.logo_url ? <img src={org.logo_url} alt={org.org_name} className="w-full h-full object-cover" /> : <Building2 className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{org.org_name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  org.verification_status === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {org.verification_status === 'verified' ? 'Verified Org' : 'Pending Org'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {org.no_hq ? 'No Physical HQ' : `${org.hq_city}, ${org.hq_province_state}, ${org.hq_country}`}
            </p>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setTab('opportunities')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'opportunities' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Our Opportunities
          </button>
          <button
            onClick={() => setTab('add')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'add' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Opportunity
          </button>
          <button
            onClick={() => setTab('attendance')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'attendance' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'profile' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* TAB 1: OUR OPPORTUNITIES */}
      {tab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
              Active / Upcoming Opportunities ({activeOpportunities.length})
            </h2>

            {activeOpportunities.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                You have no active opportunities posted. Click "Add Opportunity" to post one!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 shadow-sm transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {opp.category_id.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm mt-1">{opp.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedOppForAttendance(opp);
                            setTab('attendance');
                          }}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-brand-700 rounded-lg text-xs font-semibold"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => handleSoftDelete(opp.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                          title="Soft Delete / Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Date: <strong>{opp.date}</strong> ({opp.start_time} - {opp.end_time})</div>
                      <div>Duration: <strong>{opp.duration_hours} Hours</strong></div>
                      <div>
                        Capacity:{' '}
                        <strong>
                          {opp.registered_count || 0} / {opp.max_volunteers || 'Unlimited'} spots filled
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ended Opportunities Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
              Ended / Past Opportunities ({endedOpportunities.length})
            </h2>

            {endedOpportunities.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">No past opportunities recorded.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {endedOpportunities.map((opp) => (
                  <div key={opp.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{opp.title}</div>
                      <div className="text-gray-500">{opp.date} • {opp.duration_hours}h</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold uppercase text-[10px]">
                      {opp.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADD OPPORTUNITY */}
      {tab === 'add' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card max-w-3xl mx-auto space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Post New Volunteer Opportunity</h2>
            <p className="text-xs text-gray-500">
              Hours are automatically calculated from start and end times ({calculatedDuration} hours).
            </p>
          </div>

          <form onSubmit={handlePostOpportunity} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title of Post</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Food Sorting & Hamper Assembly"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Opportunity</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl text-xs text-brand-800 font-medium">
              Calculated Duration: <strong>{calculatedDuration} Hours</strong> (Default volunteer hour value)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                >
                  <option value="community">Community</option>
                  <option value="environment">Environment</option>
                  <option value="food_hunger">Food & Hunger</option>
                  <option value="education">Education</option>
                  <option value="technology">Technology</option>
                  <option value="events">Events</option>
                  <option value="sports">Sports</option>
                  <option value="health">Health</option>
                  <option value="animals">Animals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Volunteers (Capacity)</label>
                <input
                  type="number"
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                  placeholder="e.g. 10 (Leave blank for unlimited)"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Age Range bounds */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Age (Optional)</label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="e.g. 14"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Maximum Age (Optional)</label>
                <input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location Type</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 mb-2"
              >
                <option value="physical">Physical Address (Google Maps)</option>
                <option value="online">Online</option>
                <option value="tbd">Location TBD</option>
              </select>

              {locationType === 'physical' && (
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Google Maps location or street address"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Banner Image URL (Optional)</label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what volunteers will be doing..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Instructions for Volunteers</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Dress code, parking instructions, what to bring..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all uppercase tracking-wider"
            >
              POST!
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {tab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Attendance Management Sheet</h2>
            {selectedOppForAttendance && (
              <button
                onClick={() => handleEndEvent(selectedOppForAttendance.id)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                End Event
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-700">Select Opportunity to Manage Attendance:</label>
            <select
              value={selectedOppForAttendance?.id || ''}
              onChange={(e) => {
                const found = opportunities.find((o) => o.id === e.target.value);
                setSelectedOppForAttendance(found || null);
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select an active opportunity...</option>
              {activeOpportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} — {o.date}
                </option>
              ))}
            </select>

            {selectedOppForAttendance ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-purple-50 rounded-2xl flex items-center justify-between text-xs text-brand-900 font-medium">
                  <div>
                    <strong>{selectedOppForAttendance.title}</strong> | Date: {selectedOppForAttendance.date}
                  </div>
                  <span>{selectedOppForAttendance.duration_hours} Hours</span>
                </div>

                <div className="space-y-2">
                  {/* Mock Registered Volunteers List */}
                  {[
                    { id: 'vol-1', name: 'Alex Chen', age: 20, city: 'Coquitlam', hours: 45, shifts: 8 },
                    { id: 'vol-2', name: 'Jordan Smith', age: 19, city: 'Vancouver', hours: 12, shifts: 3 },
                  ].map((vol) => {
                    const attList = db.getAttendanceForOpportunity(selectedOppForAttendance.id);
                    const currentAtt = attList.find((a) => a.volunteer_id === vol.id);
                    const currentStatus = currentAtt?.status || 'unmarked';
                    const badge = getBadgeForHours(vol.hours);

                    return (
                      <div
                        key={vol.id}
                        className="p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between text-xs bg-gray-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setCredentialUser({
                                id: vol.id,
                                role: 'volunteer',
                                email: 'volunteer@example.com',
                                name: vol.name,
                                city: vol.city,
                                country: 'Canada',
                                province_state: 'BC',
                                created_at: new Date().toISOString(),
                              })
                            }
                            className="font-bold text-gray-900 hover:text-brand-600 flex items-center gap-1.5"
                          >
                            <span>{vol.name}</span>
                            <span className="text-[10px] font-semibold text-brand-600 bg-purple-100 px-2 py-0.5 rounded-full">
                              {badge.name}
                            </span>
                          </button>
                        </div>

                        {/* Immediate [Here] [Not Here] Actions per spec #51 */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkAttendance(selectedOppForAttendance.id, vol.id, 'here')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                              currentStatus === 'here'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50'
                            }`}
                          >
                            Here
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(selectedOppForAttendance.id, vol.id, 'not_here')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                              currentStatus === 'not_here'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-red-50'
                            }`}
                          >
                            Not Here
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                Select an active opportunity above to manage volunteer attendance sheets.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORGANIZER PROFILE SETTINGS */}
      {tab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900">Organization Settings</h2>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Organization profile updated.');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={org.org_name}
                onChange={(e) => setOrg({ ...org, org_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">HQ Street Address / Location</label>
              <input
                type="text"
                value={org.hq_address || ''}
                onChange={(e) => setOrg({ ...org, hq_address: e.target.value })}
                placeholder="1428 Charles St, Vancouver, BC"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Organization Bio</label>
              <textarea
                rows={3}
                value={org.bio || ''}
                onChange={(e) => setOrg({ ...org, bio: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-md shadow-brand-500/20"
            >
              Save Organization Settings
            </button>
          </form>
        </div>
      )}

      {/* Volunteer Credential Inspector Modal per spec #53 */}
      {credentialUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setCredentialUser(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
                {credentialUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{credentialUser.name}</h3>
                <span className="text-xs text-brand-600 font-semibold">
                  {getBadgeForHours(45).name}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div>City / Area: <strong>{credentialUser.city}, {credentialUser.province_state}</strong></div>
              <div>Total Awarded Volunteer Hours: <strong>45 hrs</strong></div>
              <div>Completed Shifts: <strong>8 shifts</strong></div>
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-800 text-[10px]">
                Note: Volunteer exact address is never exposed to organizers per Krow privacy policy.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
