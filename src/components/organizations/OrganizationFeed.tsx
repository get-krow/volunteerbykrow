'use client';

import React, { useState, useMemo } from 'react';
import { Search, Building2, MapPin, CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { OrganizerProfile, Opportunity, UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { OpportunityCard } from '../discover/OpportunityCard';

interface OrganizationFeedProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const OrganizationFeed: React.FC<OrganizationFeedProps> = ({ currentUser, onOpenAuth }) => {
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  React.useEffect(() => {
    setOrganizers(db.getOrganizers());
    setOpportunities(db.getOpportunities());
    setSavedIds(db.getSavedOpportunityIds());
    if (currentUser) {
      setRegistrations(db.getVolunteerRegistrations(currentUser.id));
    }
  }, [currentUser]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');

  // Active Selected Organization Modal
  const [selectedOrg, setSelectedOrg] = useState<OrganizerProfile | null>(null);

  const refreshData = () => {
    setSavedIds(db.getSavedOpportunityIds());
    if (currentUser) {
      setRegistrations(db.getVolunteerRegistrations(currentUser.id));
    }
  };

  const handleRegister = (oppId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = db.registerForOpportunity(oppId, currentUser.id);
    if (!res.success) alert(res.message);
    refreshData();
  };

  const handleSaveToggle = (oppId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    db.toggleSavedOpportunity(currentUser.id, oppId);
    refreshData();
  };

  // Registered set
  const registeredOppIds = useMemo(() => new Set(registrations.map((r) => r.opportunity_id)), [registrations]);

  // Filtered Organizers list
  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = org.org_name.toLowerCase().includes(q);
        const matchBio = (org.bio || '').toLowerCase().includes(q);
        const matchCity = (org.hq_city || '').toLowerCase().includes(q);
        if (!matchName && !matchBio && !matchCity) return false;
      }

      if (selectedVerification !== 'all' && org.verification_status !== selectedVerification) {
        return false;
      }

      return true;
    });
  }, [organizers, searchQuery, selectedVerification]);

  // Opportunities for selected organization
  const selectedOrgOpportunities = useMemo(() => {
    if (!selectedOrg) return [];
    return opportunities.filter((o) => o.org_id === selectedOrg.id && o.status === 'published');
  }, [opportunities, selectedOrg]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-brand-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="max-w-xl">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 inline-block mb-2">
            Partner Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Posts by Organizations</h1>
          <p className="text-xs text-purple-100 mt-2">
            Discover community non-profits, eco alliances, and tech clubs. Click an organization to view all of their active volunteer postings.
          </p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizations by name, bio, or city..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs text-gray-900 focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-card"
          />
        </div>

        <select
          value={selectedVerification}
          onChange={(e) => setSelectedVerification(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-card focus:ring-2 focus:ring-brand-500 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Verification Statuses</option>
          <option value="verified">Verified Orgs Only</option>
          <option value="pending">Pending Orgs Only</option>
        </select>
      </div>

      {/* Organization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizers.map((org) => {
          const oppCount = opportunities.filter((o) => o.org_id === org.id && o.status === 'published').length;

          return (
            <div
              key={org.id}
              onClick={() => setSelectedOrg(org)}
              className="bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.org_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-brand-600" />
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      org.verification_status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {org.verification_status === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug mb-1">
                  {org.org_name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {org.no_hq
                      ? 'No Physical HQ'
                      : `${org.hq_city || 'HQ'}, ${org.hq_province_state || ''}, ${org.hq_country || ''}`}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">{org.bio}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                <span>{oppCount} Active Opportunities</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Organization Detail Dashboard Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setSelectedOrg(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>

            {/* Org Header Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-20 h-20 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedOrg.logo_url ? (
                  <img src={selectedOrg.logo_url} alt={selectedOrg.org_name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-brand-600" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{selectedOrg.org_name}</h2>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedOrg.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedOrg.verification_status === 'verified' ? 'Verified Org' : 'Pending Org'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {selectedOrg.no_hq
                      ? 'No Physical HQ'
                      : selectedOrg.hq_address || `${selectedOrg.hq_city}, ${selectedOrg.hq_province_state}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    contact@{selectedOrg.org_name.toLowerCase().replace(/[^a-z]/g, '')}.org
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed pt-1">{selectedOrg.bio}</p>
              </div>
            </div>

            {/* Opportunities List for this Org */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Active Opportunities ({selectedOrgOpportunities.length})
              </h3>

              {selectedOrgOpportunities.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
                  No active opportunities currently posted by this organization.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedOrgOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      currentUser={currentUser}
                      onRegister={handleRegister}
                      onSaveToggle={handleSaveToggle}
                      isSaved={savedIds.includes(opp.id)}
                      isRegistered={registeredOppIds.has(opp.id)}
                      onOpenAuth={onOpenAuth}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
