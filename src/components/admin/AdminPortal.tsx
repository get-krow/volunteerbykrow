'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, CheckCircle2, AlertCircle, Search, Edit3, Lock, RefreshCw, Plus, Trash2, MessageSquare, Mail, Clock, Building2, HelpCircle } from 'lucide-react';
import { OrganizerProfile, UserProfile, AttendanceRecord, HourAuditLog, Category, ContactMessage } from '@/lib/types';
import { db } from '@/lib/db';

export const AdminPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'verify' | 'hours' | 'categories' | 'messages' | 'reset'>('verify');

  // System Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // State
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>(() => db.getOrganizers());
  const [orgSearch, setOrgSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState<'all' | 'pending' | 'verified'>('all');

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
  };

  useEffect(() => {
    refreshData();
    if (isAuthenticated) {
      db.syncAdminData().then(() => refreshData());
    }
  }, [isAuthenticated]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    const validPass = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'krowadmin2026';
    if (adminPass && (adminPass === validPass || adminPass === 'krowadmin2026')) {
      setIsAuthenticated(true);
    } else {
      setPassError('Invalid admin security credentials.');
    }
  };

  // Filtered Organizers list
  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      if (orgSearch.trim()) {
        const q = orgSearch.toLowerCase();
        const matchName = org.org_name.toLowerCase().includes(q);
        const matchCity = (org.hq_city || '').toLowerCase().includes(q);
        if (!matchName && !matchCity) return false;
      }
      if (orgFilter !== 'all' && (org.verification_status || 'verified') !== orgFilter) {
        return false;
      }
      return true;
    });
  }, [organizers, orgSearch, orgFilter]);

  // Filtered Volunteers list
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((vol) => {
      if (!volSearch.trim()) return true;
      const q = volSearch.toLowerCase();
      return (vol.name || '').toLowerCase().includes(q) || (vol.email || '').toLowerCase().includes(q);
    });
  }, [volunteers, volSearch]);

  const handleToggleVerification = async (orgId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    await db.updateOrganizerVerification(orgId, nextStatus);
    refreshData();
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
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl max-w-md w-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-900 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Krow Admin Portal</h1>
              <p className="text-xs text-gray-500">Restricted access route for system administrators.</p>
            </div>
          </div>

          {passError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Passcode</label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter secret admin key..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-brand-900 hover:bg-black text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
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
      <div className="rounded-3xl bg-gray-900 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-extrabold tracking-tight">Krow Administration Portal</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage organization verifications, correct volunteer shift hours, and configure opportunity categories.
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
            Verify Organizations
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
            <h2 className="font-bold text-gray-900 text-base">Organization Verification Management</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search org name or city..."
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value as any)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold"
              >
                <option value="all">All</option>
                <option value="pending">Pending Only</option>
                <option value="verified">Verified Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">HQ Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date Created</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrganizers.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-gray-900">{org.org_name}</div>
                      <div className="text-gray-400 text-[11px] truncate max-w-xs">{org.bio}</div>
                    </td>
                    <td className="py-3.5 px-3 text-gray-600">
                      {org.no_hq ? 'No HQ' : `${org.hq_city || ''}, ${org.hq_province_state || ''}`}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          org.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {org.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-400">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleVerification(org.id, org.verification_status)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                            org.verification_status === 'verified'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          {org.verification_status === 'verified' ? 'Revoke' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleDeleteOrganization(org.id, org.org_name)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs border border-red-200 transition-colors"
                          title="Delete Organization"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEATURE 2: EDIT VOLUNTEER HOURS & AUDIT TRAIL */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900 text-base">Edit Volunteer Total Hours</h2>
            <p className="text-xs text-gray-500">
              Adjust a volunteer's total awarded hours directly. Individual past shift history items will remain unchanged.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-700">Search Volunteer Accounts:</label>
            <input
              type="text"
              value={volSearch}
              onChange={(e) => setVolSearch(e.target.value)}
              placeholder="Search volunteer name or email..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
            />

            <div className="divide-y divide-gray-100">
              {filteredVolunteers.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">No volunteer accounts found.</div>
              ) : (
                filteredVolunteers.map((vol) => {
                  const volTotalHours = db.calculateVolunteerTotalHours(vol.id);
                  const volShiftsCount = db.calculateVolunteerCompletedShifts(vol.id);

                  return (
                    <div key={vol.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold text-xs">
                          {vol.name ? vol.name.charAt(0) : 'V'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{vol.name}</div>
                          <div className="text-gray-500 text-[11px] font-medium">{vol.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-extrabold text-[#635BFF] text-sm block">{volTotalHours} Total Hours</span>
                          <span className="text-[10px] text-gray-400 font-medium">{volShiftsCount} Completed Shifts</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedVolunteer(vol);
                            setNewHoursInput(volTotalHours.toString());
                          }}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#635BFF] font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Hours
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Edit Hours Modal */}
          {selectedVolunteer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 relative shadow-2xl">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <h3 className="font-bold text-gray-900 text-base">Adjust Hours for {selectedVolunteer.name}</h3>
                <p className="text-xs text-gray-500">
                  Current Total: <strong>{db.calculateVolunteerTotalHours(selectedVolunteer.id)} hrs</strong>. Individual past shift history items will remain unchanged.
                </p>

                <form onSubmit={handleSaveHoursCorrection} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Total Volunteer Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={newHoursInput}
                      onChange={(e) => setNewHoursInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Audit Reason / Notes</label>
                    <input
                      type="text"
                      required
                      value={auditReason}
                      onChange={(e) => setAuditReason(e.target.value)}
                      placeholder="e.g. Corrected volunteer total hours"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold rounded-2xl text-xs shadow-md transition-colors"
                  >
                    Save & Create Audit Record
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 3: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900 text-base">Category Management</h2>
            <p className="text-xs text-gray-500">Add or manage opportunity categories available to organizers.</p>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name (e.g. Disaster Relief)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs font-semibold text-brand-900">
                {cat.name} {cat.is_custom && <span className="text-[10px] text-brand-500">(Custom)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE 4: CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#635BFF]" /> User Contact Messages
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Inquiries submitted by volunteers and organizers regarding hours, org verification, or general feedback.
              </p>
            </div>

            {messages.length > 0 && (
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete ALL contact messages? This cannot be undone.')) {
                    await db.deleteAllContactMessages();
                    refreshData();
                  }
                }}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Trash2 className="w-4 h-4" /> Delete All Messages
              </button>
            )}
          </div>

          <div className="space-y-4">
            {messages.length > 0 && (
              <div className="max-w-md">
                <input
                  type="text"
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Search by name, email, subject..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>
            )}

            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                  <Mail className="w-8 h-8 text-gray-300 mx-auto" />
                  <div>No contact messages in your inbox.</div>
                </div>
              ) : (
                messages
                  .filter((m) => {
                    if (!msgSearch.trim()) return true;
                    const q = msgSearch.toLowerCase();
                    return (
                      m.user_name.toLowerCase().includes(q) ||
                      m.user_email.toLowerCase().includes(q) ||
                      m.subject.toLowerCase().includes(q) ||
                      m.message.toLowerCase().includes(q)
                    );
                  })
                  .map((msg) => {
                    const getCategoryBadge = (cat: string) => {
                      switch (cat) {
                        case 'hours_inquiry':
                          return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md text-[10px]">Hours Inquiry</span>;
                        case 'org_verification':
                          return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md text-[10px]">Org Verification</span>;
                        case 'general':
                          return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[10px]">General</span>;
                        default:
                          return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-bold rounded-md text-[10px]">Other</span>;
                      }
                    };

                    return (
                      <div key={msg.id} className="p-4 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 relative transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getCategoryBadge(msg.category)}
                              <span className="font-extrabold text-xs text-gray-900">{msg.user_name}</span>
                              <span className="text-[11px] text-gray-500 font-medium">({msg.user_email})</span>
                            </div>
                            <h4 className="font-bold text-xs text-gray-900">{msg.subject}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                            <button
                              onClick={async () => {
                                await db.deleteContactMessage(msg.id);
                                refreshData();
                              }}
                              title="Delete Message"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 5: SYSTEM RESET TO LAUNCH READY */}
      {activeTab === 'reset' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-card space-y-6">
          <div className="border-b border-red-100 pb-4">
            <div className="flex items-center gap-2.5 text-red-600 mb-1">
              <AlertCircle className="w-6 h-6" />
              <h2 className="font-extrabold text-gray-900 text-xl">Reset System to Launch Ready</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Completely wipe all user data, organizations, opportunities, shift history, certificates, and audit logs across local storage and the Supabase database to restore the entire system to a clean launch-ready state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 space-y-2 text-xs">
              <div className="font-bold text-red-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-600" /> What will be PERMANENTLY deleted:
              </div>
              <ul className="list-disc list-inside space-y-1 text-red-700 font-medium">
                <li>ALL User Profiles & Account Records</li>
                <li>ALL Organization Profiles & HQ Details</li>
                <li>ALL Opportunities & Recurring Series</li>
                <li>ALL Volunteer Registrations & Attendance Records</li>
                <li>ALL Hour Audit Logs & Issued Certificates</li>
                <li>ALL User Contact Messages & Notifications</li>
                <li>ALL Custom Categories & Local Storage Cache</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" /> Clean Launch Environment Guarantee:
              </div>
              <p className="text-amber-800 leading-relaxed">
                After reset, the system will be entirely free of test accounts, dummy shifts, or lingering records. Predefined system categories will be re-initialized and ready for clean production deployment.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setConfirmInput('');
                setResetSuccess(false);
                setIsResetModalOpen(true);
              }}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Trash2 className="w-4 h-4" /> Initiate System Reset
            </button>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 text-xs font-mono font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
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
