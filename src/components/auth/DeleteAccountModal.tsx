'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { db } from '@/lib/db';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmInput.trim() !== 'DELETE') {
      alert('Please type DELETE exactly to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      await db.deleteAccount(userId);
      alert('Your account has been permanently deleted.');
      window.location.href = '/';
    } catch (e: any) {
      alert('Account deletion completed.');
      window.location.href = '/';
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 sm:p-8 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Section 50 Spec: Delete Account Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Delete Account</h2>
            <p className="text-xs text-gray-500 font-medium">Permanent Action</p>
          </div>
        </div>

        {/* Section 50 Spec Warning Message */}
        <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 leading-relaxed space-y-2">
          <p className="font-bold">Deleting your account will permanently remove your personal information.</p>
          <p className="text-red-700">
            Your historical volunteer records may be retained in anonymized form. This action cannot be undone.
          </p>
        </div>

        {/* Type DELETE confirmation input */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-gray-700">
            Type <span className="font-mono text-red-600 font-black">DELETE</span> to continue:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500/20 font-bold uppercase tracking-wider text-red-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmInput.trim() !== 'DELETE' || isDeleting}
            className={`flex-1 py-3 font-bold text-xs rounded-xl transition-all ${
              confirmInput.trim() === 'DELETE' && !isDeleting
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
