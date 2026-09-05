'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, MapPin, Calendar, Mail, Save, LogOut, Trash2, Camera, ShieldAlert, HelpCircle, Sun, Moon, ShieldCheck, Copy, Check } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { useTheme } from '@/lib/theme';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';
import { compressImage } from '@/lib/image';

interface VolunteerProfileProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

function calculateCurrentAge(dobStr: string): string | null {
  if (!dobStr) return null;
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 0 || age > 120) return null;
  return `${age} yrs old`;
}

export const VolunteerProfile: React.FC<VolunteerProfileProps> = ({ currentUser, onLogout }) => {
  const [name, setName] = useState(currentUser.name);
  const [dob, setDob] = useState(currentUser.dob || '');
  const [country, setCountry] = useState(currentUser.country || 'Canada');
  const [provinceState, setProvinceState] = useState(currentUser.province_state || 'BC');
  const [city, setCity] = useState(currentUser.city || 'Coquitlam');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');

  const [isSaved, setIsSaved] = useState(false);
  const [copiedKrowId, setCopiedKrowId] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser.dob) setDob(currentUser.dob);
    if (currentUser.name) setName(currentUser.name);
    if (currentUser.country) setCountry(currentUser.country);
    if (currentUser.province_state) setProvinceState(currentUser.province_state);
    if (currentUser.city) setCity(currentUser.city);
    if (currentUser.bio) setBio(currentUser.bio);
    if (currentUser.avatar_url) setAvatarUrl(currentUser.avatar_url);
  }, [currentUser]);

  const calculatedAge = useMemo(() => calculateCurrentAge(dob), [dob]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image file under 5MB.');
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setAvatarUrl(compressed);
      db.updateProfile({ avatar_url: compressed });
    } catch (err) {
      console.error('Failed to compress image:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          db.updateProfile({ avatar_url: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    db.updateProfile({ avatar_url: '' });
  };


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

  const handleLogoutClick = async () => {
    await db.logout();
    if (onLogout) onLogout();
    window.location.href = '/';
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
            onClick={handleLogoutClick}
            className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-100"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl">
            Profile changes saved successfully!
          </div>
        )}

        {/* Krow Identity Section */}
        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#635BFF]" /> Krow Identity
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Your unique Krow ID identifies your account and appears on official Krow certificates.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-purple-200 shadow-2xs">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Your KROW ID</span>
              <span className="text-sm font-black text-gray-900 tracking-wider font-mono">
                {currentUser.krow_id || 'KROW-8F4K2M91'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const idToCopy = currentUser.krow_id || 'KROW-8F4K2M91';
                navigator.clipboard.writeText(idToCopy);
                setCopiedKrowId(true);
                setTimeout(() => setCopiedKrowId(false), 2000);
              }}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#635BFF] rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors border border-purple-200"
            >
              {copiedKrowId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Profile Photo */}
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-purple-200 shrink-0 shadow-2xs">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(name || 'V').charAt(0).toUpperCase()}</span>
              )}
              <label
                htmlFor="profile-photo-input"
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-5 h-5" />
              </label>
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-900">Profile Photo</label>
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  htmlFor="profile-photo-input"
                  className="px-3.5 py-2 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Upload Photo
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors border border-gray-200"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Upload a JPG, PNG, or WebP photo to personalize your profile.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">Date of Birth</label>
              {calculatedAge && (
                <span className="px-2.5 py-0.5 bg-purple-50 text-[#635BFF] text-[11px] font-extrabold rounded-full border border-purple-200 flex items-center gap-1 shadow-2xs">
                  ✨ Age: {calculatedAge}
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-gray-900"
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
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Changes
          </button>
        </form>

        {/* Help & Support / Contact Us Section */}
        <div className="pt-6 border-t border-purple-100">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#635BFF]" /> Have Questions or Issues with Hours?
              </h4>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Contact Krow support regarding wrong hours, organization verification requests, or general inquiries.
              </p>
            </div>
            <a
              href="/contact"
              className="px-4 py-2 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1 flex-shrink-0"
            >
              Contact Us →
            </a>
          </div>
        </div>

        {/* Section 50 Spec: Danger Zone Delete Account */}
        <div className="pt-6 border-t border-red-100">
          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Danger Zone: Delete Account
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                Permanently removes your personal profile information.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex-shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userId={currentUser.id}
        userName={currentUser.name}
      />

    </div>
  );
};
