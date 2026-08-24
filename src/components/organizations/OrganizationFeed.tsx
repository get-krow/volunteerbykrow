'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Building2, MapPin, CheckCircle2, ArrowRight, Mail, X } from 'lucide-react';
import { OrganizerProfile, Opportunity, UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { OpportunityCard } from '../discover/OpportunityCard';
import { OpportunityDetailModal } from '../discover/OpportunityDetailModal';

interface OrganizationFeedProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const OrganizationFeed: React.FC<OrganizationFeedProps> = ({ currentUser, onOpenAuth }) => {
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');

  // Selected Org Detail Modal
  const [selectedOrg, setSelectedOrg] = useState<OrganizerProfile | null>(null);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<Opportunity | null>(null);

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const refreshData = () => {
    setOrganizers(db.getOrganizers());
    setOpportunities(db.getOpportunities());
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
    if (!res.success) {
      alert(res.message);
    }
    refreshData();
  };

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = org.org_name.toLowerCase().includes(q);
        const matchCity = (org.hq_city || '').toLowerCase().includes(q);
        const matchBio = (org.bio || '').toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchBio) return false;
      }

      if (selectedVerification !== 'all') {
        if (selectedVerification === 'verified' && org.verification_status !== 'verified') return false;
        if (selectedVerification === 'pending' && org.verification_status === 'verified') return false;
      }

      return true;
    });
  }, [organizers, searchQuery, selectedVerification]);

  const orgOppMap = useMemo(() => {
    const map = new Map<string, Opportunity[]>();
    opportunities.forEach((opp) => {
      if (opp.status === 'published') {
        const existing = map.get(opp.org_id) || [];
        existing.push(opp);
        map.set(opp.org_id, existing);
      }
    });
    return map;
  }, [opportunities]);

  const registeredOppIds = useMemo(() => {
    return new Set(registrations.map((r) => r.opportunity_id));
  }, [registrations]);

  const selectedOrgOpps = useMemo(() => {
    if (!selectedOrg) return [];
    return orgOppMap.get(selectedOrg.id) || [];
  }, [selectedOrg, orgOppMap]);

  return (
    <div className="space-y-6">
      {/* Header Section 26 Spec */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Organizations</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Find community organizations you care about.</p>
      </div>

      {/* Search & Verification Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by organization name, location, or bio..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-3 gap-1 bg-white border border-gray-200/90 p-1 rounded-2xl text-xs font-bold w-full sm:w-auto shadow-2xs">
          {[
            { id: 'all', label: 'All Orgs' },
            { id: 'verified', label: 'Verified' },
            { id: 'pending', label: 'Pending' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedVerification(item.id)}
              className={`py-1.5 px-3 rounded-xl transition-all ${
                selectedVerification === item.id ? 'bg-[#635BFF] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Organization Cards Grid */}
      {filteredOrganizers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-2xs space-y-3">
          <div className="text-3xl">🏢</div>
          <h3 className="font-bold text-gray-900 text-base">No organizations found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try searching for another keyword or selecting a different verification status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizers.map((org) => {
            const opps = orgOppMap.get(org.id) || [];
            return (
              <div
                key={org.id}
                onClick={() => setSelectedOrg(org)}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 text-[#635BFF] flex items-center justify-center font-bold text-base overflow-hidden flex-shrink-0">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.org_name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#635BFF] transition-colors truncate">
                          {org.org_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {org.no_hq ? (
                          <span className="truncate">🌐 No Physical HQ (Virtual)</span>
                        ) : (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              (org.hq_address ? org.hq_address + ', ' : '') + org.hq_city + ', ' + org.hq_province_state + ', ' + org.hq_country
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="truncate text-[#635BFF] hover:underline font-semibold"
                          >
                            {org.hq_address ? `${org.hq_address}, ${org.hq_city}` : `${org.hq_city}, ${org.hq_province_state}`}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {org.bio || 'Community organization posting volunteer opportunities.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#635BFF]">{opps.length} opportunities</span>
                  {org.verification_status === 'verified' ? (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Organization Detail Dashboard Modal (Section 27 Spec) */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white sm:rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full min-h-screen sm:min-h-0 overflow-hidden relative flex flex-col my-auto p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setSelectedOrg(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Org Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 text-[#635BFF] flex items-center justify-center font-bold text-2xl overflow-hidden flex-shrink-0">
                {selectedOrg.logo_url ? (
                  <img src={selectedOrg.logo_url} alt={selectedOrg.org_name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-gray-900">{selectedOrg.org_name}</h2>
                  {selectedOrg.verification_status === 'verified' && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {selectedOrg.no_hq ? (
                    <span>🌐 Virtual / Remote (No Physical HQ)</span>
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        (selectedOrg.hq_address ? selectedOrg.hq_address + ', ' : '') + selectedOrg.hq_city + ', ' + selectedOrg.hq_province_state + ', ' + selectedOrg.hq_country
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#635BFF] hover:underline font-semibold flex items-center gap-1"
                    >
                      {selectedOrg.hq_address ? `${selectedOrg.hq_address}, ${selectedOrg.hq_city}, ${selectedOrg.hq_province_state}` : `${selectedOrg.hq_city}, ${selectedOrg.hq_province_state}, ${selectedOrg.hq_country}`} (View on Google Maps)
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-600 max-w-xl">{selectedOrg.bio}</p>
              </div>
            </div>

            {/* Org Opportunities Grid */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Opportunities by {selectedOrg.org_name} ({selectedOrgOpps.length})
              </h3>

              {selectedOrgOpps.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  This organization currently has no active published opportunities.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrgOpps.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      currentUser={currentUser}
                      onRegister={handleRegister}
                      onSelectCard={(o) => setSelectedOppForDetail(o)}
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

      {/* Opportunity Details Dedicated Modal */}
      <OpportunityDetailModal
        opportunity={selectedOppForDetail}
        currentUser={currentUser}
        isOpen={!!selectedOppForDetail}
        onClose={() => setSelectedOppForDetail(null)}
        onRegister={handleRegister}
        isRegistered={selectedOppForDetail ? registeredOppIds.has(selectedOppForDetail.id) : false}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
