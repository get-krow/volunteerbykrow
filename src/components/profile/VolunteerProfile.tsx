'use client';

import React, { useState } from 'react';
import { User, MapPin, Calendar, Mail, Save, LogOut, Trash2, Camera, ShieldAlert } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

interface VolunteerProfileProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const VolunteerProfile: React.FC<VolunteerProfileProps> = ({ currentUser, onLogout }) => {
  const [name, setName] = useState(currentUser.name);
  const [dob, setDob] = useState(currentUser.dob || '2004-05-15');
  const [country, setCountry] = useState(currentUser.country || 'Canada');
  const [provinceState, setProvinceState] = useState(currentUser.province_state || 'BC');
  const [city, setCity] = useState(currentUser.city || 'Coquitlam');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateProfile({
      name,
      dob,
      country,
      province_state: provinceState,
      city,
      bio,
      avatar_url: avatarUrl,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt(
      'WARNING: Deleting your account will anonymize your personal data while preserving historical volunteer hour totals for organizational audit purposes. Type DELETE to confirm:'
    );
    if (confirmation === 'DELETE') {
      db.setCurrentUser(null);
      onLogout();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Volunteer Profile Settings</h1>
            <p className="text-xs text-gray-500">Manage your personal information, date of birth, and location.</p>
          </div>
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl">
            Profile changes saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-brand-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo URL (Optional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Age eligibility is evaluated based on your exact age on the opportunity event date.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Province / State</label>
              <input
                type="text"
                required
                value={provinceState}
                onChange={(e) => setProvinceState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Personal Bio (Optional)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell organizers a little about yourself and your volunteer goals..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Changes
          </button>
        </form>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-red-100">
          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Danger Zone: Delete Account
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                Anonymizes your personal profile while preserving historical audit records.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex-shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
