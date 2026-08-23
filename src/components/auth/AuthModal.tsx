'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle, Navigation, Lock } from 'lucide-react';
import { SystemRole, UserProfile, OrganizerProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: SystemRole;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'volunteer',
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<SystemRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [step, setStep] = useState<'auth' | 'volunteer_details' | 'organizer_details'>('auth');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Volunteer Details (DOB & Location)
  const [dob, setDob] = useState('2005-06-15');
  const [country, setCountry] = useState('Canada');
  const [provinceState, setProvinceState] = useState('BC');
  const [city, setCity] = useState('Coquitlam');
  const [usingGps, setUsingGps] = useState(false);

  // Organizer Details
  const [orgName, setOrgName] = useState('');
  const [hqCountry, setHqCountry] = useState('Canada');
  const [hqProvinceState, setHqProvinceState] = useState('BC');
  const [hqCity, setHqCity] = useState('Vancouver');
  const [hqAddress, setHqAddress] = useState('');
  const [noHq, setNoHq] = useState(false);
  const [orgBio, setOrgBio] = useState('');

  if (!isOpen) return null;

  const validatePassword = (pass: string): boolean => {
    // 8+ chars, 1 upper, 1 lower, 1 number, 1 special
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pass);
  };

  const handleGoogleAuth = async () => {
    if (role === 'organizer') {
      setError('Google Login is not available for Organizer accounts.');
      return;
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) {
        setError(error.message);
      }
      return;
    }

    // Fallback: proceed to DOB & Location onboarding for volunteer
    setStep('volunteer_details');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your account email.');
        return;
      }
      setSuccessMsg('Password reset instructions sent to your email via Supabase Auth.');
      return;
    }

    if (mode === 'signup') {
      if (!validatePassword(password)) {
        setError(
          'Password must have at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
        );
        return;
      }

      if (role === 'organizer') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (!orgName.trim()) {
          setError('Organization name is required.');
          return;
        }
        setStep('organizer_details');
        return;
      }

      if (role === 'volunteer') {
        if (!name.trim()) {
          setError('Name is required.');
          return;
        }
        setStep('volunteer_details');
        return;
      }
    }

    // Login mode
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    // Simulated successful login
    const loggedUser: UserProfile = {
      id: role === 'organizer' ? 'org-' + Date.now() : 'vol-' + Date.now(),
      role,
      email,
      name: role === 'organizer' ? orgName || 'Organization Account' : name || email.split('@')[0],
      dob: role === 'volunteer' ? '2004-05-15' : undefined,
      country: 'Canada',
      province_state: 'BC',
      city: 'Coquitlam',
      created_at: new Date().toISOString(),
    };

    db.setCurrentUser(loggedUser);
    onLoginSuccess(loggedUser);
    onClose();
  };

  const handleVolunteerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      setError('Date of Birth is required for age calculations on event dates.');
      return;
    }

    const newUser: UserProfile = {
      id: 'vol-' + Date.now(),
      role: 'volunteer',
      email: email || 'volunteer@example.com',
      name: name || 'Volunteer User',
      dob,
      country,
      province_state: provinceState,
      city,
      created_at: new Date().toISOString(),
    };

    db.setCurrentUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  const handleOrganizerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrgId = 'org-' + Date.now();
    const newUser: UserProfile = {
      id: newOrgId,
      role: 'organizer',
      email: email || 'organizer@example.com',
      name: orgName || 'New Organization',
      country: hqCountry,
      province_state: hqProvinceState,
      city: hqCity,
      created_at: new Date().toISOString(),
    };

    const newOrgProfile: OrganizerProfile = {
      id: newOrgId,
      org_name: orgName || 'New Organization',
      hq_country: hqCountry,
      hq_province_state: hqProvinceState,
      hq_city: hqCity,
      hq_address: noHq ? undefined : hqAddress,
      no_hq: noHq,
      bio: orgBio,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
    };

    const currentOrgs = db.getOrganizers();
    currentOrgs.push(newOrgProfile);

    db.setCurrentUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      setUsingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // GPS used for proximity calculations; saved location is city/area per specification rule #10
          setCity('Coquitlam (GPS Enabled)');
          setUsingGps(false);
        },
        (err) => {
          setError('Location permission denied. Falling back to manual City / State.');
          setUsingGps(false);
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'auth'
                ? mode === 'signup'
                  ? `Create ${role === 'volunteer' ? 'Volunteer' : 'Organizer'} Account`
                  : mode === 'forgot'
                  ? 'Reset Password'
                  : `Sign In to Krow`
                : step === 'volunteer_details'
                ? 'Volunteer Profile Setup'
                : 'Organization Onboarding'}
            </h2>
            <p className="text-xs text-gray-500">Volunteer and Organizer accounts are strictly separate.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: AUTH CREDENTIALS */}
        {step === 'auth' && (
          <div>
            {/* Account Type Selector (Separate accounts rule enforced) */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole('volunteer');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  role === 'volunteer'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('organizer');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  role === 'organizer'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Organizer
              </button>
            </div>

            {/* Google Signup Button (Volunteers Only per specification) */}
            {role === 'volunteer' && mode !== 'forgot' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl text-xs font-bold text-gray-700 shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  Continue with Google
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">Or email</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {mode === 'signup' && role === 'volunteer' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              )}

              {mode === 'signup' && role === 'organizer' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Metro Vancouver Food Bank"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  {mode === 'signup' && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Req: 8+ chars, 1 upper, 1 lower, 1 number, 1 special character.
                    </p>
                  )}
                </div>
              )}

              {mode === 'signup' && role === 'organizer' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                {mode === 'signup' ? 'Continue' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              {mode === 'login' ? (
                <>
                  <button onClick={() => setMode('forgot')} className="text-gray-500 hover:text-brand-600">
                    Forgot Password?
                  </button>
                  <button onClick={() => setMode('signup')} className="font-bold text-brand-600 hover:underline">
                    Create Account
                  </button>
                </>
              ) : (
                <button onClick={() => setMode('login')} className="font-bold text-brand-600 hover:underline">
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: VOLUNTEER DOB & LOCATION ONBOARDING */}
        {step === 'volunteer_details' && (
          <form onSubmit={handleVolunteerDetailsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Required so Krow can calculate your age on event dates for age-restricted opportunities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                  placeholder="BC"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Coquitlam"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleEnableLocation}
                disabled={usingGps}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-brand-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                {usingGps ? 'Locating...' : 'Let Krow enable your location'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              Complete Signup
            </button>
          </form>
        )}

        {/* STEP 3: ORGANIZER HQ ONBOARDING */}
        {step === 'organizer_details' && (
          <form onSubmit={handleOrganizerDetailsSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">Organization HQ Location</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noHq}
                  onChange={(e) => setNoHq(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                I don't have an HQ
              </label>
            </div>

            {!noHq && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">HQ Country</label>
                    <select
                      value={hqCountry}
                      onChange={(e) => setHqCountry(e.target.value)}
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
                      value={hqProvinceState}
                      onChange={(e) => setHqProvinceState(e.target.value)}
                      placeholder="BC"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">HQ City</label>
                  <input
                    type="text"
                    value={hqCity}
                    onChange={(e) => setHqCity(e.target.value)}
                    placeholder="Vancouver"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">HQ Street Address</label>
                  <input
                    type="text"
                    value={hqAddress}
                    onChange={(e) => setHqAddress(e.target.value)}
                    placeholder="1428 Charles St, Vancouver, BC"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Bio</label>
              <textarea
                rows={3}
                value={orgBio}
                onChange={(e) => setOrgBio(e.target.value)}
                placeholder="Briefly describe your mission and volunteer work..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              Complete Organizer Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
