'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Building2,
  AlertTriangle,
  Award,
  CheckCircle2,
  Mail,
  Scale,
  Sparkles,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-[#4338ca] p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-blue-100 border border-white/20">
              <Scale className="w-3.5 h-3.5 text-yellow-300" />
              Legal Terms & User Agreement
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-blue-50 leading-relaxed font-medium">
              These terms govern your access and use of Volunteer by Krow. Please read carefully, particularly if you are a minor volunteer or the parent/guardian of a volunteer under 18 years old.
            </p>
            <div className="text-[11px] text-blue-200 font-semibold">
              Effective Date: September 2026 • Platform Version 2.4
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Highlighted Section: Under-18 Minor Volunteers & Parental Consent */}
        <div className="p-6 sm:p-8 rounded-3xl bg-indigo-50/80 border-2 border-indigo-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center font-bold shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Participation by Minors & Parental/Guardian Consent (Under 18)
              </h2>
              <p className="text-xs text-indigo-700 font-medium">
                Crucial terms governing youth accounts, guardian oversight, and opportunity eligibility.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2">
            <div className="p-4 bg-white rounded-2xl border border-indigo-100 space-y-1">
              <span className="font-bold text-gray-900 block">Parental & Guardian Consent:</span>
              <p>
                Volunteers under the age of 18 ("Minor Volunteers") must obtain the knowledge, authorization, and affirmative consent of their parent or legal guardian prior to registering on Krow and attending any volunteer opportunity.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-indigo-100 space-y-1">
              <span className="font-bold text-gray-900 block">Age Eligibility Restrictions:</span>
              <p>
                Each organizer specifies the minimum and maximum age criteria for their opportunities. Krow calculates the volunteer's age on the event date using their registered date of birth to safeguard minors from participating in age-inappropriate activities.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-indigo-100 space-y-1">
              <span className="font-bold text-gray-900 block">Safety & Transportation Responsibility:</span>
              <p>
                Parents and guardians remain responsible for supervising transportation to and from volunteer venues and reviewing event details to confirm physical conditions are suitable for their minor child.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Volunteer Responsibilities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#635BFF]" />
            1. Volunteer Commitments & Conduct
          </h2>
          <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside leading-relaxed">
            <li><strong>Commitment to Attend:</strong> Only RSVP to volunteer events you genuinely intend and are able to attend.</li>
            <li><strong>Timely Notice:</strong> If unable to attend, cancel your registration at least 24 hours prior to the event to allow waiting list volunteers to participate.</li>
            <li><strong>Accurate Check-in:</strong> Use your official Krow ID or registered check-in method honestly. Fictitious attendance claims violate these terms and will result in immediate disqualification.</li>
            <li><strong>Adherence to On-Site Rules:</strong> Follow all safety briefings, site guidelines, and coordinator instructions provided by the host organization.</li>
          </ul>
        </div>

        {/* Section 2: Organizer & Host Responsibilities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#635BFF]" />
            2. Organization & Host Responsibilities
          </h2>
          <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
            <p>
              Organizations posting opportunities on Krow agree to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-900 block mb-1">Safe Environments:</span>
                Provide safe, healthy, and non-hazardous volunteering environments with adequate safety gear and emergency procedures.
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-900 block mb-1">Adult Supervision:</span>
                Ensure certified adult staff or supervisors are physically present during all events involving minors under 18 years old.
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-900 block mb-1">Truthful Listings:</span>
                Accurately depict the location, duration, physical demands, and age criteria of every posted opportunity.
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-900 block mb-1">Prompt Verification:</span>
                Confirm attendance rosters and award verified hours within 7 days of event completion.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Official Certification & Hour Validation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#635BFF]" />
            3. Official Krow Hours & Certificates
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Hours tracked through Volunteer by Krow are intended for official submission to schools, districts, and award bodies. Any attempt to exploit, hack, or falsify volunteer records undermines educational institutions and partner non-profits and will result in permanent ban and notice to relevant school administrators.
          </p>
        </div>

        {/* Section 4: Limitation of Liability */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            4. Limitation of Liability
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Volunteer by Krow serves as a digital coordination platform connecting volunteers with independent community organizations. While we review organizations and enforce strict community standards, Krow is not an employer, agent, or owner of third-party organizations and is not liable for on-site acts, omissions, or injuries occurring at third-party volunteer venues.
          </p>
        </div>

        {/* Footer Contact */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#635BFF]" />
              Need Legal or Policy Clarification?
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Contact our team if you have questions regarding these terms, partnership agreements, or student volunteer verification.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            Contact Legal Team
          </Link>
        </div>

        {/* Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200/80">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Volunteer by Krow Terms of Service
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-[#635BFF] font-semibold transition-colors">
              About Us
            </Link>
            <Link href="/privacy" className="hover:text-[#635BFF] font-semibold transition-colors">
              Privacy Policy
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
