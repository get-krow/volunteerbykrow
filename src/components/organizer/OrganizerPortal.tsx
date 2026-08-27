'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  Upload,
  Image,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Opportunity, OrganizerProfile, UserProfile, AttendanceRecord, RecurrenceFrequency } from '@/lib/types';
import { db, ensureUUID } from '@/lib/db';
import { useTheme } from '@/lib/theme';
import { getBadgeForHours } from '@/lib/badges';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';
import { AppleWheelPicker, AppleWheelOption } from '../ui/AppleWheelPicker';

const MONTH_OPTIONS: AppleWheelOption[] = [
  { label: 'Jan', value: '01' },
  { label: 'Feb', value: '02' },
  { label: 'Mar', value: '03' },
  { label: 'Apr', value: '04' },
  { label: 'May', value: '05' },
  { label: 'Jun', value: '06' },
  { label: 'Jul', value: '07' },
  { label: 'Aug', value: '08' },
  { label: 'Sep', value: '09' },
  { label: 'Oct', value: '10' },
  { label: 'Nov', value: '11' },
  { label: 'Dec', value: '12' },
];

const DAY_OPTIONS: AppleWheelOption[] = Array.from({ length: 31 }, (_, i) => {
  const d = (i + 1).toString().padStart(2, '0');
  return { label: d, value: d };
});

const YEAR_OPTIONS: AppleWheelOption[] = [
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
  { label: '2028', value: '2028' },
  { label: '2029', value: '2029' },
  { label: '2030', value: '2030' },
];

const HOUR_OPTIONS: AppleWheelOption[] = Array.from({ length: 12 }, (_, i) => {
  const h = (i + 1).toString().padStart(2, '0');
  return { label: h, value: h };
});

const MINUTE_OPTIONS: AppleWheelOption[] = [
  { label: '00', value: '00' },
  { label: '15', value: '15' },
  { label: '30', value: '30' },
  { label: '45', value: '45' },
];

const AMPM_OPTIONS: AppleWheelOption[] = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

const CAPACITY_OPTIONS: AppleWheelOption[] = [
  { label: 'Unlimited (No Max)', value: '' },
  { label: '1 Volunteer', value: '1' },
  { label: '2 Volunteers', value: '2' },
  { label: '3 Volunteers', value: '3' },
  { label: '5 Volunteers', value: '5' },
  { label: '10 Volunteers', value: '10' },
  { label: '15 Volunteers', value: '15' },
  { label: '20 Volunteers', value: '20' },
  { label: '25 Volunteers', value: '25' },
  { label: '30 Volunteers', value: '30' },
  { label: '50 Volunteers', value: '50' },
  { label: '75 Volunteers', value: '75' },
  { label: '100 Volunteers', value: '100' },
  { label: '250 Volunteers', value: '250' },
  { label: '500 Volunteers', value: '500' },
];

const MIN_AGE_OPTIONS: AppleWheelOption[] = [
  { label: 'All Ages (No Min)', value: '' },
  { label: '10+', value: '10' },
  { label: '12+', value: '12' },
  { label: '13+', value: '13' },
  { label: '14+', value: '14' },
  { label: '15+', value: '15' },
  { label: '16+', value: '16' },
  { label: '17+', value: '17' },
  { label: '18+', value: '18' },
  { label: '21+', value: '21' },
  { label: '25+', value: '25' },
];

const MAX_AGE_OPTIONS: AppleWheelOption[] = [
  { label: 'No Limit', value: '' },
  { label: 'Max 16', value: '16' },
  { label: 'Max 17', value: '17' },
  { label: 'Max 18', value: '18' },
  { label: 'Max 21', value: '21' },
  { label: 'Max 25', value: '25' },
  { label: 'Max 30', value: '30' },
  { label: 'Max 40', value: '40' },
  { label: 'Max 50', value: '50' },
  { label: 'Max 65', value: '65' },
];

function parseDateParts(dateStr: string) {
  const parts = (dateStr || '').split('-');
  return {
    year: parts[0] || '2026',
    month: parts[1] || '01',
    day: parts[2] || '01',
  };
}

