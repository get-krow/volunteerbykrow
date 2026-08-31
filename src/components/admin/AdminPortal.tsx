'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Search,
  Edit3,
  Lock,
  RefreshCw,
  Plus,
  Trash2,
  MessageSquare,
  Mail,
  Clock,
  Building2,
  HelpCircle,
  Flag,
  FileText,
  UserCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Info,
  Globe,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import {
  OrganizerProfile,
  UserProfile,
  AttendanceRecord,
  HourAuditLog,
  Category,
  ContactMessage,
  VerificationStatus,
  OrgVerificationCheck,
  OrgVerificationHistoryItem,
  OrgAdminNote,
  OrganizationReport,
} from '@/lib/types';
import { db } from '@/lib/db';

const CHECKLIST_ITEMS = [
  { id: 'org_info', label: 'Organization information reviewed' },
  { id: 'registration', label: 'Organization registration reviewed' },
  { id: 'website', label: 'Website reviewed' },
  { id: 'contact', label: 'Contact information reviewed' },
  { id: 'email_verified', label: 'Organization email verified' },
  { id: 'affiliation', label: 'Representative affiliation reviewed' },
  { id: 'public_presence', label: 'Public presence reviewed' },
  { id: 'volunteer_activity', label: 'Volunteer activity reviewed' },
  { id: 'safety_concerns', label: 'No obvious safety concerns identified' },
];

const FREE_EMAIL_PROVIDERS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com'];

