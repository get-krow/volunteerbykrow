'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, CheckCircle2, AlertCircle, Search, Edit3, Lock, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { OrganizerProfile, UserProfile, AttendanceRecord, HourAuditLog, Category } from '@/lib/types';
import { db } from '@/lib/db';

export const AdminPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'verify' | 'hours' | 'categories'>('verify');

  // State
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>(() => db.getOrganizers());
  const [orgSearch, setOrgSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState<'all' | 'pending' | 'verified'>('all');

  // Volunteer Hours Editor State
  const [volSearch, setVolSearch] = useState('');
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [newHoursInput, setNewHoursInput] = useState('');
  const [auditReason, setAuditReason] = useState('');

  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [newCategoryName, setNewCategoryName] = useState('');

  const refreshData = () => {
    setOrganizers([...db.getOrganizers()]);
    setCategories([...db.getCategories()]);
  };

  useEffect(() => {
    refreshData();
    db.syncWithSupabase().then(() => refreshData());
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    // Secure verification check matching admin credentials
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
    if (!selectedAttendance) return;
    const num = parseFloat(newHoursInput);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid non-negative hours value.');
      return;
    }

    const res = db.adminEditShiftHours(selectedAttendance.id, num, 'admin-user-id', auditReason);
    if (res.success) {
      alert('Shift hours updated and audit log entry recorded!');
      setSelectedAttendance(null);
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
        <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'verify' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Verify Organizations
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hours' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Edit Volunteer Hours
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Categories
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
            <h2 className="font-bold text-gray-900 text-base">Edit Volunteer Shift Hours (Audited)</h2>
            <p className="text-xs text-gray-500">
              Shift hours are edited individually. Volunteer total hours are automatically derived from shift records.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-700">Search Volunteer Shift Records:</label>
            <input
              type="text"
              value={volSearch}
              onChange={(e) => setVolSearch(e.target.value)}
              placeholder="Search volunteer name or email..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
            />

            <div className="divide-y divide-gray-100">
              {db.getAllAttendanceRecords().map((att) => {
                const title = att.opportunity_title || db.getOpportunity(att.opportunity_id)?.title || 'Volunteer Shift';
                return (
                  <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{title}</div>
                      <div className="text-gray-500">
                        Status: <strong className="capitalize">{att.status}</strong> • Awarded Hours:{' '}
                        <strong className="text-brand-600">{att.hours_awarded} hrs</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAttendance(att);
                        setNewHoursInput(att.hours_awarded.toString());
                      }}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-brand-700 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Hours
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Hours Modal */}
          {selectedAttendance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 relative shadow-2xl">
                <button
                  onClick={() => setSelectedAttendance(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <h3 className="font-bold text-gray-900 text-base">Adjust Shift Hours</h3>
                <p className="text-xs text-gray-500">
                  Original Hours: {selectedAttendance.hours_awarded} hrs. An audit trail record will be saved.
                </p>

                <form onSubmit={handleSaveHoursCorrection} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Hours Value</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newHoursInput}
                      onChange={(e) => setNewHoursInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Audit Reason / Notes</label>
                    <input
                      type="text"
                      required
                      value={auditReason}
                      onChange={(e) => setAuditReason(e.target.value)}
                      placeholder="e.g. Corrected overtime hours approved by organizer"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs shadow-md"
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
    </div>
  );
};
