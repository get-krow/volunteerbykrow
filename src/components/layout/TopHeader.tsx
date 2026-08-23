'use client';

import React, { useState } from 'react';
import { Search, Sun, Bell, LogOut, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { NotificationItem } from '@/lib/types';

interface TopHeaderProps {
  onSearchChange?: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onSearchChange }) => {
  const currentUser = typeof window !== 'undefined' ? db.getCurrentUser() : null;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    currentUser ? db.getNotifications(currentUser.id) : []
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleToggleNotifications = () => {
    if (!currentUser) return;
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

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input Box */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100/70 border-none rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        {/* Light/Dark Theme Toggle */}
        <button
          className="w-9 h-9 rounded-full border border-purple-200/80 bg-white text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-colors"
          title="Toggle Light/Dark Mode"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Notification Bell (Persistent top-right across all tabs) */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="w-9 h-9 rounded-full border border-gray-100 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center relative transition-colors"
            title="In-app Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#635BFF] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

        {/* Sign Out Icon Button */}
        {currentUser && (
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full border border-gray-100 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
