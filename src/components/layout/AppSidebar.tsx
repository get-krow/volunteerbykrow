'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Building2,
  LayoutDashboard,
  User,
  PlusCircle,
  ClipboardCheck,
  LogOut,
  ChevronLeft,
  Briefcase,
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  currentUser: propUser,
  onOpenAuth,
}) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const currentUser = propUser || (typeof window !== 'undefined' ? db.getCurrentUser() : null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isOrganizer = isMounted && currentUser?.role === 'organizer';

  // Section 11 & Section 30 Spec: Exactly 4 Primary Tabs for Volunteer, 4 for Organizer
  const volunteerNavItems = [
    { name: 'Posts by Organizers', href: '/opportunities', icon: Compass },
    { name: 'Posts by Organizations', href: '/organizations', icon: Building2 },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const organizerNavItems = [
    { name: 'Our Opportunities', href: '/organizer/opportunities', icon: Briefcase },
    { name: 'Add Opportunity', href: '/organizer/add', icon: PlusCircle },
    { name: 'Attendance', href: '/organizer/attendance', icon: ClipboardCheck },
    { name: 'Profile', href: '/organizer/profile', icon: User },
  ];

  const navItems = isOrganizer ? organizerNavItems : volunteerNavItems;

  const legalItems = [
    { name: 'About Us', href: '/about' },
    { name: 'How It Works & FAQ', href: '/faq' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  const handleLogout = () => {
    db.setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-gray-100 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 z-50"
      >
        <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <div>
        {/* Brand Header: Exact Image 1 "volunteer by krow" style + Image 2 Purple K Logo */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-50">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Image 2: Purple K Logo Icon */}
            <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-md shadow-purple-500/20 flex-shrink-0 overflow-hidden">
              <img src="/logo.jpg" alt="KROW" className="w-full h-full object-cover" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                {/* Image 1 Style: "volunteer" in bold dark text + "by krow" in light purple pill badge */}
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-gray-900 tracking-tight leading-none">
                    volunteer
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EEECFF] border border-[#D9D3FF] text-[#635BFF] font-extrabold text-[11px] leading-none shadow-2xs">
                    by krow
                  </span>
                </div>
                <span
                  suppressHydrationWarning
                  className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5"
                >
                  {isOrganizer ? 'Organizer Portal' : 'Discovery Platform'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Primary Navigation Section (4 Primary Tabs) */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/opportunities' && (pathname === '/' || pathname === '/opportunities')) ||
              (item.href === '/organizer/opportunities' && pathname === '/organizer');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-50 text-[#635BFF] font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={item.name}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#635BFF]' : 'text-gray-400'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        {!isCollapsed && <div className="my-2 border-t border-gray-100 mx-3" />}

        {/* Legal & Resources Section */}
        {!isCollapsed && (
          <div className="px-3 pt-2">
            <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              RESOURCES & LEGAL
            </div>
            <div className="space-y-1">
              {legalItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom User Footer */}
      <div className="p-3 border-t border-gray-100 bg-white">
        {!isCollapsed ? (
          <div>
            {isMounted && currentUser ? (
              <div>
                <div className="flex items-center gap-2.5 p-1 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-[#635BFF] font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                    {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-gray-400 truncate">{currentUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 text-[#635BFF] font-bold text-xs rounded-xl hover:bg-purple-100 transition-colors"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#635BFF] font-extrabold flex items-center justify-center text-xs">
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'K'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
