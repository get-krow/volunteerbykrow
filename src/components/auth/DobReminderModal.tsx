'use client';

import React, { useState } from 'react';
import { Calendar, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

interface DobReminderModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updated: UserProfile) => void;
}

export const DobReminderModal: React.FC<DobReminderModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [dob, setDob] = useState(currentUser.dob || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const calculateAgeNumber = (dobStr: string): number | null => {
    if (!dobStr) return null;
    const bDate = new Date(dobStr + 'T00:00:00');
    if (isNaN(bDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAgeNumber(dob);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      setError('Please select your Date of Birth.');
      return;
    }
    if (calculatedAge === null || calculatedAge < 5 || calculatedAge > 120) {
      setError('Please enter a valid Date of Birth.');
      return;
    }

    const updatedProfile: UserProfile = {
      ...currentUser,
      dob,
    };

    db.updateProfile({ dob });
    onSaveSuccess(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-purple-100/60 blur-xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#635BFF] flex items-center justify-center font-bold shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            title="Dismiss reminder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-amber-200">
            Action Required · Profile Incomplete
          </span>
          <h3 className="font-black text-xl text-gray-900 leading-tight">
            Please Enter Your Date of Birth
          </h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Organizations require your age to verify volunteer eligibility and age requirements (e.g. 13+, 16+, All Ages).
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
              Your Date of Birth (YYYY-MM-DD)
            </label>
            <input
              type="date"
              required
              value={dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setDob(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#635BFF] focus:border-[#635BFF] shadow-xs"
            />
          </div>

          {calculatedAge !== null && calculatedAge > 0 && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-purple-900">Calculated Volunteer Age:</span>
              <span className="font-black text-sm text-[#635BFF] bg-white px-3 py-0.5 rounded-full border border-purple-200">
                {calculatedAge} years old
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Your date of birth is kept secure & used solely for age eligibility.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all active:scale-[0.99]"
          >
            Save Date of Birth
          </button>
        </form>
      </div>
    </div>
  );
};