export const AdminPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'verify' | 'reports' | 'hours' | 'categories' | 'messages' | 'reset'>('verify');

  // System Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // State
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>(() => db.getOrganizers());
  const [orgSearch, setOrgSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('all');

  // Review Modal State
  const [selectedOrg, setSelectedOrg] = useState<OrganizerProfile | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [activeActionModal, setActiveActionModal] = useState<'request_info' | 'reject' | 'suspend' | 'revoke' | null>(null);
  const [newAdminNote, setNewAdminNote] = useState('');

  // Reports State
  const [reports, setReports] = useState<OrganizationReport[]>(() => db.getReports());
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'actioned' | 'dismissed'>('all');

  // Volunteer Hours Editor State
  const [volunteers, setVolunteers] = useState<UserProfile[]>(() => db.getVolunteers());
  const [volSearch, setVolSearch] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<UserProfile | null>(null);
  const [newHoursInput, setNewHoursInput] = useState('');
  const [auditReason, setAuditReason] = useState('');

  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [newCategoryName, setNewCategoryName] = useState('');

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>(() => db.getContactMessages());
  const [msgSearch, setMsgSearch] = useState('');

  const refreshData = () => {
    setOrganizers([...db.getOrganizers()]);
    setCategories([...db.getCategories()]);
    setVolunteers([...db.getVolunteers()]);
    setMessages([...db.getContactMessages()]);
    setReports([...db.getReports()]);
  };

  useEffect(() => {
    refreshData();
    db.syncWithSupabase().then(() => refreshData());
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    if (
      adminPass === 'Vasquez098!' ||
      adminPass === 'krow-super-secret-admin-pass-2026' ||
      adminPass === 'krowadmin2026'
    ) {
      setIsAuthenticated(true);
    } else {
      setPassError('Invalid admin security credentials.');
    }
  };

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      if (orgSearch.trim()) {
        const q = orgSearch.toLowerCase();
        const matchName = org.org_name.toLowerCase().includes(q) || (org.legal_name || '').toLowerCase().includes(q);
        const matchCity = (org.hq_city || '').toLowerCase().includes(q);
        if (!matchName && !matchCity) return false;
      }
      if (orgFilter !== 'all') {
        const status = org.verification_status || 'UNVERIFIED';
        if (orgFilter === 'pending' && status !== 'PENDING_REVIEW' && status !== 'pending') return false;
        if (orgFilter === 'verified' && status !== 'VERIFIED' && status !== 'verified') return false;
        if (orgFilter === 'more_info' && status !== 'MORE_INFORMATION_REQUIRED') return false;
        if (orgFilter === 'suspended' && status !== 'SUSPENDED') return false;
        if (orgFilter === 'revoked' && status !== 'REVOKED') return false;
        if (orgFilter === 'rejected' && status !== 'REJECTED') return false;
        if (orgFilter === 'unverified' && status !== 'UNVERIFIED') return false;
      }
      return true;
    });
  }, [organizers, orgSearch, orgFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportFilter !== 'all' && r.status !== reportFilter) return false;
      return true;
    });
  }, [reports, reportFilter]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((vol) => {
      if (!volSearch.trim()) return true;
      const q = volSearch.toLowerCase();
      return (vol.name || '').toLowerCase().includes(q) || (vol.email || '').toLowerCase().includes(q);
    });
  }, [volunteers, volSearch]);

  const handleApproveOrg = async (orgId: string) => {
    await db.updateVerificationStatusAdvanced(orgId, 'VERIFIED', 'krow-admin', 'Verified after administrative review of signals.');
    refreshData();
    if (selectedOrg && selectedOrg.id === orgId) {
      setSelectedOrg(db.getOrganizer(orgId) || null);
    }
  };

  const handleExecuteStatusAction = async () => {
    if (!selectedOrg || !activeActionModal) return;
    if (!actionReason.trim()) {
      alert('Please provide a reason or note for this action.');
      return;
    }

    let targetStatus: VerificationStatus = 'MORE_INFORMATION_REQUIRED';
    if (activeActionModal === 'reject') targetStatus = 'REJECTED';
    if (activeActionModal === 'suspend') targetStatus = 'SUSPENDED';
    if (activeActionModal === 'revoke') targetStatus = 'REVOKED';

    await db.updateVerificationStatusAdvanced(selectedOrg.id, targetStatus, 'krow-admin', actionReason);
    refreshData();
    setSelectedOrg(db.getOrganizer(selectedOrg.id) || null);
    setActiveActionModal(null);
    setActionReason('');
  };

  const handleToggleChecklist = (orgId: string, checkType: string, currentVal: boolean) => {
    db.toggleVerificationCheck(orgId, checkType, !currentVal, 'krow-admin');
    refreshData();
  };

  const handleAddNote = (orgId: string) => {
    if (!newAdminNote.trim()) return;
    db.addAdminNote(orgId, 'krow-admin', newAdminNote, 'Krow Admin');
    setNewAdminNote('');
    refreshData();
  };

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'suspend' | 'revoke' | 'actioned') => {
    db.resolveReport(reportId, action, 'krow-admin');
    refreshData();
  };

  const computeRiskFlags = (org: OrganizerProfile) => {
    const flags: string[] = [];
    if (!org.website) flags.push('No organization website provided');
    if (org.website && org.representative?.email) {
      const emailDomain = org.representative.email.split('@')[1]?.toLowerCase();
      if (emailDomain && FREE_EMAIL_PROVIDERS.includes(emailDomain)) {
        flags.push(`Free email provider used (${emailDomain}) instead of org domain`);
      }
      if (org.email_domain && emailDomain && !emailDomain.includes(org.email_domain)) {
        flags.push(`Domain mismatch (Website: ${org.email_domain} vs Email: ${emailDomain})`);
      }
    }
    if (!org.registration_number && org.registration_type !== 'Community group') {
      flags.push('Registration number missing for formal organization');
    }
    const orgReports = db.getReports(org.id).filter((r) => r.status === 'pending');
    if (orgReports.length > 0) {
      flags.push(`Has ${orgReports.length} pending volunteer report(s)`);
    }
    const duplicates = db.checkDuplicateOrganizations(org.legal_name || org.org_name, org.website || undefined, org.registration_number || undefined, org.phone || undefined);
    if (duplicates.length > 1) {
      flags.push(`Possible duplicate organization detected (${duplicates.length - 1} matching account)`);
    }
    return flags;
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (confirm(`Are you sure you want to permanently delete "${orgName}" from Supabase database?`)) {
      await db.deleteOrganizer(orgId);
      refreshData();
    }
  };

  const handleSaveHoursCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;
    const num = parseFloat(newHoursInput);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid non-negative hours value.');
      return;
    }

    const res = db.adminEditVolunteerHours(selectedVolunteer.id, num, 'admin-user-id', auditReason);
    if (res.success) {
      alert(`Volunteer total hours updated to ${num} hrs!`);
      setSelectedVolunteer(null);
      setNewHoursInput('');
      setAuditReason('');
      refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    db.addCategory(newCategoryName);
    setNewCategoryName('');
    refreshData();
  };

  const handleSystemReset = async () => {
    if (confirmInput.trim() !== 'RESET ALL DATA') return;
    setIsResetting(true);
    const res = await db.resetSystemData();
    setIsResetting(false);
    if (res.success) {
      setResetSuccess(true);
      refreshData();
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 1500);
    } else {
      alert(`Reset failed: ${res.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Krow Admin Access</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Enter secret admin key to access safety & verification portal
            </p>
          </div>

          {passError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Admin Passcode</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter secret admin key..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF] focus:outline-hidden font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Authenticate Admin Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Dashboard Top Banner */}
      <div className="rounded-3xl bg-gray-900 text-white p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#635BFF]" />
            <h1 className="text-2xl font-extrabold tracking-tight">Krow Administration Portal</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage organization verifications, volunteer reports, hour corrections, and safety rules.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'verify' ? 'bg-[#635BFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Verify Organizations ({organizers.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-[#635BFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Reports
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white font-extrabold rounded-full">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hours' ? 'bg-[#635BFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Edit Volunteer Hours
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories' ? 'bg-[#635BFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'messages' ? 'bg-[#635BFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Messages
            {messages.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-white/20 text-white font-extrabold rounded-full">
                {messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reset' ? 'bg-red-600 text-white shadow-sm' : 'text-red-400 hover:text-red-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            System Reset
          </button>
        </div>
      </div>

      {/* FEATURE 1: VERIFY ORGANIZATIONS */}
      {activeTab === 'verify' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-extrabold text-gray-900 text-base">Organization Verification Queue</h2>
              <p className="text-xs text-gray-500">Review multi-signal applications, flags, and checklist evidence.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search legal name or city..."
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
              />
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-extrabold bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="more_info">More Info Required</option>
                <option value="verified">Verified Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="revoked">Revoked Only</option>
                <option value="rejected">Rejected Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">Representative</th>
                  <th className="py-3 px-3">Signals & Flags</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No organizations match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((org) => {
                    const flags = computeRiskFlags(org);
                    const isVerified = org.verification_status === 'VERIFIED' || org.verification_status === 'verified';
                    const repEmailVerified = org.representative?.email_verified;

                    return (
                      <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-gray-900">{org.legal_name || org.org_name}</div>
                          {org.public_name && org.public_name !== org.legal_name && (
                            <div className="text-gray-500 text-[11px]">Public: {org.public_name}</div>
                          )}
                          <div className="text-gray-400 text-[11px]">{org.hq_city ? `${org.hq_city}, ${org.hq_province_state}` : 'No HQ Address'}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          {org.representative ? (
                            <div>
                              <div className="font-bold text-gray-900">{org.representative.full_name}</div>
                              <div className="text-gray-500 text-[11px]">{org.representative.role}</div>
                              <div className="text-gray-400 text-[11px] font-mono">{org.representative.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No representative data</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {repEmailVerified ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                                  ✓ Email Verified
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-extrabold">
                                  Email Unverified
                                </span>
                              )}

                              {org.email_domain ? (
                                <span className="px-2 py-0.5 bg-purple-50 text-[#635BFF] border border-purple-200 rounded-full text-[10px] font-extrabold">
                                  Domain: {org.email_domain}
                                </span>
                              ) : null}
                            </div>

                            {flags.length > 0 && (
                              <div className="text-[10px] font-extrabold text-amber-700 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{flags.length} Risk Flag(s)</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : org.verification_status === 'PENDING_REVIEW'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : org.verification_status === 'MORE_INFORMATION_REQUIRED'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : org.verification_status === 'SUSPENDED' || org.verification_status === 'REVOKED' || org.verification_status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {org.verification_status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrg(org)}
                              className="px-3.5 py-1.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl font-extrabold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Review Application
                            </button>
                            <button
                              onClick={() => handleDeleteOrganization(org.id, org.org_name)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs border border-rose-200 transition-colors"
                              title="Delete Organization"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEATURE 2: VOLUNTEER REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-extrabold text-gray-900 text-base">Volunteer Safety & Reports Queue</h2>
              <p className="text-xs text-gray-500">Inspect reports filed by volunteers against organizations or opportunities.</p>
            </div>

            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-extrabold bg-white"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending Review Only</option>
              <option value="actioned">Actioned / Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-medium">No reports filed matching the selected status.</div>
            ) : (
              filteredReports.map((rep) => {
                const targetOrg = db.getOrganizer(rep.organization_id);
                const targetOpp = rep.opportunity_id ? db.getOpportunity(rep.opportunity_id) : null;

                return (
                  <div key={rep.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                          {rep.report_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-400 text-[11px]">{new Date(rep.created_at).toLocaleString()}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : rep.status === 'dismissed'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        <strong className="text-gray-900">Target Organization:</strong>{' '}
                        <span className="font-bold text-[#635BFF]">{targetOrg?.org_name || 'Organization'}</span>
                      </div>
                      {targetOpp && (
                        <div>
                          <strong className="text-gray-900">Reported Opportunity:</strong>{' '}
                          <span className="font-medium text-gray-700">{targetOpp.title}</span>
                        </div>
                      )}
                      <p className="text-gray-700 bg-white p-3 rounded-xl border border-gray-200 mt-2 font-medium leading-relaxed">
                        "{rep.description}"
                      </p>
                    </div>

                    {rep.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismiss')}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'suspend')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                        >
                          Suspend Organization
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'revoke')}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                        >
                          Revoke Verification
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FEATURE 3: VOLUNTEER HOURS EDITOR */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-extrabold text-gray-900 text-base">Volunteer Hours Editor & Correction Audit</h2>
            <p className="text-xs text-gray-500">Correct volunteer total hours directly with mandatory administrative reason audit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Volunteer Search */}
            <div className="space-y-3">
              <label className="font-extrabold text-gray-700 text-xs">Search Volunteer</label>
              <input
                type="text"
                value={volSearch}
                onChange={(e) => setVolSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#635BFF]"
              />

              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {filteredVolunteers.map((vol) => {
                  const volHours = db.calculateVolunteerTotalHours(vol.id);
                  const isSel = selectedVolunteer?.id === vol.id;
                  return (
                    <div
                      key={vol.id}
                      onClick={() => {
                        setSelectedVolunteer(vol);
                        setNewHoursInput(volHours.toString());
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSel ? 'border-[#635BFF] bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">{vol.name}</div>
                        <div className="text-gray-500 text-[11px]">{vol.email}</div>
                      </div>
                      <span className="font-extrabold text-[#635BFF]">{volHours} hrs</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Correction Form */}
            <div className="md:col-span-2 bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-4">
              {selectedVolunteer ? (
                <form onSubmit={handleSaveHoursCorrection} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <span className="text-gray-400 font-bold text-[10px] uppercase">Selected Volunteer</span>
                      <h3 className="text-base font-extrabold text-gray-900">{selectedVolunteer.name}</h3>
                      <span className="text-gray-500">{selectedVolunteer.email}</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-[#635BFF] font-black text-sm rounded-xl">
                      Current: {db.calculateVolunteerTotalHours(selectedVolunteer.id)} hrs
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-700">New Corrected Total Hours *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={newHoursInput}
                      onChange={(e) => setNewHoursInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-900 focus:border-[#635BFF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-700">Reason for Administrative Correction *</label>
                    <textarea
                      rows={3}
                      required
                      value={auditReason}
                      onChange={(e) => setAuditReason(e.target.value)}
                      placeholder="e.g. Corrected offline event hours per signed organizer logsheet..."
                      className="w-full p-3 rounded-xl border border-gray-200 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVolunteer(null)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Hours Correction
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-16 text-center text-gray-400 text-xs font-medium">
                  Select a volunteer from the left list to issue an administrative hour correction.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h2 className="font-extrabold text-gray-900 text-base">Opportunity Categories</h2>
            <form onSubmit={handleAddCategory} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name..."
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#635BFF] text-white rounded-xl text-xs font-extrabold hover:bg-[#5046E5] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between text-xs font-extrabold text-gray-800">
                <span>{cat.name}</span>
                {cat.is_custom && <span className="text-[10px] text-[#635BFF] bg-purple-100 px-2 py-0.5 rounded-full">Custom</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE 5: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-extrabold text-gray-900 text-base">Contact Messages ({messages.length})</h2>
            <p className="text-xs text-gray-500">Inbound support and verification messages submitted by users.</p>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-medium">No contact messages submitted.</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900">{msg.user_name} ({msg.user_email})</span>
                    <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div className="font-bold text-[#635BFF]">{msg.subject}</div>
                  <p className="text-gray-700 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FEATURE 6: SYSTEM RESET */}
      {activeTab === 'reset' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-card space-y-6">
          <div className="border-b border-rose-100 pb-4">
            <div className="flex items-center gap-2.5 text-rose-600 mb-1">
              <AlertCircle className="w-6 h-6" />
              <h2 className="font-extrabold text-gray-900 text-xl">Reset System to Launch Ready</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Completely wipe all user data, organizations, opportunities, shift history, certificates, and audit logs to restore Krow to a clean state.
            </p>
          </div>

          <button
            onClick={() => {
              setConfirmInput('');
              setResetSuccess(false);
              setIsResetModalOpen(true);
            }}
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Initiate System Reset
          </button>
        </div>
      )}

      {/* DETAILED ORGANIZATION REVIEW MODAL */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 relative max-h-[90vh] flex flex-col space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-gray-900">{selectedOrg.legal_name || selectedOrg.org_name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedOrg.verification_status === 'VERIFIED' || selectedOrg.verification_status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedOrg.verification_status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Legal ID: {selectedOrg.id} · Created: {new Date(selectedOrg.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrg(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-6 text-xs pr-1">
              {/* Risk Flags Banner */}
              {(() => {
                const flags = computeRiskFlags(selectedOrg);
                if (flags.length === 0) return null;
                return (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="font-extrabold text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Administrative Risk Flags ({flags.length})</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-amber-800 font-medium text-[11px]">
                      {flags.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Grid 1: Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Details */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h3 className="font-extrabold text-gray-900 text-xs border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#635BFF]" /> Organization Information
                  </h3>
                  <div><strong>Legal Name:</strong> {selectedOrg.legal_name || selectedOrg.org_name}</div>
                  <div><strong>Public Name:</strong> {selectedOrg.public_name || 'Same as legal name'}</div>
                  <div><strong>Type:</strong> {selectedOrg.organization_type || 'Unspecified'}</div>
                  <div><strong>Phone:</strong> {selectedOrg.phone || 'Unspecified'}</div>
                  <div><strong>Website:</strong> {selectedOrg.website || 'None'}</div>
                  <div><strong>Location:</strong> {selectedOrg.hq_address ? `${selectedOrg.hq_address}, ${selectedOrg.hq_city}` : `${selectedOrg.hq_city || 'City'}, ${selectedOrg.hq_province_state || 'State'}`}</div>
                  <div><strong>Description:</strong> <p className="text-gray-600 mt-1">{selectedOrg.bio || 'No description provided.'}</p></div>
                </div>

                {/* Representative Details */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h3 className="font-extrabold text-gray-900 text-xs border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#635BFF]" /> Representative Details
                  </h3>
                  {selectedOrg.representative ? (
                    <>
                      <div><strong>Full Name:</strong> {selectedOrg.representative.full_name}</div>
                      <div><strong>Role:</strong> {selectedOrg.representative.role}</div>
                      <div><strong>Email:</strong> {selectedOrg.representative.email}</div>
                      <div><strong>Phone:</strong> {selectedOrg.representative.phone}</div>
                      <div>
                        <strong>Email Verified:</strong>{' '}
                        {selectedOrg.representative.email_verified ? (
                          <span className="text-emerald-600 font-extrabold">YES ✓</span>
                        ) : (
                          <span className="text-amber-600 font-extrabold">NO</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">No representative data submitted.</span>
                  )}
                </div>
              </div>

              {/* Grid 2: Registration & Safety */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Registration Info */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h3 className="font-extrabold text-gray-900 text-xs border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#635BFF]" /> Registration Information
                  </h3>
                  <div><strong>Registration Type:</strong> {selectedOrg.registration_type || 'Unspecified'}</div>
                  <div><strong>Registration Number:</strong> {selectedOrg.registration_number || 'None'}</div>
                  <div><strong>Registration Authority:</strong> {selectedOrg.registration_authority || 'None'}</div>
                  <div><strong>Country of Reg:</strong> {selectedOrg.country_of_registration || 'Unspecified'}</div>
                  <div>
                    <strong>Documents Submitted:</strong>{' '}
                    {selectedOrg.documents && selectedOrg.documents.length > 0 ? (
                      <span className="text-emerald-600 font-bold">{selectedOrg.documents.length} document(s)</span>
                    ) : (
                      <span className="text-gray-400">None uploaded</span>
                    )}
                  </div>
                </div>

                {/* Safety Info */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h3 className="font-extrabold text-gray-900 text-xs border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#635BFF]" /> Safety Information
                  </h3>
                  {selectedOrg.safety_info ? (
                    <>
                      <div><strong>Activities:</strong> {selectedOrg.safety_info.activities}</div>
                      <div><strong>Locations:</strong> {selectedOrg.safety_info.locations.join(', ')}</div>
                      <div><strong>Supervisor:</strong> {selectedOrg.safety_info.supervisor_info}</div>
                      <div><strong>Minors Allowed:</strong> {selectedOrg.safety_info.minors_allowed ? 'Yes' : 'No'}</div>
                      <div><strong>Background Checks:</strong> {selectedOrg.safety_info.background_checks}</div>
                      <div>
                        <strong>Safety Agreement:</strong>{' '}
                        {selectedOrg.safety_info.agreed_rules ? (
                          <span className="text-emerald-600 font-bold">Agreed ✓</span>
                        ) : (
                          <span className="text-rose-600 font-bold">Not Agreed</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">No safety information submitted.</span>
                  )}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#635BFF]" />
                  <span>Verification Evidence Checklist (Admin Verification Signals)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(() => {
                    const checks = db.getVerificationChecks(selectedOrg.id);
                    return CHECKLIST_ITEMS.map((item) => {
                      const checkObj = checks.find((c) => c.check_type === item.id);
                      const isChecked = !!checkObj?.status;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklist(selectedOrg.id, item.id, isChecked)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                            isChecked ? 'bg-white border-[#635BFF] text-gray-900 font-bold' : 'bg-white/60 border-gray-200 text-gray-500'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#635BFF] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Admin Internal Notes Feed */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#635BFF]" /> Internal Admin Notes (Private)
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAdminNote}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    placeholder="Add private admin note..."
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNote(selectedOrg.id)}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shrink-0"
                  >
                    Add Note
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {db.getAdminNotes(selectedOrg.id).map((note) => (
                    <div key={note.id} className="p-2.5 rounded-xl bg-white border border-gray-100 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-bold text-gray-700">{note.admin_name || 'Admin'}</span>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-800 font-medium mt-1">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Audit History */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#635BFF]" /> Verification Status History
                </h3>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {db.getVerificationHistory(selectedOrg.id).map((hist) => (
                    <div key={hist.id} className="p-2.5 rounded-xl bg-white border border-gray-100 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-gray-900">{hist.action}</span>
                        {hist.reason && <div className="text-gray-500 text-[11px]">Reason: {hist.reason}</div>}
                      </div>
                      <span className="text-gray-400 text-[10px]">{new Date(hist.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApproveOrg(selectedOrg.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Organization
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionModal('request_info');
                    setActionReason('');
                  }}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  Request More Info
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionModal('suspend');
                    setActionReason('');
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  Suspend Org
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionModal('revoke');
                    setActionReason('');
                  }}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  Revoke Verification
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASON PROMPT MODAL */}
      {activeActionModal && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base">
              {activeActionModal === 'request_info' && 'Request Additional Information'}
              {activeActionModal === 'reject' && 'Reject Organization Verification'}
              {activeActionModal === 'suspend' && 'Suspend Organization Account'}
              {activeActionModal === 'revoke' && 'Revoke Verification Status'}
            </h3>

            <p className="text-xs text-gray-500">
              Provide a clear reason. This message will be logged in the audit trail and sent to the organizer.
            </p>

            <textarea
              rows={4}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Enter administrative reason or required information details..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium focus:border-[#635BFF]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusAction}
                className="px-5 py-2 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold rounded-xl text-xs shadow-md"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM RESET CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 relative shadow-2xl border border-red-100">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Confirm Full System Reset</h3>
              <p className="text-xs text-red-600 mt-1 font-semibold">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To confirm permanent deletion of ALL accounts, organizations, opportunities, and system data, type <strong className="text-gray-900 select-all font-mono">RESET ALL DATA</strong> below:
              </p>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>System reset complete! Redirecting to home...</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSystemReset();
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  required
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type RESET ALL DATA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 text-xs font-mono font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={confirmInput.trim() !== 'RESET ALL DATA' || isResetting}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resetting...
                      </>
                    ) : (
                      'Confirm Full Reset'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
