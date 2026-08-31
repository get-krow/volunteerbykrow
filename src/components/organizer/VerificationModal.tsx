'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  FileCheck,
} from 'lucide-react';
import { OrganizerProfile, OrgRepresentative, OrgVerificationDocument, OrgSafetyInfo } from '@/lib/types';
import { db } from '@/lib/db';

interface VerificationModalProps {
  currentOrg: OrganizerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const ORG_TYPES = [
  'Registered Charity',
  'Non-Profit Organization',
  'School',
  'University/College',
  'Government/Public Organization',
  'Community Organization',
  'Sports Club',
  'Religious/Community Group',
  'Business',
  'Event Organization',
  'Other',
];

const DOCUMENT_TYPES = [
  'Official Registration / Tax Exemption Letter (e.g. 501c3 / Charity Reg)',
  'Business License / Articles of Incorporation',
  'Official Authorization Letter on Organization Letterhead',
  'Representative Staff ID / Work Badge',
  'Organization Utility Bill or Bank Statement',
  'Other Official Verification Document',
];

export const VerificationModal: React.FC<VerificationModalProps> = ({
  currentOrg,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Organization Details
  const [legalName, setLegalName] = useState(currentOrg.legal_name || currentOrg.org_name || '');
  const [publicName, setPublicName] = useState(currentOrg.public_name || currentOrg.org_name || '');
  const [orgType, setOrgType] = useState(currentOrg.organization_type || 'Non-Profit Organization');
  const [description, setDescription] = useState(currentOrg.bio || '');
  const [website, setWebsite] = useState(currentOrg.website || '');
  const [phone, setPhone] = useState(currentOrg.phone || '');
  const [country, setCountry] = useState(currentOrg.hq_country || 'Canada');
  const [provinceState, setProvinceState] = useState(currentOrg.hq_province_state || 'BC');
  const [city, setCity] = useState(currentOrg.hq_city || 'Vancouver');
  const [address, setAddress] = useState(currentOrg.hq_address || '');

  // Representative Info (No Email Verification Step)
  const [repName, setRepName] = useState(currentOrg.representative?.full_name || '');
  const [repRole, setRepRole] = useState(currentOrg.representative?.role || 'Director');
  const [repEmail, setRepEmail] = useState(currentOrg.representative?.email || '');
  const [repPhone, setRepPhone] = useState(currentOrg.representative?.phone || currentOrg.phone || '');

  // Step 2: Document Submission
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [docNumber, setDocNumber] = useState(currentOrg.registration_number || '');
  const [docFileName, setDocFileName] = useState<string | null>(
    currentOrg.documents && currentOrg.documents.length > 0 ? currentOrg.documents[0].file_name : null
  );
  const [docFileData, setDocFileData] = useState<string | null>(
    (currentOrg.documents && currentOrg.documents.length > 0 && currentOrg.documents[0].file_url) ? currentOrg.documents[0].file_url : null
  );

  // Step 3: Safety Agreement
  const [agreedSafety, setAgreedSafety] = useState(true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }
    setDocFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setDocFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      alert('Please enter your organization legal name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter organization phone number.');
      return;
    }
    if (!repName.trim() || !repEmail.trim()) {
      alert('Please enter representative full name and email.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileName && !docFileData) {
      alert('Please upload an official organization verification document.');
      return;
    }
    setStep(3);
  };

  const handleSubmitFinal = async () => {
    if (!agreedSafety) {
      alert('Please agree to Krow volunteer safety guidelines before submitting.');
      return;
    }

    setIsSubmitting(true);

    const representative: OrgRepresentative = {
      full_name: repName,
      role: repRole,
      email: repEmail,
      phone: repPhone,
      email_verified: true, // Auto-marked as verified through document submission
    };

    const documents: OrgVerificationDocument[] = [
      {
        id: 'doc-1',
        organization_id: currentOrg.id,
        document_type: docType,
        file_name: docFileName || 'Verification_Document.pdf',
        storage_path: 'org-docs/' + (docFileName || 'Verification_Document.pdf'),
        file_url: docFileData || 'data:application/pdf;base64,mock',
        uploaded_at: new Date().toISOString(),
        status: 'pending',
      },
    ];

    const safety_info: OrgSafetyInfo = {
      activities: 'Community volunteering and event support',
      locations: ['Organization facility', 'Public location'],
      supervisor_info: `${repName} (${repRole})`,
      minors_allowed: true,
      background_checks: 'Conducted as required per role',
      safety_requirements: 'General volunteer orientation and safety rules apply',
      agreed_rules: agreedSafety,
    };

    await db.submitVerificationApplication(currentOrg.id, {
      legal_name: legalName,
      public_name: publicName || legalName,
      organization_type: orgType,
      description: description || 'Community organization.',
      website: website || undefined,
      phone,
      address: address || city,
      city,
      province_state: provinceState,
      country,
      registration_type: docType,
      registration_number: docNumber || undefined,
      country_of_registration: country,
      representative,
      documents,
      safety_info,
    });

    setIsSubmitting(false);
    onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Fast Organization Verification</h2>
              <p className="text-xs text-gray-500 font-medium">
                Submit official proof to gain 🟣 Krow Verified status & award hours.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar (3 Fast Steps) */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[
            { s: 1, label: '1. Org & Contact' },
            { s: 2, label: '2. Upload Document' },
            { s: 3, label: '3. Submit' },
          ].map((item) => (
            <div key={item.s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === item.s
                    ? 'bg-[#635BFF] text-white shadow-md'
                    : step > item.s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > item.s ? '✓' : item.s}
              </div>
              <span
                className={`text-xs font-extrabold ${
                  step === item.s ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: ORGANIZATION & CONTACT INFO */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Legal Organization Name *</label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Greater Vancouver Food Bank Society"
                  className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Public Display Name</label>
                <input
                  type="text"
                  value={publicName}
                  onChange={(e) => setPublicName(e.target.value)}
                  placeholder="e.g. Vancouver Food Bank"
                  className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Organization Type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 font-bold bg-white"
                >
                  {ORG_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Website or Social Link</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. foodbank.bc.ca"
                  className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Org Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(604) 555-0199"
                  className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h3 className="font-extrabold text-gray-900 text-xs mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#635BFF]" /> Representative Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role / Position *</label>
                  <input
                    type="text"
                    required
                    value={repRole}
                    onChange={(e) => setRepRole(e.target.value)}
                    placeholder="e.g. Volunteer Director"
                    className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    placeholder="s.jenkins@foodbank.bc.ca"
                    className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Document Upload</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DOCUMENT UPLOAD */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 font-bold bg-white text-gray-900"
              >
                {DOCUMENT_TYPES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Registration # or Document ID (Optional)</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 123456789RR0001 or Tax ID"
                className="w-full p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Upload Proof Document *</label>
              <div className="p-6 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 text-center space-y-3">
                <Upload className="w-8 h-8 text-[#635BFF] mx-auto" />
                <div>
                  <p className="font-extrabold text-gray-900 text-xs">
                    {docFileName ? docFileName : 'Click to select or drag & drop official document'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    Accepted: PDF, PNG, JPG, DOCX (Max 10MB)
                  </p>
                </div>

                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="verification-file-input"
                />

                <label
                  htmlFor="verification-file-input"
                  className="inline-block px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {docFileName ? 'Change Uploaded File' : 'Browse File'}
                </label>
              </div>
            </div>

            {docFileName && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Document Attached: {docFileName}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review & Submit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONFIRM & SUBMIT */}
        {step === 3 && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <h3 className="font-extrabold text-gray-900 border-b border-gray-200 pb-2">
                Application Summary
              </h3>
              <div><strong>Organization:</strong> {legalName} ({orgType})</div>
              <div><strong>Representative:</strong> {repName} ({repRole} — {repEmail})</div>
              <div><strong>Phone:</strong> {phone}</div>
              <div><strong>Document Attached:</strong> {docType} ({docFileName || 'Document'})</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedSafety}
                  onChange={(e) => setAgreedSafety(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#635BFF] rounded-md focus:ring-[#635BFF]"
                />
                <span className="font-bold text-purple-950 leading-relaxed">
                  I confirm that our organization will provide a safe environment for volunteers and that all submitted documents are accurate.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={isSubmitting || !agreedSafety}
                className="px-8 py-3.5 bg-[#635BFF] hover:bg-[#5046E5] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