function parseTime12(timeStr24: string) {
  const [hStr, mStr] = (timeStr24 || '09:00').split(':');
  let h = parseInt(hStr || '9', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hour12 = h.toString().padStart(2, '0');
  const minute = mStr || '00';
  return { hour: hour12, minute, ampm };
}

function formatTime24(hour12: string, minute: string, ampm: string) {
  let h = parseInt(hour12, 10);
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

interface OrganizerPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
  initialTab?: 'opportunities' | 'add' | 'attendance' | 'profile';
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({ currentUser, onLogout, initialTab = 'opportunities' }) => {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'opportunities' | 'add' | 'attendance' | 'profile'>(initialTab);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

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
        bio: 'Community volunteer organization.',
        verification_status: 'verified',
        created_at: new Date().toISOString(),
      }
    );
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppForAttendance, setSelectedOppForAttendance] = useState<Opportunity | null>(null);

  // Multi-step Add Opportunity Wizard State (Section 32 Spec)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [locationType, setLocationType] = useState<'physical' | 'online' | 'tbd'>('physical');
  const [locationAddress, setLocationAddress] = useState('');
  const [categoryId, setCategoryId] = useState('community');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [maxVolunteers, setMaxVolunteers] = useState<string>('10');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'same_volunteers' | 'different_volunteers'>('different_volunteers');
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('every_week');
  const [recurrenceCount, setRecurrenceCount] = useState<string>('8');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  // Volunteer Credential View Modal
  const [credentialUser, setCredentialUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const refreshData = () => {
    setOpportunities(db.getOpportunities());
  };

  const calculatedDuration = useMemo(() => {
    try {
      const [sH, sM] = startTime.split(':').map(Number);
      const [eH, eM] = endTime.split(':').map(Number);
      const diffMinutes = eH * 60 + eM - (sH * 60 + sM);
      const hrs = Math.max(0.5, diffMinutes / 60);
      return Math.round(hrs * 10) / 10;
    } catch (e) {
      return 3;
    }
  }, [startTime, endTime]);

  const isOrgMatch = (o: Opportunity) => {
    if (!org?.id) return false;
    const orgUUID = ensureUUID(org.id);
    return (
      o.org_id === org.id ||
      o.org_id === orgUUID ||
      ensureUUID(o.org_id) === orgUUID ||
      (o.org_name && org.org_name && o.org_name.trim().toLowerCase() === org.org_name.trim().toLowerCase())
    );
  };

  const activeOpportunities = useMemo(() => {
    const orgOpps = opportunities.filter((o) => isOrgMatch(o) && o.status === 'published');
    return orgOpps.filter((o) => !(o.recurrence_type === 'same_volunteers' && o.occurrence_number === undefined));
  }, [opportunities, org]);

  const endedOpportunities = useMemo(() => {
    return opportunities.filter((o) => isOrgMatch(o) && (o.status === 'ended' || o.status === 'cancelled'));
  }, [opportunities, org]);

  const allPublishedOpportunities = useMemo(() => {
    return opportunities.filter((o) => o.status === 'published' && !(o.recurrence_type === 'same_volunteers' && o.occurrence_number !== undefined));
  }, [opportunities]);

  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  const [selectedChildOccMap, setSelectedChildOccMap] = useState<Record<string, string>>({});
  const [showAllPlatformPosts, setShowAllPlatformPosts] = useState(false);

  const toggleExpandCard = (oppId: string) => {
    setExpandedCardIds((prev) =>
      prev.includes(oppId) ? prev.filter((id) => id !== oppId) : [...prev, oppId]
    );
  };

  const calculateAge = (dobString?: string | null): string => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} yrs` : 'N/A';
  };

  const sortedAttendanceOpportunities = useMemo(() => {
    const orgOpps = opportunities.filter((o) => isOrgMatch(o));
    const occurrenceOpps = orgOpps.filter((o) => !(o.recurrence_type === 'same_volunteers' && o.occurrence_number === undefined));
    return [...occurrenceOpps].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.start_time || '00:00'}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.start_time || '00:00'}`).getTime();
      return dateTimeA - dateTimeB;
    });
  }, [opportunities, org]);

  const validateFutureDate = (dateStr: string, startTimeStr: string): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) {
      alert('Opportunity date must be today or in the future.');
      return false;
    }
    if (dateStr === todayStr) {
      const now = new Date();
      const [sH, sM] = startTimeStr.split(':').map(Number);
      const startMinutes = sH * 60 + sM;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (startMinutes <= currentMinutes) {
        alert('Opportunity start time must be in the future.');
        return false;
      }
    }
    return true;
  };

  const handlePostOpportunity = () => {
    if (!title.trim()) {
      alert('Please enter an opportunity title.');
      return;
    }

    if (!validateFutureDate(date, startTime)) {
      setWizardStep(2);
      return;
    }

    db.saveOrganizer(org);

    db.createOpportunity({
      org_id: org.id,
      org_name: org.org_name,
      org_verification_status: org.verification_status,
      org_logo_url: org.logo_url,
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
      recurrence_frequency: isRecurring ? recurrenceFrequency : undefined,
      recurrence_count: isRecurring ? parseInt(recurrenceCount || '8') : undefined,
    });

    alert('Opportunity posted successfully!');
    setTitle('');
    setDescription('');
    setInstructions('');
    setWizardStep(1);
    refreshData();
    setTab('opportunities');
  };

  const handleEndEvent = async (oppId: string) => {
    if (confirm('End this event? Unmarked volunteers will automatically be marked Not Here, and attendance will be finalized.')) {
      await db.endEvent(oppId);
      refreshData();
      if (selectedOppForAttendance && selectedOppForAttendance.id === oppId) {
        setSelectedOppForAttendance(null);
      }
    }
  };

  const handlePermanentDeleteOpportunity = async (oppId: string) => {
    if (confirm('Are you sure you want to permanently delete this opportunity from the database?')) {
      await db.deleteOpportunity(oppId);
      refreshData();
    }
  };

  const handleClearPastOpportunities = async () => {
    if (confirm('Are you sure you want to permanently delete ALL past/ended opportunities from the database? This cannot be undone.')) {
      await db.clearPastOpportunities(org.id);
      refreshData();
    }
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setBannerUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMarkAttendance = (oppId: string, volId: string, status: 'here' | 'not_here') => {
    db.markAttendance(oppId, volId, status);
    refreshData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Verification Status */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 text-[#635BFF] flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0">
            {org.logo_url ? <img src={org.logo_url} alt={org.org_name} className="w-full h-full object-cover" /> : <Building2 className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900">{org.org_name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  org.verification_status === 'verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {org.verification_status === 'verified' ? '✓ Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {org.no_hq ? (
                <span>🌐 Virtual / Remote (No Physical HQ)</span>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    (org.hq_address ? org.hq_address + ', ' : '') + org.hq_city + ', ' + org.hq_province_state + ', ' + org.hq_country
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#635BFF] hover:underline font-semibold flex items-center gap-1"
                >
                  {org.hq_address ? `${org.hq_address}, ${org.hq_city}` : `${org.hq_city}, ${org.hq_province_state}`} (View on Google Maps)
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: OUR OPPORTUNITIES (Section 30 & 31 Spec) */}
      {tab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-extrabold text-base text-gray-900">
                Active Opportunities ({activeOpportunities.length})
              </h2>
              <button
                onClick={() => setTab('add')}
                className="px-3.5 py-1.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Opportunity
              </button>
            </div>

            {activeOpportunities.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="text-2xl">📋</div>
                <p className="text-xs text-gray-500 font-medium">You have no active opportunities posted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-purple-200 shadow-2xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#635BFF] bg-purple-50 px-2 py-0.5 rounded-full">
                          {opp.category_id.replace('_', ' ')}
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-sm mt-1">{opp.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedOppForAttendance(opp);
                            setTab('attendance');
                          }}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#635BFF] rounded-lg text-xs font-bold"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => handlePermanentDeleteOpportunity(opp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Permanently Delete Opportunity from Database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Date: <strong>{opp.date}</strong> ({opp.start_time} - {opp.end_time})</div>
                      <div>Duration: <strong>{opp.duration_hours} Hours</strong></div>
                      <div>
                        Registered: <strong>{opp.registered_count || 0} / {opp.max_volunteers || 'Unlimited'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform-Wide Posts Manager & Cleanup Section */}
          <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <span>🌐</span> All Published Opportunities on Volunteer Feed ({allPublishedOpportunities.length})
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Easily delete any unwanted, stray, or test opportunities showing up on the volunteer page.
                </p>
              </div>
              <button
                onClick={() => setShowAllPlatformPosts(!showAllPlatformPosts)}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-purple-50 text-xs font-bold text-gray-700 rounded-xl transition-all"
              >
                {showAllPlatformPosts ? 'Hide Platform Posts' : 'Manage All Platform Posts'}
              </button>
            </div>

            {showAllPlatformPosts && (
              <div className="space-y-3 pt-2">
                {allPublishedOpportunities.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-400">No active opportunities on platform.</div>
                ) : (
                  allPublishedOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-gray-900">{opp.title}</span>
                          <span className="text-[10px] font-extrabold bg-purple-50 text-[#635BFF] px-2 py-0.5 rounded-full border border-purple-100">
                            Org: {opp.org_name || opp.org_id}
                          </span>
                          {opp.is_recurring && (
                            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                              Recurring Series ({opp.recurrence_count || 8} Occurrences)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          Date: {opp.date} ({opp.start_time} - {opp.end_time}) · ID: {opp.id}
                        </div>
                      </div>

                      <button
                        onClick={() => handlePermanentDeleteOpportunity(opp.id)}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 self-end sm:self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-STEP ADD OPPORTUNITY WIZARD (Section 32 Spec) */}
      {tab === 'add' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Post New Opportunity</h2>
              <p className="text-xs text-gray-500 font-medium">Step {wizardStep} of 6</p>
            </div>
            {wizardStep > 1 && (
              <button
                onClick={() => setWizardStep(wizardStep - 1)}
                className="text-xs font-bold text-[#635BFF] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>

          {/* Step 1: Title & Category */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title of Opportunity</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Beach Cleanup & Habitat Restoration"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="environment">Environment</option>
                  <option value="community">Community</option>
                  <option value="education">Education</option>
                  <option value="food_hunger">Food & Hunger</option>
                  <option value="health">Health</option>
                  <option value="events">Events</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              {/* Banner Image Upload & Blank Purple Banner Fallback */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700">Opportunity Banner Image</label>

                <input
                  type="file"
                  accept="image/*"
                  id="opportunity_banner_upload"
                  onChange={handleBannerFileUpload}
                  className="hidden"
                />

                {bannerUrl ? (
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-gray-200 group">
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="opportunity_banner_upload"
                        className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-xl cursor-pointer shadow-md hover:bg-gray-100"
                      >
                        Change Image
                      </label>
                      <button
                        type="button"
                        onClick={() => setBannerUrl('')}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700"
                      >
                        Remove (Use Purple Banner)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="opportunity_banner_upload"
                      className="border-2 border-dashed border-purple-200 hover:border-[#635BFF] bg-purple-50/40 hover:bg-purple-50/80 transition-all rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-xs text-gray-900">Click to Upload Banner Image</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Upload image file from device (PNG, JPG, WEBP)</span>
                    </label>

                    {/* Preview of Purple Blank Banner Fallback */}
                    <div className="h-16 w-full rounded-2xl bg-gradient-to-br from-[#635BFF] via-[#5046E5] to-[#3730A3] p-3 flex items-center justify-between text-white shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs">
                          {org.org_name ? org.org_name.charAt(0) : 'V'}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs">{org.org_name}</p>
                          <p className="text-[10px] text-purple-200">Default Purple Blank Banner (Active)</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                        Blank Purple Banner
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Or paste Image URL (Optional)</label>
                  <input
                    type="url"
                    value={bannerUrl.startsWith('data:') ? '' : bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!title.trim()) return alert('Please enter a title');
                  setWizardStep(2);
                }}
                className="w-full py-3 bg-[#635BFF] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Date & Time (Apple Wheel Pickers) */}
          {wizardStep === 2 && (() => {
            const dateParts = parseDateParts(date);
            const startTime12 = parseTime12(startTime);
            const endTime12 = parseTime12(endTime);

            const handleDateWheelChange = (key: 'month' | 'day' | 'year', val: string) => {
              const updated = { ...dateParts, [key]: val };
              setDate(`${updated.year}-${updated.month}-${updated.day}`);
            };

            const handleStartTimeChange = (key: 'hour' | 'minute' | 'ampm', val: string) => {
              const updated = { ...startTime12, [key]: val };
              setStartTime(formatTime24(updated.hour, updated.minute, updated.ampm));
            };

            const handleEndTimeChange = (key: 'hour' | 'minute' | 'ampm', val: string) => {
              const updated = { ...endTime12, [key]: val };
              setEndTime(formatTime24(updated.hour, updated.minute, updated.ampm));
            };

            return (
              <div className="space-y-5">
                {/* Date Wheel Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800">Event Date</label>
                    <span className="text-[11px] font-extrabold text-[#635BFF] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <AppleWheelPicker
                      label="Month"
                      options={MONTH_OPTIONS}
                      value={dateParts.month}
                      onChange={(v) => handleDateWheelChange('month', v)}
                    />
                    <AppleWheelPicker
                      label="Day"
                      options={DAY_OPTIONS}
                      value={dateParts.day}
                      onChange={(v) => handleDateWheelChange('day', v)}
                    />
                    <AppleWheelPicker
                      label="Year"
                      options={YEAR_OPTIONS}
                      value={dateParts.year}
                      onChange={(v) => handleDateWheelChange('year', v)}
                    />
                  </div>
                </div>

                {/* Start Time Wheel Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800">Start Time</label>
                    <span className="text-[11px] font-extrabold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {startTime12.hour}:{startTime12.minute} {startTime12.ampm}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <AppleWheelPicker
                      label="Hour"
                      options={HOUR_OPTIONS}
                      value={startTime12.hour}
                      onChange={(v) => handleStartTimeChange('hour', v)}
                    />
                    <AppleWheelPicker
                      label="Minute"
                      options={MINUTE_OPTIONS}
                      value={startTime12.minute}
                      onChange={(v) => handleStartTimeChange('minute', v)}
                    />
                    <AppleWheelPicker
                      label="AM/PM"
                      options={AMPM_OPTIONS}
                      value={startTime12.ampm}
                      onChange={(v) => handleStartTimeChange('ampm', v)}
                    />
                  </div>
                </div>

                {/* End Time Wheel Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800">End Time</label>
                    <span className="text-[11px] font-extrabold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {endTime12.hour}:{endTime12.minute} {endTime12.ampm}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <AppleWheelPicker
                      label="Hour"
                      options={HOUR_OPTIONS}
                      value={endTime12.hour}
                      onChange={(v) => handleEndTimeChange('hour', v)}
                    />
                    <AppleWheelPicker
                      label="Minute"
                      options={MINUTE_OPTIONS}
                      value={endTime12.minute}
                      onChange={(v) => handleEndTimeChange('minute', v)}
                    />
                    <AppleWheelPicker
                      label="AM/PM"
                      options={AMPM_OPTIONS}
                      value={endTime12.ampm}
                      onChange={(v) => handleEndTimeChange('ampm', v)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl text-xs text-brand-800 font-semibold flex items-center justify-between">
                  <span>Calculated Duration:</span>
                  <span className="font-black text-sm text-[#635BFF]">{calculatedDuration} Hours</span>
                </div>

                {/* Recurring Event Configuration Section */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-[#635BFF] focus:ring-[#635BFF]"
                    />
                    <span className="text-xs font-bold text-gray-900">Make this a Recurring Opportunity</span>
                  </label>

                  {isRecurring && (
                    <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-extrabold text-purple-900 mb-1.5">
                          Recurring Volunteer Structure
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-purple-100 cursor-pointer hover:border-purple-300 transition-colors">
                            <input
                              type="radio"
                              name="recurrence_type"
                              value="different_volunteers"
                              checked={recurrenceType === 'different_volunteers'}
                              onChange={() => setRecurrenceType('different_volunteers')}
                              className="mt-0.5 text-[#635BFF] focus:ring-[#635BFF]"
                            />
                            <div>
                              <div className="text-xs font-extrabold text-gray-900">○ Different volunteers</div>
                              <div className="text-[11px] text-gray-500 font-medium">Volunteers choose individual dates to sign up for. Generates separate opportunities.</div>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-purple-100 cursor-pointer hover:border-purple-300 transition-colors">
                            <input
                              type="radio"
                              name="recurrence_type"
                              value="same_volunteers"
                              checked={recurrenceType === 'same_volunteers'}
                              onChange={() => setRecurrenceType('same_volunteers')}
                              className="mt-0.5 text-[#635BFF] focus:ring-[#635BFF]"
                            />
                            <div>
                              <div className="text-xs font-extrabold text-gray-900">○ Same volunteer</div>
                              <div className="text-[11px] text-gray-500 font-medium">Volunteers commit to all occurrences when signing up for the series.</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Number of Occurrences</label>
                          <input
                            type="number"
                            min="2"
                            max="52"
                            value={recurrenceCount}
                            onChange={(e) => setRecurrenceCount(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-[#635BFF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Repeat Frequency</label>
                          <select
                            value={recurrenceFrequency}
                            onChange={(e) => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#635BFF]"
                          >
                            <option value="every_day">Every Day</option>
                            <option value="every_week">Every Week</option>
                            <option value="every_other_week">Every 2 Weeks</option>
                            <option value="every_month">Every Month</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-purple-800 bg-white p-2.5 rounded-xl border border-purple-100">
                        💡 {recurrenceType === 'different_volunteers'
                          ? `Will generate ${recurrenceCount || 8} separate weekly opportunities starting on ${date}. Volunteers can choose individual dates.`
                          : `Will generate 1 public recurring opportunity listing for ${recurrenceCount || 8} occurrences starting on ${date}. Volunteers commit to all dates.`}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (validateFutureDate(date, startTime)) {
                      setWizardStep(3);
                    }
                  }}
                  className="w-full py-3 bg-[#635BFF] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#5046E5] transition-all"
                >
                  Continue
                </button>
              </div>
            );
          })()}

          {/* Step 3: Location */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location Type</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs mb-2"
                >
                  <option value="physical">Physical Address (Google Maps)</option>
                  <option value="online">Online Event</option>
                  <option value="tbd">Location TBD</option>
                </select>

                {locationType === 'physical' && (
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. 100 W 49th Ave, Vancouver, BC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                )}
              </div>

              <button
                onClick={() => setWizardStep(4)}
                className="w-full py-3 bg-[#635BFF] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#5046E5] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 4: Capacity & Age (Apple Wheel Pickers) */}
          {wizardStep === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Max Volunteers Capacity</label>
                <p className="text-[11px] text-gray-500 mb-2">Type the maximum number of spots available (leave empty for unlimited spots):</p>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10 (Leave blank for unlimited)"
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-[#635BFF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Age Requirements</label>
                <p className="text-[11px] text-gray-500 mb-2">Type minimum and maximum age requirements (leave empty for no restriction):</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Minimum Age</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 14 (No min age)"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-[#635BFF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Maximum Age</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 99 (No max age)"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-[#635BFF] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setWizardStep(5)}
                className="w-full py-3 bg-[#635BFF] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#5046E5] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 5: Details */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what volunteers will be doing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Instructions for Volunteers</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="What to bring, dress code, parking..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <button
                onClick={() => setWizardStep(6)}
                className="w-full py-3 bg-[#635BFF] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Review Opportunity →
              </button>
            </div>
          )}

          {/* Step 6: Review & Post (Section 34 Spec) */}
          {wizardStep === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="font-extrabold text-sm text-gray-900">{title}</div>
                <div>Date: <strong>{date}</strong> ({startTime} - {endTime})</div>
                <div>Hours: <strong>{calculatedDuration} Hours</strong></div>
                <div>Capacity: <strong>{maxVolunteers || 'Unlimited'} spots</strong></div>
                <div>Location: <strong>{locationAddress || locationType}</strong></div>
              </div>

              <button
                onClick={handlePostOpportunity}
                className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider"
              >
                POST OPPORTUNITY!
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE TAP SHEET & CARDS */}
      {tab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-gray-900">Attendance Sheet & Event Cards</h2>
              <p className="text-xs text-gray-500 font-medium">Select an active event from the dropdown or expand an opportunity card below sorted by date & time.</p>
            </div>
          </div>

          {/* Top Event Select Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">Quick Select Active Event Dropdown:</label>
            <select
              value={selectedOppForAttendance?.id || ''}
              onChange={(e) => {
                const found = opportunities.find((o) => o.id === e.target.value);
                setSelectedOppForAttendance(found || null);
                if (found && !expandedCardIds.includes(found.id)) {
                  setExpandedCardIds((prev) => [...prev, found.id]);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
            >
              <option value="">Select active event...</option>
              {activeOpportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} — {o.date} ({o.start_time} - {o.end_time})
                </option>
              ))}
            </select>
          </div>

          {/* Cards for Each Opportunity (Sorted by Time & Date) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">
                Opportunity Cards (Sorted by Date & Time)
              </h3>
              <span className="text-xs text-gray-400 font-semibold">{sortedAttendanceOpportunities.length} Total Events</span>
            </div>

            {sortedAttendanceOpportunities.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No opportunities created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAttendanceOpportunities.map((opp) => {
                  const registeredVolunteers = db.getRegistrationsForOpportunity(opp.id);
                  const isExpanded = expandedCardIds.includes(opp.id) || selectedOppForAttendance?.id === opp.id;
                  const capacityText = `${registeredVolunteers.length} / ${opp.max_volunteers || 'Unlimited'} filled`;

                  return (
                    <div
                      key={opp.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'border-[#635BFF] bg-white ring-2 ring-[#635BFF]/10 shadow-md'
                          : 'border-gray-200/90 bg-white hover:border-purple-200 shadow-2xs'
                      }`}
                    >
                      {/* Card Header Info */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-purple-50/20">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#635BFF] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                              {opp.category_id.replace('_', ' ')}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                opp.status === 'ended'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {opp.status === 'ended' ? 'Ended' : 'Active'}
                            </span>
                          </div>

                          <h4 className="font-black text-base text-gray-900">{opp.title}</h4>

                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#635BFF]" /> {opp.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#635BFF]" /> {opp.start_time} - {opp.end_time} ({opp.duration_hours} hrs)
                            </span>
                            <span className="flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                              <Users className="w-3.5 h-3.5 text-[#635BFF]" /> {capacityText}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {opp.status !== 'ended' && (
                            <button
                              onClick={() => handleEndEvent(opp.id)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-colors border border-amber-200"
                            >
                              End Event
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (isExpanded) {
                                if (selectedOppForAttendance?.id === opp.id) {
                                  setSelectedOppForAttendance(null);
                                }
                                setExpandedCardIds((prev) => prev.filter((id) => id !== opp.id));
                              } else {
                                setSelectedOppForAttendance(opp);
                                setExpandedCardIds((prev) => [...prev, opp.id]);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs ${
                              isExpanded
                                ? 'bg-[#635BFF] text-white hover:bg-[#5046E5]'
                                : 'bg-purple-50 text-[#635BFF] hover:bg-purple-100 border border-purple-100'
                            }`}
                          >
                            <span>{isExpanded ? 'Hide Attendance' : 'Show Attendance'}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>

                          <button
                            onClick={() => handlePermanentDeleteOpportunity(opp.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title="Delete Opportunity from System"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Volunteer Attendance List */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 border-t border-gray-100 bg-slate-50/50 space-y-3">
                          {opp.recurrence_type === 'same_volunteers' ? (
                            (() => {
                              const childOccurrences = opportunities
                                .filter((o) => o.recurrence_series_id === opp.recurrence_series_id && o.occurrence_number !== undefined)
                                .sort((a, b) => a.date.localeCompare(b.date));

                              const activeChildId = selectedChildOccMap[opp.id] || childOccurrences[0]?.id;
                              const activeChildOpp = childOccurrences.find((c) => c.id === activeChildId) || childOccurrences[0];

                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                                    <h5 className="font-extrabold text-xs text-gray-900">
                                      Recurring Commitment Roster ({registeredVolunteers.length} Committed Volunteers)
                                    </h5>
                                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                      {childOccurrences.length} Scheduled Occurrences
                                    </span>
                                  </div>

                                  {/* Occurrence Date Selector Tabs */}
                                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200/60">
                                    {childOccurrences.map((child, idx) => (
                                      <button
                                        key={child.id}
                                        onClick={() => setSelectedChildOccMap((prev) => ({ ...prev, [opp.id]: child.id }))}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                          (activeChildOpp?.id === child.id)
                                            ? 'bg-[#635BFF] text-white shadow-xs'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50'
                                        }`}
                                      >
                                        #{idx + 1} · {child.date}
                                      </button>
                                    ))}
                                  </div>

                                  {activeChildOpp && (
                                    <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                                      <span className="font-extrabold text-purple-900">
                                        Managing Attendance for Occurrence #{activeChildOpp.occurrence_number}: {activeChildOpp.date} ({activeChildOpp.start_time} - {activeChildOpp.end_time})
                                      </span>
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        Award: +{activeChildOpp.duration_hours} hrs/shift
                                      </span>
                                    </div>
                                  )}

                                  {registeredVolunteers.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-100">
                                      No volunteers have registered for this recurring series yet.
                                    </div>
                                  ) : (
                                    <div className="space-y-2.5">
                                      {registeredVolunteers.map((reg) => {
                                        const volId = reg.volunteer_id;
                                        const volProfile = db.getProfile(volId);
                                        const volName = volProfile?.name || `Volunteer (${volId.slice(-4)})`;
                                        const volEmail = volProfile?.email || 'N/A';
                                        const volAge = calculateAge(volProfile?.dob);
                                        const volTotalHours = db.calculateVolunteerTotalHours(volId);
                                        const volBadge = getBadgeForHours(volTotalHours);
                                        const targetOppId = activeChildOpp?.id || opp.id;
                                        const attList = db.getAttendanceForOpportunity(targetOppId);
                                        const currentAtt = attList.find((a) => a.volunteer_id === volId);
                                        const currentStatus = currentAtt?.status || 'unmarked';

                                        return (
                                          <div
                                            key={volId}
                                            className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                          >
                                            <div className="space-y-0.5">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-extrabold text-xs text-gray-900">{volName}</span>
                                                <span className="px-2 py-0.5 bg-purple-50 text-[#635BFF] text-[10px] font-extrabold rounded-md border border-purple-100">
                                                  Age: {volAge}
                                                </span>
                                                <span
                                                  className="px-2 py-0.5 text-[10px] font-extrabold rounded-md border flex items-center gap-1"
                                                  style={{
                                                    backgroundColor: (volBadge.color || '#635BFF') + '15',
                                                    color: volBadge.color || '#635BFF',
                                                    borderColor: (volBadge.color || '#635BFF') + '40',
                                                  }}
                                                >
                                                  <span>🎖️</span> {volBadge.name} ({volTotalHours.toFixed(1).replace(/\.0$/, '')}h)
                                                </span>
                                              </div>
                                              <div className="text-[11px] text-gray-500 font-medium">
                                                Email: {volEmail}
                                              </div>
                                            </div>

                                            {/* Tap Attendance Buttons */}
                                            <div className="flex items-center gap-2 justify-end">
                                              <button
                                                onClick={() => handleMarkAttendance(targetOppId, volId, 'here')}
                                                className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                                                  currentStatus === 'here'
                                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                                                    : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                                }`}
                                              >
                                                {currentStatus === 'here' ? `✓ HERE (+${activeChildOpp?.duration_hours || opp.duration_hours}h)` : `HERE (+${activeChildOpp?.duration_hours || opp.duration_hours}h)`}
                                              </button>
                                              <button
                                                onClick={() => handleMarkAttendance(targetOppId, volId, 'not_here')}
                                                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                                                  currentStatus === 'not_here'
                                                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/20'
                                                    : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700'
                                                }`}
                                              >
                                                NOT HERE
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <>
                              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                                <h5 className="font-extrabold text-xs text-gray-900">
                                  Registered Volunteers for {opp.title} ({registeredVolunteers.length})
                                </h5>
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  Standard Award: +{opp.duration_hours} hrs/shift
                                </span>
                              </div>

                              {registeredVolunteers.length === 0 ? (
                                <div className="py-6 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-100">
                                  No volunteers have registered for this opportunity yet.
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {registeredVolunteers.map((reg) => {
                                    const volId = reg.volunteer_id;
                                    const volProfile = db.getProfile(volId);
                                    const volName = volProfile?.name || `Volunteer (${volId.slice(-4)})`;
                                    const volEmail = volProfile?.email || 'N/A';
                                    const volAge = calculateAge(volProfile?.dob);
                                    const volTotalHours = db.calculateVolunteerTotalHours(volId);
                                    const volBadge = getBadgeForHours(volTotalHours);
                                    const attList = db.getAttendanceForOpportunity(opp.id);
                                    const currentAtt = attList.find((a) => a.volunteer_id === volId);
                                    const currentStatus = currentAtt?.status || 'unmarked';

                                    return (
                                      <div
                                        key={volId}
                                        className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                      >
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-extrabold text-xs text-gray-900">{volName}</span>
                                            <span className="px-2 py-0.5 bg-purple-50 text-[#635BFF] text-[10px] font-extrabold rounded-md border border-purple-100">
                                              Age: {volAge}
                                            </span>
                                            <span
                                              className="px-2 py-0.5 text-[10px] font-extrabold rounded-md border flex items-center gap-1"
                                              style={{
                                                backgroundColor: (volBadge.color || '#635BFF') + '15',
                                                color: volBadge.color || '#635BFF',
                                                borderColor: (volBadge.color || '#635BFF') + '40',
                                              }}
                                            >
                                              <span>🎖️</span> {volBadge.name} ({volTotalHours.toFixed(1).replace(/\.0$/, '')}h)
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-gray-500 font-medium">
                                            Email: {volEmail}
                                          </div>
                                        </div>

                                        {/* Tap Attendance Buttons */}
                                        <div className="flex items-center gap-2 justify-end">
                                          <button
                                            onClick={() => handleMarkAttendance(opp.id, volId, 'here')}
                                            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                                              currentStatus === 'here'
                                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                                                : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                            }`}
                                          >
                                            {currentStatus === 'here' ? `✓ HERE (+${opp.duration_hours}h)` : `HERE (+${opp.duration_hours}h)`}
                                          </button>
                                          <button
                                            onClick={() => handleMarkAttendance(opp.id, volId, 'not_here')}
                                            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                                              currentStatus === 'not_here'
                                                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/20'
                                                : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700'
                                            }`}
                                          >
                                            NOT HERE
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORGANIZER PROFILE SETTINGS */}
      {tab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-gray-900">Organization Settings</h2>
            <button
              onClick={() => {
                db.setCurrentUser(null);
                if (onLogout) onLogout();
                window.location.href = '/';
              }}
              className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              db.saveOrganizer(org);
              db.updateProfile({ name: org.org_name });
              alert('Organization profile settings saved successfully!');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-gray-700 mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={org.org_name}
                onChange={(e) => setOrg({ ...org, org_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Square Checkbox for No HQ (Section 27 Spec) */}
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={org.no_hq}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      no_hq: e.target.checked,
                      hq_address: e.target.checked ? '' : org.hq_address,
                    })
                  }
                  className="w-4 h-4 text-[#635BFF] rounded border-gray-300 focus:ring-[#635BFF]"
                />
                <span className="font-bold text-gray-900">This organization does not have a physical HQ (Virtual / Remote)</span>
              </label>
              <p className="text-[11px] text-gray-500 pl-6">
                Check this box if your organization operates entirely remotely or online.
              </p>
            </div>

            {/* HQ Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Country</label>
                <select
                  value={org.hq_country || 'Canada'}
                  onChange={(e) => setOrg({ ...org, hq_country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Province / State</label>
                <input
                  type="text"
                  required
                  value={org.hq_province_state || ''}
                  onChange={(e) => setOrg({ ...org, hq_province_state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={org.hq_city || ''}
                  onChange={(e) => setOrg({ ...org, hq_city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            {!org.no_hq ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">HQ Street Address</label>
                  {org.hq_address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        org.hq_address + ', ' + org.hq_city + ', ' + org.hq_province_state + ', ' + org.hq_country
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#635BFF] hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" /> View on Google Maps
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={org.hq_address || ''}
                  onChange={(e) => setOrg({ ...org, hq_address: e.target.value })}
                  placeholder="e.g. 1428 Charles St, Vancouver, BC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200/60 rounded-xl text-[11px] text-gray-500 font-medium">
                🌐 Address disabled because "No Physical HQ (Virtual / Remote)" is selected.
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-1">Organization Bio</label>
              <textarea
                rows={3}
                value={org.bio || ''}
                onChange={(e) => setOrg({ ...org, bio: e.target.value })}
                placeholder="Describe your organization's mission and community goals..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Save Organization Settings
            </button>
          </form>

          {/* Help & Support / Contact Us Section */}
          <div className="pt-4 border-t border-purple-100">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#635BFF]" /> Need Assistance or Verification Support?
                </h4>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Contact Krow support regarding organization verification requests, account help, or general inquiries.
                </p>
              </div>
              <a
                href="/contact"
                className="px-4 py-2 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1 flex-shrink-0"
              >
                Contact Us →
              </a>
            </div>
          </div>

          {/* Section 50 & 39 Spec: Delete Account Button */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="font-extrabold text-xs text-red-600 uppercase tracking-wider">Danger Zone</h3>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors"
            >
              Delete Organization Account
            </button>
          </div>
        </div>
      )}

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userId={currentUser.id}
        userName={org.org_name}
      />
    </div>
  );
};
