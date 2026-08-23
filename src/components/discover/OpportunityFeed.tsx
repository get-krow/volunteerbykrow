'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Opportunity, UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { OpportunityCard } from './OpportunityCard';

interface OpportunityFeedProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const OpportunityFeed: React.FC<OpportunityFeedProps> = ({ currentUser, onOpenAuth }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => db.getOpportunities());
  const [registrations, setRegistrations] = useState(() =>
    currentUser ? db.getVolunteerRegistrations(currentUser.id) : []
  );

  // Search & Category State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'earliest' | 'latest' | 'alphabetical'>('earliest');

  const categories = [
    { id: 'all', label: 'All Roles' },
    { id: 'education', label: 'Education' },
    { id: 'environment', label: 'Environment' },
    { id: 'health', label: 'Health' },
    { id: 'animals', label: 'Animals' },
    { id: 'community', label: 'Community' },
    { id: 'arts_culture', label: 'Arts & Culture' },
    { id: 'sports', label: 'Sports' },
    { id: 'technology', label: 'Technology' },
    { id: 'disaster_relief', label: 'Disaster Relief' },
    { id: 'food_hunger', label: 'Hunger' },
  ];

  const refreshData = () => {
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

  // Filter & Sort Pipeline
  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => opp.status === 'published')
      .filter((opp) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = opp.title.toLowerCase().includes(q);
          const matchOrg = (opp.org_name || '').toLowerCase().includes(q);
          const matchLoc = (opp.location_address || '').toLowerCase().includes(q);
          if (!matchTitle && !matchOrg && !matchLoc) return false;
        }

        if (selectedCategory !== 'all') {
          if (selectedCategory === 'food_hunger' && opp.category_id !== 'food_hunger') return false;
          if (selectedCategory !== 'food_hunger' && opp.category_id !== selectedCategory && opp.custom_role?.toLowerCase() !== selectedCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'earliest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'latest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [opportunities, searchQuery, selectedCategory, sortBy]);

  const registeredOppIds = useMemo(() => {
    return new Set(registrations.map((r) => r.opportunity_id));
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* Page Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Opportunities</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Browse community volunteer roles. Sign up to participate.</p>
      </div>

      {/* Search & Sort Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, organization, or location..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex-shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 shadow-sm">
            <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-gray-800 cursor-pointer pr-4 appearance-none"
            >
              <option value="earliest">Earliest Date 🗓️</option>
              <option value="latest">Latest Date</option>
              <option value="alphabetical">Alphabetical A-Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 pointer-events-none -ml-3" />
          </div>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#635BFF] text-white shadow-sm font-bold'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Opportunities Card Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="font-bold text-gray-900 text-base">No opportunities found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try searching for a different keyword or select another category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              currentUser={currentUser}
              onRegister={handleRegister}
              isRegistered={registeredOppIds.has(opp.id)}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
};
