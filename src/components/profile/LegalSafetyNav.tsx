'use client';

import React from 'react';
import Link from 'next/link';
import {
  Info,
  ShieldCheck,
  FileText,
  HeartHandshake,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface LegalSafetyNavProps {
  className?: string;
  showYouthBanner?: boolean;
}

export const LegalSafetyNav: React.FC<LegalSafetyNavProps> = ({
  className = '',
  showYouthBanner = true,
}) => {
  const policyItems = [
    {
      title: 'About Us',
      subtitle: 'Our Mission & Community',
      mobileShort: 'Platform Story & Mission',
      description: 'Discover how Volunteer by Krow connects volunteers, empowers student leaders, and validates hours with trusted organizations.',
      href: '/about',
      icon: Info,
      badge: 'About Krow',
      theme: 'from-purple-500/10 to-indigo-500/10 border-purple-200/80 text-[#635BFF]',
      iconBg: 'bg-purple-50 text-[#635BFF] border-purple-200/70',
      buttonText: 'About Krow',
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Data & Minor Protection',
      mobileShort: 'COPPA & Minor Privacy',
      description: 'Learn how your personal details, minor privacy (COPPA/student privacy), and location data are strictly safeguarded.',
      href: '/privacy',
      icon: ShieldCheck,
      badge: 'Under-18 Privacy',
      theme: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/80 text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/70',
      buttonText: 'Privacy Policy',
    },
    {
      title: 'Terms of Service',
      subtitle: 'User & Volunteer Agreement',
      mobileShort: 'Rules & Guardian Consent',
      description: 'Review rules of participation, guardian consent requirements for youth volunteers, and organizer responsibilities.',
      href: '/terms',
      icon: FileText,
      badge: 'Youth Rules',
      theme: 'from-blue-500/10 to-indigo-500/10 border-blue-200/80 text-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200/70',
      buttonText: 'Terms of Service',
    },
    {
      title: 'Community Guidelines',
      subtitle: 'Safety & Code of Conduct',
      mobileShort: 'Safe Spaces & Code of Conduct',
      description: 'Our core standards for respectful volunteering, safe supervision of minors, and zero tolerance for harassment.',
      href: '/community-guidelines',
      icon: HeartHandshake,
      badge: 'Safe Spaces',
      theme: 'from-rose-500/10 to-purple-500/10 border-rose-200/80 text-rose-600',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200/70',
      buttonText: 'Community Guidelines',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#635BFF]" />
          Trust, Safety & Legal Policies
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Important documentation for volunteers, parents & organizers.
        </p>
      </div>

      {/* Under-18 Minor Protection Banner */}
      {showYouthBanner && (
        <>
          {/* Mobile Streamlined Youth Banner */}
          <div className="sm:hidden p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> Under-18 Youth Safety
              </span>
              <Link
                href="/community-guidelines"
                className="text-[11px] font-extrabold text-purple-200 underline hover:text-white flex items-center gap-0.5"
              >
                Rules &rarr;
              </Link>
            </div>
            <p className="text-[11px] text-purple-100 leading-snug">
              Adult supervision and parental transparency are strictly enforced across all youth volunteer events.
            </p>
          </div>

          {/* Desktop Expansive Youth Banner */}
          <div className="hidden sm:block relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#635BFF] p-5 text-white shadow-md">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white tracking-wide uppercase">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Youth & Minor Volunteer Protection (Under 18)
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Committed to Safe, Supervised & Transparent Volunteering
                </h4>
                <p className="text-xs text-purple-100 leading-relaxed">
                  Many of our volunteers are high school students fulfilling community service. We enforce strict organizer standards, adult supervision, and parental visibility to ensure every environment is safe and welcoming.
                </p>
              </div>
              <Link
                href="/community-guidelines"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#635BFF] hover:bg-purple-50 rounded-xl text-xs font-extrabold shadow-sm transition-all flex-shrink-0 group"
              >
                <span>Review Safety Rules</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </>
      )}

      {/* MOBILE VIEW: Touch-Optimized iOS/Android-Style Grouped Settings List */}
      <div className="block sm:hidden rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-2xs divide-y divide-gray-100">
        {policyItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center justify-between p-3.5 hover:bg-purple-50/50 active:bg-purple-100/60 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-gray-900 truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-purple-50 text-[#635BFF] border border-purple-100">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {item.mobileShort}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>

      {/* DESKTOP VIEW: Expansive 2x2 Feature Grid with Hover Animations */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
        {policyItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex flex-col justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.theme} border flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-[#635BFF] transition-colors">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-[#635BFF] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-gray-100/80 flex items-center justify-between text-xs font-bold text-[#635BFF]">
                <span className="group-hover:underline">{item.buttonText}</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 group-hover:bg-[#635BFF] group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
