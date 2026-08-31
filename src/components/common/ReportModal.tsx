'use client';

import React, { useState } from 'react';
import { Flag, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ReportType } from '@/lib/types';
import { db } from '@/lib/db';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName?: string;
  opportunityId?: string;
  opportunityTitle?: string;
  reporterUserId?: string;
}

const REPORT_CATEGORIES: { id: ReportType; label: string }[] = [
  { id: 'fake_organization', label: 'Fake organization' },
  { id: 'impersonation', label: 'Organization impersonation' },
  { id: 'unsafe_environment', label: 'Unsafe environment' },
  { id: 'misleading_opportunity', label: 'Misleading opportunity' },
  { id: 'suspicious_behavior', label: 'Suspicious behavior' },
  { id: 'inappropriate_conduct', label: 'Inappropriate conduct' },
  { id: 'opportunity_does_not_exist', label: 'Opportunity does not exist' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'other', label: 'Other' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  orgId,
  orgName = 'Organization',
  opportunityId,
  opportunityTitle,
  reporterUserId,
}) => {
  const [reportType, setReportType] = useState<ReportType>('suspicious_behavior');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg('Please provide details about your report.');
      return;
    }

    db.submitReport({
      organization_id: orgId,
      opportunity_id: opportunityId,
      reporter_user_id: reporterUserId || 'anonymous-volunteer',
      report_type: reportType,
      description,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                {opportunityId ? 'Report Opportunity' : 'Report Organization'}
              </h2>
              <p className="text-xs text-gray-500 font-medium truncate max-w-[280px]">
                {opportunityTitle ? `"${opportunityTitle}"` : orgName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900">Report Submitted</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Thank you for keeping Krow safe. Our administrative team will review this report confidentialy.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-extrabold text-gray-700">Reason for Report *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-semibold bg-white"
              >
                {REPORT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-gray-700">Additional Details *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about why you are reporting this organization or opportunity..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
              />
            </div>

            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
              Your identity is protected and will not be shared with the reported organization.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Flag className="w-4 h-4" /> Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
