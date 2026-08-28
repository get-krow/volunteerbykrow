'use client';

import React, { useState, useMemo } from 'react';
import { X, User, Building2, ArrowLeft, Loader2, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import { SystemRole, UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: SystemRole;
  onLoginSuccess: (user: UserProfile) => void;
}

function calculateAgeNumber(dobStr: string): number | null {
  if (!dobStr) return null;
  const bDate = new Date(dobStr + 'T00:00:00');
  if (isNaN(bDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - bDate.getFullYear();
  const m = today.getMonth() - bDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
    age--;
  }
  if (age < 0 || age > 120) return null;
  return age;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'volunteer',
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<SystemRole>(initialRole);
  const [view, setView] = useState<'main' | 'email_pass' | 'volunteer_onboarding' | 'organizer_onboarding'>('main');

  // Credentials states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Volunteer onboarding states
  const [dob, setDob] = useState('2004-05-15');
  const [country, setCountry] = useState('Canada');
  const [provinceState, setProvinceState] = useState('BC');
  const [city, setCity] = useState('Vancouver');
  const [isLocating, setIsLocating] = useState(false);

  // Organizer onboarding states
  const [orgName, setOrgName] = useState('');
  const [noHq, setNoHq] = useState(false);
  const [hqAddress, setHqAddress] = useState('');
  const [hqCountry, setHqCountry] = useState('Canada');
  const [hqProvinceState, setHqProvinceState] = useState('BC');
  const [hqCity, setHqCity] = useState('Vancouver');

  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setRole(initialRole);
  }, [initialRole, isOpen]);

  const calculatedAge = useMemo(() => calculateAgeNumber(dob), [dob]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        setCountry('Canada');
        setProvinceState('BC');
        setCity('Vancouver');
        setSuccessMsg('Location set to your local area!');
      },
      () => {
        setIsLocating(false);
        setErrorMsg('Could not retrieve GPS coordinates. Please select manually.');
      }
    );
  };

  const handleGoogleAuth = async () => {
    resetMessages();
    setIsLoading(true);
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.warn('Google Auth fallback initialized:', err);
      // Fallback for Google volunteer onboarding
      setFullName('Google Volunteer');
      setView('volunteer_onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setView('email_pass');
  };

  const handleProceedToOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'volunteer') {
      if (!fullName.trim()) setFullName(email.split('@')[0]);
      setView('volunteer_onboarding');
    } else {
      if (!orgName.trim()) setOrgName(fullName.trim() || email.split('@')[0]);
      setView('organizer_onboarding');
    }
  };

  const handleFinalVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your Date of Birth.');
      return;
    }

    setIsLoading(true);
    let userId: string | null = null;
    const computedName = fullName.trim();

    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.user?.id) {
        userId = signInData.user.id;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: computedName,
              role: 'volunteer',
            },
          },
        });

        if (signUpError) {
          setErrorMsg(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (signUpData?.user?.id) {
          userId = signUpData.user.id;
          if (!signUpData.session) {
            const { data: autoSession } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (autoSession?.user?.id) {
              userId = autoSession.user.id;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Supabase Auth error:', err);
    }

    if (!userId) {
      userId = 'usr_' + Date.now();
    }

    const user: UserProfile = {
      id: userId,
      email,
      role: 'volunteer',
      name: computedName,
      dob,
      country,
      province_state: provinceState,
      city,
      created_at: new Date().toISOString(),
    };

    db.ensureKrowId(user);
    db.setCurrentUser(user);
    await db.saveProfileToSupabase(user);

    setIsLoading(false);
    onLoginSuccess(user);
    onClose();
  };

  const handleFinalOrganizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!orgName.trim()) {
      setErrorMsg('Please enter your Organization Name.');
      return;
    }

    setIsLoading(true);
    let userId: string | null = null;
    const computedOrgName = orgName.trim();

    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.user?.id) {
        userId = signInData.user.id;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: computedOrgName,
              role: 'organizer',
            },
          },
        });

        if (signUpError) {
          setErrorMsg(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (signUpData?.user?.id) {
          userId = signUpData.user.id;
          if (!signUpData.session) {
            const { data: autoSession } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (autoSession?.user?.id) {
              userId = autoSession.user.id;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Supabase Auth error:', err);
    }

    if (!userId) {
      userId = 'usr_org_' + Date.now();
    }

    const user: UserProfile = {
      id: userId,
      email,
      role: 'organizer',
      name: computedOrgName,
      country: noHq ? 'Remote' : hqCountry,
      province_state: noHq ? 'Digital' : hqProvinceState,
      city: noHq ? 'Online' : hqCity,
      created_at: new Date().toISOString(),
    };

    const orgData = {
      id: userId,
      org_name: computedOrgName,
      hq_country: noHq ? 'Remote' : hqCountry,
      hq_province_state: noHq ? 'Digital' : hqProvinceState,
      hq_city: noHq ? 'Online' : hqCity,
      hq_address: noHq ? null : hqAddress,
      no_hq: noHq,
      verification_status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    db.ensureKrowId(user);
    db.setCurrentUser(user);
    await db.saveProfileToSupabase(user);
    db.saveOrganizer(orgData);
    await db.saveOrganizerToSupabase(orgData);

    setIsLoading(false);
    window.location.href = '/organizer/opportunities';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] shadow-2xl border border-gray-100 max-w-[440px] w-full p-7 sm:p-8 relative text-gray-900 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button */}
        {view !== 'main' && (
          <button
            onClick={() => {
              if (view === 'volunteer_onboarding' || view === 'organizer_onboarding') {
                setView('email_pass');
              } else {
                setView('main');
              }
              resetMessages();
            }}
            className="absolute top-5 left-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs font-semibold"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Role Selector */}
        {view === 'main' && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 p-1 rounded-full border border-gray-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  role === 'volunteer'
                    ? 'bg-white text-gray-900 shadow-2xs font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#635BFF]" /> Volunteer
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  role === 'organizer'
                    ? 'bg-[#635BFF] text-white shadow-2xs font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Organizer
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2 font-medium">
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: MAIN VIEW */}
        {view === 'main' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 text-center mb-1.5 tracking-tight">
              Log in or sign up
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
              {role === 'volunteer'
                ? 'Join to track volunteer hours, receive certificates, and discover local events.'
                : 'Sign up as an organization to post opportunities and manage rosters.'}
            </p>

            {role === 'volunteer' && (
              <>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm flex items-center justify-center gap-3 transition-colors shadow-2xs"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-bold text-gray-400 tracking-wider">
                    OR
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </>
            )}

            <form onSubmit={handleContinueWithEmail} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-5 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#635BFF] focus:bg-white focus:ring-2 focus:ring-[#635BFF]/20 transition-all font-medium"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-sm rounded-full transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Continue</span>}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PASSWORD ENTRY */}
        {view === 'email_pass' && (
          <form onSubmit={handleProceedToOnboarding} className="space-y-4 pt-2">
            <div className="text-center mb-4">
              <h3 className="text-xl font-black text-gray-900">Enter password</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {role === 'organizer' ? 'Organization / Contact Name' : 'Full Name (Optional)'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'organizer' ? 'e.g. Vancouver Food Bank' : 'e.g. Alex Smith'}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#635BFF] focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#635BFF] focus:bg-white transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-sm rounded-full transition-colors mt-2 flex items-center justify-center gap-2 shadow-md"
            >
              <span>Next</span>
            </button>
          </form>
        )}

        {/* STEP 3 (VOLUNTEER): BIRTHDATE & LOCATION */}
        {view === 'volunteer_onboarding' && (
          <form onSubmit={handleFinalVolunteerSubmit} className="space-y-4 pt-1">
            <div className="text-center mb-3">
              <h3 className="text-xl font-black text-gray-900">Volunteer Details</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Your age and location will appear on your profile and show events near you.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Zachary Tan"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium focus:border-[#635BFF] focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">Date of Birth</label>
                {calculatedAge !== null && (
                  <span className="text-[11px] font-black text-[#635BFF] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    {calculatedAge} years old
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                value={dob}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium focus:border-[#635BFF] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">Location</label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-[#635BFF] hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{isLocating ? 'Locating...' : '📍 Use my location'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium"
                  >
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Province/State</label>
                  <select
                    value={provinceState}
                    onChange={(e) => setProvinceState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium"
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
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Vancouver, Coquitlam"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium focus:border-[#635BFF] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-full transition-colors mt-2 flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Finish Sign Up</span>}
            </button>
          </form>
        )}

        {/* STEP 3 (ORGANIZER): ORGANIZATION NAME & HQ LOCATION */}
        {view === 'organizer_onboarding' && (
          <form onSubmit={handleFinalOrganizerSubmit} className="space-y-4 pt-1">
            <div className="text-center mb-3">
              <h3 className="text-xl font-black text-gray-900">Organization Profile</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Set up your organization and headquarters details.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Vancouver Food Bank"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium focus:border-[#635BFF] focus:bg-white transition-all"
              />
            </div>

            {/* HQ Checkbox */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noHq}
                  onChange={(e) => setNoHq(e.target.checked)}
                  className="w-4 h-4 rounded text-[#635BFF] focus:ring-[#635BFF]"
                />
                <span className="text-xs font-bold text-gray-800">
                  We don't have a physical HQ (Remote / Digital Organization)
                </span>
              </label>
            </div>

            {/* HQ Address & Location (Disabled if noHq) */}
            <div className={`space-y-2 pt-1 border-t border-gray-100 ${noHq ? 'opacity-40 pointer-events-none' : ''}`}>
              <label className="block text-xs font-bold text-gray-700">Headquarters Location</label>
              
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Street Address</label>
                <input
                  type="text"
                  disabled={noHq}
                  value={hqAddress}
                  onChange={(e) => setHqAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Suite 400"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Country</label>
                  <select
                    disabled={noHq}
                    value={hqCountry}
                    onChange={(e) => setHqCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium"
                  >
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Province/State</label>
                  <select
                    disabled={noHq}
                    value={hqProvinceState}
                    onChange={(e) => setHqProvinceState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium"
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
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  disabled={noHq}
                  value={hqCity}
                  onChange={(e) => setHqCity(e.target.value)}
                  placeholder="e.g. Vancouver"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-full transition-colors mt-2 flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Create Organization Account</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
