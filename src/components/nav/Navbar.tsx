'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Bell, User, Building2, Compass, LayoutDashboard, Shield, LogOut, Check, ChevronDown, Sun, Moon } from 'lucide-react';
import { UserProfile, SystemRole, NotificationItem } from '@/lib/types';
import { db } from '@/lib/db';
import { useTheme } from '@/lib/theme';
import { DobReminderModal } from '../auth/DobReminderModal';
import { getAvatarDataUrl } from '@/lib/avatar';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (role?: SystemRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onOpenAuth, onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    currentUser ? db.getNotifications(currentUser.id) : []
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleToggleNotifications = () => {
    if (!currentUser) {
      onOpenAuth('volunteer');
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

  const handleNotificationClick = (item: NotificationItem) => {
    db.markNotificationRead(item.id);
    if (currentUser) {
      setNotifications(db.getNotifications(currentUser.id));
    }
    setShowNotifications(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        {(() => {
          const isOrganizer = currentUser?.role === 'organizer' || pathname?.startsWith('/organizer');
          return (
            <Link href={isOrganizer ? '/organizer/opportunities' : '/'} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight text-gray-900">
                  {isOrganizer ? 'ORGANIZER' : 'VOLUNTEER'} <span className="text-brand-600">BY KROW</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                  {isOrganizer ? 'Organizer Portal' : 'Discovery & Management'}
                </span>
              </div>
            </Link>
          );
        })()}

        {/* Dynamic Role Navigation Tabs */}
        {currentUser?.role === 'volunteer' && (
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-full border border-gray-200/50">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Discover
            </Link>
            <Link
              href="/organizations"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/organizations' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Organizations
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/dashboard' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/profile' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </Link>
          </nav>
        )}

        {currentUser?.role === 'organizer' && (
          <nav className="hidden md:flex items-center gap-1 bg-purple-50 p-1 rounded-full border border-purple-100">
            <Link
              href="/organizer"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/organizer' ? 'bg-white text-brand-700 shadow-sm' : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Organizer Portal
            </Link>
          </nav>
        )}

        {/* Right Section: Notification Bell & User Controls */}
        <div className="flex items-center gap-3">
          {/* Global Persistent Notification Bell */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-purple-50 rounded-full transition-colors"
              title="In-app Notifications"
              id="notification-bell-btn"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse-subtle">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-dropdown border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">No notifications yet</div>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`w-full text-left p-3 text-xs transition-colors hover:bg-purple-50/50 flex gap-3 ${
                          !item.is_read ? 'bg-purple-50/30 font-medium' : 'text-gray-600'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">{item.title}</div>
                          <div className="text-gray-500 mt-0.5">{item.message}</div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Buttons / Profile Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={currentUser.role === 'organizer' ? '/organizer/profile' : '/profile'}
                className="flex items-center gap-2 group p-1 rounded-full hover:bg-purple-50/60 dark:hover:bg-slate-800 transition-colors"
                title="View Profile Settings"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 border border-purple-200 shadow-2xs shrink-0 flex items-center justify-center text-xs font-black text-[#635BFF]">
                  {currentUser.role === 'volunteer' ? (
                    <img
                      src={currentUser.avatar_url || getAvatarDataUrl()}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name?.charAt(0) || 'O'
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight group-hover:text-[#635BFF] transition-colors">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={async () => {
                  await db.logout();
                  if (onLogout) onLogout();
                  window.location.href = '/';
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('volunteer')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:text-brand-600 hover:bg-purple-50 transition-colors"
              >
                Volunteer Sign In
              </button>
              <button
                onClick={() => onOpenAuth('organizer')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
              >
                Organizer Portal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      {currentUser?.role === 'volunteer' && (
        <div className="md:hidden flex border-t border-gray-100 justify-around bg-white py-2 px-1">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              pathname === '/' ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <Compass className="w-4 h-4" />
            Discover
          </Link>
          <Link
            href="/organizations"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              pathname === '/organizations' ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Organizations
          </Link>
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              pathname === '/dashboard' ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              pathname === '/profile' ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
        </div>
      )}
    </header>
  );
};
