'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Compass,
  Heart,
  ShieldCheck,
  Award,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#635BFF] via-purple-700 to-indigo-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-purple-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              About Volunteer by Krow
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Empowering Community Action & Youth Leadership
            </h1>
            <p className="text-sm sm:text-base text-purple-100 leading-relaxed font-medium">
              We connect passionate volunteers with verified organizations to build stronger, kinder communities. From high school students earning graduation hours to lifelong community leaders, Krow makes service simple, safe, and verifiable.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Highlight Banner: Youth Empowerment & Minor Safety */}
        <div className="p-6 sm:p-8 rounded-3xl bg-purple-50/70 border-2 border-purple-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-[#635BFF] font-extrabold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Built for Students & Young Volunteers
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            A Safe, Supervised Platform for Under-18 Youth
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Finding verified volunteer opportunities for high school graduation shouldn't require messy paper sign-off sheets or unverified venues. On Krow, student volunteers under 18 find opportunities tailored to their age, complete with adult coordinator supervision, emergency contact clarity, and tamper-proof hour certifications.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/community-guidelines"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#635BFF] text-white rounded-xl text-xs font-bold shadow-2xs hover:bg-[#5046E5] transition-colors"
            >
              <span>Our Youth Safety Standards</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-purple-200 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors"
            >
              <span>Minor Privacy Policy</span>
            </Link>
          </div>
        </div>

        {/* Pillars of Volunteer by Krow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#635BFF] border border-purple-100 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">Local Discovery</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore diverse opportunities across animal shelters, food banks, environmental cleanups, STEM mentoring, and cultural festivals right in your neighborhood.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">Verified Service Records</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every completed hour is logged with a unique Krow ID and coordinator approval, giving students verifiable credentials recognized by schools and scholarship boards.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">Verified Organizations</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We partner with verified non-profits and community associations to ensure events have clear instructions, proper safety standards, and dedicated supervision.
            </p>
          </div>
        </div>

        {/* Why Trust Matters */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Our Community Commitment
          </h2>
          <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
            <p>
              Volunteer by Krow was founded on a simple belief: volunteering changes the person who volunteers just as much as it strengthens the community they serve.
            </p>
            <p>
              By eliminating bureaucratic friction and paper tracking, we enable young people to build empathy, discover future career paths, and forge meaningful civic connections in an environment that puts safety and respect first.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-2xl text-xs font-bold shadow-md transition-all"
            >
              <span>Explore Opportunities Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200/80">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Volunteer by Krow
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#635BFF] font-semibold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#635BFF] font-semibold transition-colors">
              Terms of Service
            </Link>
            <Link href="/community-guidelines" className="hover:text-[#635BFF] font-semibold transition-colors">
              Community Guidelines
            </Link>
            <Link href="/profile" className="hover:text-[#635BFF] font-semibold transition-colors">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
