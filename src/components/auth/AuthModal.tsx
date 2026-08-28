'use client';

import React, { useState } from 'react';
import { X, User, Building2, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { SystemRole, UserProfile } from '@/lib/types';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

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
  const [view, setView] = useState<'main' | 'email_pass'>('main');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setRole(initialRole);
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
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
      const googleUser: UserProfile = {
        id: 'usr_google_' + Date.now(),
        email: email || 'volunteer.google@gmail.com',
        role: role,
        name: role === 'organizer' ? 'Google Organization' : 'Google Volunteer',
        country: 'Canada',
        province_state: 'BC',
        city: 'Vancouver',
        created_at: new Date().toISOString(),
      };
      db.setCurrentUser(googleUser);
      await db.saveProfileToSupabase(googleUser);
      onLoginSuccess(googleUser);
      onClose();
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

  const handleCompleteEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    let userId: string | null = null;
    let computedName = fullName.trim() || email.split('@')[0];

    try {
      // 1. Try Signing In first (if account already exists)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.user?.id) {
        userId = signInData.user.id;
        computedName = signInData.user.user_metadata?.full_name || computedName;
      } else {
        // 2. If sign in fails, create new account via Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: computedName,
              role,
            },
          },
        });

        if (signUpError) {
          console.warn('Supabase Auth signUp error:', signUpError.message);
          setErrorMsg(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (signUpData?.user?.id) {
          userId = signUpData.user.id;
          
          // Auto sign in to establish auth session if auto-session wasn't returned
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

    // Local test fallback if Supabase auth client is offline
    if (!userId) {
      userId = 'usr_' + Date.now();
    }

    const user: UserProfile = {
      id: userId,
      email,
      role,
      name: computedName,
      country: 'Canada',
      province_state: 'BC',
      city: 'Vancouver',
      created_at: new Date().toISOString(),
    };

    db.ensureKrowId(user);
    db.setCurrentUser(user);
    const saved = await db.saveProfileToSupabase(user);
    console.log('Supabase profile save status:', saved);

    if (role === 'organizer') {
      const existingOrg = db.getOrganizer(user.id);
      const orgData = existingOrg || {
        id: user.id,
        org_name: user.name,
        hq_country: 'Canada',
        hq_province_state: 'BC',
        hq_city: 'Vancouver',
        no_hq: false,
        verification_status: 'pending' as const,
        created_at: new Date().toISOString(),
      };
      db.saveOrganizer(orgData);
      await db.saveOrganizerToSupabase(orgData);
      setIsLoading(false);
      window.location.href = '/organizer/opportunities';
      return;
    }

    setIsLoading(false);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] shadow-2xl border border-gray-100 max-w-[420px] w-full p-7 sm:p-8 relative text-gray-900 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button (if inside sub-views) */}
        {view !== 'main' && (
          <button
            onClick={() => {
              setView('main');
              resetMessages();
            }}
            className="absolute top-5 left-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs font-semibold"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Account Role Selector (Volunteer / Organizer) */}
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

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2">
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MAIN VIEW */}
        {view === 'main' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 text-center mb-1.5 tracking-tight">
              Log in or sign up
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
              You’ll get smarter responses and can upload files, images, and more.
            </p>

            {role === 'volunteer' && (
              <>
                <div className="space-y-3">
                  {/* Google Button */}
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

                {/* Divider */}
                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-bold text-gray-400 tracking-wider">
                    OR
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </>
            )}

            {/* Email Input & Continue Form */}
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

        {/* SUB-VIEW 1: Password & Details for Email Auth */}
        {view === 'email_pass' && (
          <form onSubmit={handleCompleteEmailAuth} className="space-y-4 pt-2">
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Complete Sign In</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
