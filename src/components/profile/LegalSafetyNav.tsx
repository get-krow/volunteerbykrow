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
  UserCheck,
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
      description: 'Discover how Volunteer by Krow connects volunteers, empowers student leaders, and validates hours with trusted organizations.',
      href: '/about',
      icon: Info,
      badge: 'Platform Story',
      theme: 'from-purple-500/10 to-indigo-500/10 border-purple-200/80 text-[#635BFF]',
      buttonText: 'About Krow',
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Data & Minor Protection',
      description: 'Learn how your personal details, minor privacy (COPPA/student privacy), and location data are strictly safeguarded.',
      href: '/privacy',
      icon: ShieldCheck,
      badge: 'Under-18 Privacy',
      theme: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/80 text-emerald-600',
      buttonText: 'Privacy Policy',
    },
    {
      title: 'Terms of Service',
      subtitle: 'User & Volunteer Agreement',
      description: 'Review rules of participation, guardian consent requirements for youth volunteers, and organizer responsibilities.',
      href: '/terms',
      icon: FileText,
      badge: 'Youth Guidelines',
      theme: 'from-blue-500/10 to-indigo-500/10 border-blue-200/80 text-blue-600',
      buttonText: 'Terms of Service',
    },
    {
      title: 'Community Guidelines',
      subtitle: 'Safety & Code of Conduct',
      description: 'Our core standards for respectful volunteering, safe supervision of minors, and zero tolerance for harassment.',
      href: '/community-guidelines',
      icon: HeartHandshake,
      badge: 'Safe Spaces',
      theme: 'from-rose-500/10 to-purple-500/10 border-rose-200/80 text-rose-600',
      buttonText: 'Community Guidelines',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Trust & Safety Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#635BFF]" />
            Trust, Safety & Legal Policies
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Important documentation and safety guidelines for all volunteers, parents, and community partners.
          </p>
        </div>
      </div>

      {/* Under-18 Minor Protection Banner */}
      {showYouthBanner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#635BFF] p-4 sm:p-5 text-white shadow-md">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Youth & Minor Volunteer Protection (Under 18)
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Committed to Safe, Supervised & Transparent Volunteering
              </h4>
              <p className="text-xs text-purple-100 leading-relaxed">
                Many of our volunteers are high school students and youth under 18 fulfilling community service. We enforce strict organizer standards, adult supervision, and parental visibility to ensure every environment is safe and welcoming.
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
          {/* Subtle Background Glow */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      )}

      {/* Grid of 4 Redirect Buttons / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {policyItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-card-hover transition-all duration-200"
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
