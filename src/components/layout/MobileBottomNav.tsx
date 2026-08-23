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
  Briefcase,
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/db';

interface MobileBottomNavProps {
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
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

  // Section 6 Spec: 4 Primary Tabs with Icon + Label for Mobile
  const volunteerNavItems = [
    { name: 'Posts', href: '/opportunities', icon: Compass },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const organizerNavItems = [
    { name: 'Opportunities', href: '/organizer/opportunities', icon: Briefcase },
    { name: 'Add', href: '/organizer/add', icon: PlusCircle },
    { name: 'Attendance', href: '/organizer/attendance', icon: ClipboardCheck },
    { name: 'Profile', href: '/organizer/profile', icon: User },
  ];

  const navItems = isOrganizer ? organizerNavItems : volunteerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1.5 md:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/opportunities' && (pathname === '/' || pathname === '/opportunities')) ||
            (item.href === '/organizer/opportunities' && pathname === '/organizer');

          const requiresAuth = !isOrganizer && (item.href === '/dashboard' || item.href === '/profile');

          if (!currentUser && requiresAuth) {
            return (
              <button
                key={item.name}
                onClick={onOpenAuth}
                className="flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-400 mb-0.5" />
                <span>{item.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#635BFF] font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#635BFF]' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
