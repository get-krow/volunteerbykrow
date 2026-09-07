'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  FileCheck,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-10 space-y-6 sm:space-y-8">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200/80 text-xs font-bold text-gray-600 hover:text-[#635BFF] hover:border-purple-200 transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Profile</span>
          </Link>
          <span className="text-[11px] font-semibold text-gray-400">Trust & Safety</span>
        </div>

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-[#10b981] p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-emerald-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
              Privacy & Data Protection
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-medium">
              We are deeply committed to protecting personal privacy. Because a substantial portion of our community consists of students and volunteers under the age of 18, we enforce specialized youth data privacy standards.
            </p>
            <div className="text-[11px] text-emerald-200 font-semibold">
              Last Updated: September 2026 • Compliant with youth privacy regulations (COPPA / PIPEDA)
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Dedicated Under-18 Children & Minor Privacy Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-purple-50/80 border-2 border-purple-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center font-bold shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Children & Minor Privacy Protections (Under 18)
              </h2>
              <p className="text-xs text-purple-700 font-medium">
                Mandatory safeguards and parent/guardian rights for young volunteers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 pt-2">
            <div className="p-4 bg-white rounded-2xl border border-purple-100 space-y-1.5">
              <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-[#635BFF]" /> Strict Data Minimization
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                We only collect information strictly required to match volunteers with opportunities and certify community service hours (name, age/birth date for age eligibility verification, and email). We never collect government IDs or unnecessary personal identifiers from minors.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100 space-y-1.5">
              <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#635BFF]" /> No Public Directory of Minors
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Minor profiles are never indexed by public search engines or made publicly browsable. Only the authorized coordinator of an opportunity a student has specifically registered for can view their name and volunteer credentials on the event roster.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100 space-y-1.5">
              <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#635BFF]" /> Parental & Guardian Rights
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Parents and legal guardians of minors have the right at any time to inspect their child's volunteer records, request corrections to their information, or request full, irreversible erasure of the minor's account and profile data.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100 space-y-1.5">
              <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#635BFF]" /> Zero Third-Party Monetization
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Volunteer by Krow does not sell, rent, license, or monetize any user data. We do not serve behavioral advertisements, targeted ads, or share student data with marketing data brokers under any circumstances.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-6">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#635BFF]" />
            1. Information We Collect
          </h2>
          <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-gray-900 block">Account & Profile Information:</span>
              <p>
                When you create a volunteer account, we collect your name, email address, date of birth (used exclusively to verify event age eligibility criteria), optional bio, and profile image.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-gray-900 block">Location & Region Preferences:</span>
              <p>
                We store your general country, province/state, and city to display volunteer opportunities occurring in your community. We do not require or track real-time GPS location coordinates.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-gray-900 block">Attendance & Service Records:</span>
              <p>
                When you participate in an opportunity, we record your attendance status, hours completed, check-in timestamps, and generate an official verification certificate with your unique Krow ID.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: How Information Is Used */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#635BFF]" />
            2. How We Use Information
          </h2>
          <ul className="space-y-2.5 text-xs text-gray-600 list-disc list-inside">
            <li>To match volunteers with appropriate, age-eligible community opportunities.</li>
            <li>To enable verified event organizers to manage attendance rosters and confirm service hours.</li>
            <li>To generate verified certificates of volunteer service for school graduation or scholarship verification.</li>
            <li>To send critical operational notifications (e.g., event time changes, cancellations, or emergency safety alerts).</li>
          </ul>
        </div>

        {/* Section 3: Data Deletion & Rights */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            3. Account Deletion & Right to Be Forgotten
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every user—volunteer or organization—maintains full autonomy over their data. You can permanently delete your account at any time using the <strong>Delete Account</strong> option in your Profile settings. Upon deletion, personal details, photos, and roster links are permanently erased from our active databases.
          </p>
        </div>

        {/* Section 4: Contact Our Privacy Team */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#635BFF]" />
              Questions or Parental Inquiries?
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Parents, educators, or volunteers with questions regarding our youth privacy policies or data handling can contact our dedicated trust & safety team.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            Contact Privacy Support
          </Link>
        </div>

        {/* Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200/80">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Volunteer by Krow Privacy Standards
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-[#635BFF] font-semibold transition-colors">
              About Us
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
