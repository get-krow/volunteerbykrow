'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun,
  Bell,
  LogOut,
  Check,
  Compass,
  Building2,
  LayoutDashboard,
  User,
  PlusCircle,
  ClipboardCheck,
  Briefcase,
} from 'lucide-react';
import { db } from '@/lib/db';
import { NotificationItem, UserProfile, SystemRole } from '@/lib/types';

interface TopHeaderProps {
  onSearchChange?: (val: string) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (role?: SystemRole) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser: propUser,
  onOpenAuth,
}) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const currentUser = propUser || (typeof window !== 'undefined' ? db.getCurrentUser() : null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (currentUser) {
      setNotifications(db.getNotifications(currentUser.id));
    }
  }, [currentUser]);

  const isOrganizer = isMounted && (currentUser?.role === 'organizer' || pathname?.startsWith('/organizer'));
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleToggleNotifications = () => {
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }
    setShowNotifications(!showNotifications);
    setNotifications(db.getNotifications(currentUser.id));
  };

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    db.markAllNotificationsRead(currentUser.id);
    setNotifications(db.getNotifications(currentUser.id));
  };

  const handleLogout = () => {
    db.setCurrentUser(null);
    window.location.href = '/';
  };

  // Section 5 Spec: Desktop Top Header Navigation (Centered)
  const volunteerNavItems = [
    { name: 'Posts', href: '/opportunities', icon: Compass },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
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

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Brand Header Left: Image 1 "volunteer by krow" style + Image 2 Purple K Logo */}
      <Link href={isOrganizer ? '/organizer/opportunities' : '/'} className="flex items-center gap-2.5 group flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-md shadow-purple-500/20 overflow-hidden">
          <img src="/logo.jpg" alt="KROW" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-lg text-gray-900 tracking-tight leading-none">
            {isOrganizer ? 'organizer' : 'volunteer'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#EEECFF] border border-[#D9D3FF] text-[#635BFF] font-extrabold text-[11px] leading-none shadow-2xs">
            by krow
          </span>
        </div>
      </Link>

      {/* Desktop Centered Navigation Tabs (Section 5 Spec) */}
      <nav className="hidden md:flex items-center gap-1 bg-gray-100/70 p-1 rounded-2xl border border-gray-200/50">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/opportunities' && (pathname === '/' || pathname === '/opportunities')) ||
            (item.href === '/organizer/opportunities' && pathname === '/organizer');

          const requiresAuth = !isOrganizer && (item.href === '/dashboard' || item.href === '/profile');

          if (!currentUser && requiresAuth) {
            return (
              <button
                key={item.name}
                onClick={() => onOpenAuth?.('volunteer')}
                className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl transition-all"
              >
                {item.name}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-[#635BFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Action Icons Right */}
      <div className="flex items-center gap-2.5">
        {/* Light/Dark Theme Toggle */}
        <button
          className="w-9 h-9 rounded-full border border-purple-200/80 bg-white text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-colors"
          title="Toggle Light/Dark Mode"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Persistent Notification Bell (Upper-Right across all tabs) */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="w-9 h-9 rounded-full border border-gray-200/80 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center relative transition-colors"
            title="In-app Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#635BFF] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">In-App Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#635BFF] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 text-xs flex gap-3 transition-colors ${
                        !item.is_read ? 'bg-purple-50/40 font-medium' : 'text-gray-600'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#635BFF] mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-gray-500 mt-0.5">{item.message}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Auth or Sign Out Button */}
        {isMounted && currentUser ? (
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full border border-gray-200/80 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth?.()}
            className="px-4 py-2 bg-[#635BFF] hover:bg-[#5046E5] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
