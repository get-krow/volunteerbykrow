'use client';

import React from 'react';
import { X, Filter, Check } from 'lucide-react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedVerification: string;
  onVerificationChange: (ver: string) => void;
  onReset: () => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  selectedVerification,
  onVerificationChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'education', label: 'Education' },
    { id: 'environment', label: 'Environment' },
    { id: 'sports', label: 'Sports' },
    { id: 'community', label: 'Community' },
    { id: 'health', label: 'Health' },
    { id: 'animals', label: 'Animals' },
    { id: 'arts_culture', label: 'Arts & Culture' },
    { id: 'events', label: 'Events' },
    { id: 'food_hunger', label: 'Food & Hunger' },
    { id: 'seniors', label: 'Seniors' },
    { id: 'youth', label: 'Youth' },
    { id: 'fundraising', label: 'Fundraising' },
    { id: 'technology', label: 'Technology' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#635BFF]" />
              <h2 className="font-extrabold text-base text-gray-900">Filter Opportunities</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-6 space-y-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-50 text-[#635BFF] border border-purple-200 font-bold'
                          : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#635BFF] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verification Status Filter */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Organization Verification
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Orgs' },
                  { id: 'verified', label: 'Verified Only' },
                  { id: 'pending', label: 'Pending Only' },
                ].map((ver) => {
                  const isSelected = selectedVerification === ver.id;
                  return (
                    <button
                      key={ver.id}
                      onClick={() => onVerificationChange(ver.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? 'bg-[#635BFF] text-white font-bold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ver.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors"
          >
            Reset Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
