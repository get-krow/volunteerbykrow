'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, AlertCircle, ShieldCheck, X } from 'lucide-react';
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
  const [country, setCountry] = useState(currentUser.country || 'Canada');
  const [provinceState, setProvinceState] = useState(currentUser.province_state || 'BC');
  const [city, setCity] = useState(currentUser.city || 'Vancouver');
  const [isLocating, setIsLocating] = useState(false);
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

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const detCity = addr.city || addr.town || addr.village || addr.suburb || 'Vancouver';
            const detState = addr.state || addr.region || 'BC';
            const detCountry = addr.country || 'Canada';

            setCity(detCity);
            setProvinceState(detState);
            setCountry(detCountry.includes('United States') ? 'United States' : 'Canada');
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not detect location automatically. Please enter your city manually.');
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      setError('Please select your Date of Birth.');
      return;
    }
    if (calculatedAge === null || calculatedAge < 5 || calculatedAge > 120) {
      setError('Please enter a valid Date of Birth.');
      return;
    }
    if (!city || city.trim() === '') {
      setError('Please enter your city.');
      return;
    }

    const updatedProfile: UserProfile = {
      ...currentUser,
      dob,
      country,
      province_state: provinceState,
      city,
      location_set: true,
    };

    db.updateProfile({
      dob,
      country,
      province_state: provinceState,
      city,
      location_set: true,
    });

    onSaveSuccess(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 relative overflow-hidden text-gray-900">
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

        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-amber-200">
            Action Required · Profile Setup
          </span>
          <h3 className="font-black text-xl text-gray-900 leading-tight">
            Complete Your Volunteer Profile
          </h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Please provide your date of birth and location so we can show events near you and verify age eligibility.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* DOB Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-extrabold text-gray-700">
                Date of Birth (YYYY-MM-DD)
              </label>
              {calculatedAge !== null && calculatedAge > 0 && (
                <span className="text-[11px] font-black text-[#635BFF] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  {calculatedAge} yrs old
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setDob(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#635BFF] focus:bg-white shadow-xs"
            />
          </div>

          {/* Location Inputs */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-700">Location</label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="text-[11px] font-bold text-[#635BFF] hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Locating...' : '📍 Use my location'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold"
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Province/State</label>
                <select
                  value={provinceState}
                  onChange={(e) => setProvinceState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold"
                >
                  <option value="BC">British Columbia</option>
                  <option value="ON">Ontario</option>
                  <option value="AB">Alberta</option>
                  <option value="WA">Washington</option>
                  <option value="CA">California</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Vancouver"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold focus:bg-white focus:border-[#635BFF]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Used to calculate age eligibility & show events near you.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all active:scale-[0.99]"
          >
            Save DOB & Location
          </button>
        </form>
      </div>
    </div>
  );
};
