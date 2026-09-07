'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  HeartHandshake,
  ShieldCheck,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck,
  FileText,
} from 'lucide-react';

export default function CommunityGuidelinesPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#635BFF] via-indigo-600 to-purple-800 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-purple-100 border border-white/20">
              <HeartHandshake className="w-3.5 h-3.5 text-yellow-300" />
              Community & Safety Standards
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Community Guidelines
            </h1>
            <p className="text-sm sm:text-base text-purple-100 leading-relaxed font-medium">
              Volunteer by Krow is built on empathy, civic contribution, and trust. Because our community includes students and volunteers under 18, we maintain the highest standards of safety, respect, and adult accountability.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Highlighted Callout: Under-18 Youth Protection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 border-2 border-amber-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                Youth & Minor Protection Standards (Under 18)
              </h2>
              <p className="text-xs text-amber-800 font-medium">
                Guidelines specifically established for the physical and emotional safety of young volunteers.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-amber-900 leading-relaxed pt-2">
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-1.5">
              <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Dedicated Adult Supervision
              </div>
              <p className="text-gray-600 text-[11px]">
                Every event hosting minor volunteers must have verified, designated adult staff or supervisors present at all times. Private, unmonitored one-on-one interactions between adult organizers and minor volunteers are strictly prohibited.
              </p>
            </div>
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-1.5">
              <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Age-Appropriate Tasks & Safety
              </div>
              <p className="text-gray-600 text-[11px]">
                Minors must not be assigned hazardous equipment, heavy industrial machinery, dangerous heights, or high-risk tasks. Organizers must provide required personal safety gear (gloves, vests, etc.) and comprehensive safety briefing.
              </p>
            </div>
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-1.5">
              <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Parent & Guardian Transparency
              </div>
              <p className="text-gray-600 text-[11px]">
                Volunteers under 18 must have parental or legal guardian consent to participate. Opportunity locations, hours, and supervisory contacts must remain transparent so parents can verify event details.
              </p>
            </div>
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-1.5">
              <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Reasonable Shift Lengths & Curfews
              </div>
              <p className="text-gray-600 text-[11px]">
                Volunteer shifts for school-age students must adhere to regional youth labor and safety standards, avoiding late night hours on school evenings and ensuring adequate rest and meal breaks.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Core Volunteer Values */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#635BFF]" />
              1. General Code of Conduct
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Every volunteer and organizer on Krow is expected to uphold these basic tenets of civic engagement:
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                A
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xs">Respect & Inclusivity</h3>
                <p className="mt-0.5 leading-relaxed text-gray-600">
                  Treat every fellow volunteer, staff member, and community recipient with dignity. Discrimination, hateful language, slurs, or harassment based on age, race, ethnicity, religion, gender, sexual orientation, disability, or background are strictly prohibited.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                B
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xs">Punctuality & Reliability</h3>
                <p className="mt-0.5 leading-relaxed text-gray-600">
                  Community causes rely on your attendance. If you register for an opportunity, arrive on time and prepared. If you cannot attend due to sickness or emergency, cancel your registration in advance so another volunteer can take your spot.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                C
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xs">Honesty in Attendance & Hours Verification</h3>
                <p className="mt-0.5 leading-relaxed text-gray-600">
                  Krow generates official volunteer certificates used for high school graduation and university applications. Falsifying hours, checking in without being physically present, or claiming unworked hours undermines the community and results in permanent account suspension.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Zero Tolerance Prohibitions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-black text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              2. Zero Tolerance Violations
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Engaging in any of the following actions will result in immediate termination of account access and, where appropriate, notification to law enforcement:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1">
              <h3 className="font-extrabold text-red-900">Endangerment of Minors</h3>
              <p className="text-red-700 text-[11px] leading-relaxed">
                Any form of physical, sexual, or emotional exploitation, abuse, or inappropriate communications toward under-18 volunteers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1">
              <h3 className="font-extrabold text-red-900">Harassment & Bullying</h3>
              <p className="text-red-700 text-[11px] leading-relaxed">
                Intimidation, stalking, unwanted romantic advances, threats, or cyberbullying on or off the volunteer site.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1">
              <h3 className="font-extrabold text-red-900">Alcohol, Drugs & Weapons</h3>
              <p className="text-red-700 text-[11px] leading-relaxed">
                Possession, consumption, or distribution of alcohol, cannabis, illegal substances, or weapons at any volunteer event.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1">
              <h3 className="font-extrabold text-red-900">Fraud & Commercial Solicitation</h3>
              <p className="text-red-700 text-[11px] leading-relaxed">
                Using volunteer opportunities to sell products, solicit funds for private gain, or falsify volunteer certification logs.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Reporting & Contact */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#635BFF]" />
                Reporting Concerns or Violations
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                If you are a student, parent, or organizer who witnesses unsafe behavior, inappropriate conduct, or policy violations, report it immediately. Reports involving minor safety are handled with urgency and discretion.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Contact Safety Team
            </Link>
          </div>
        </div>

        {/* Quick Links Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200/80">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Volunteer by Krow Trust & Safety
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-[#635BFF] font-semibold transition-colors">
              About Us
            </Link>
            <Link href="/privacy" className="hover:text-[#635BFF] font-semibold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#635BFF] font-semibold transition-colors">
              Terms of Service
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
