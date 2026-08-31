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
  Mail,
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

const REGISTRATION_TYPES = [
  'Registered charity',
  'Non-profit corporation',
  'Corporation/business',
  'School/institution',
  'Government organization',
  'Community group',
  'Other',
];

const ROLES = [
  'Founder',
  'Owner',
  'Director',
  'Manager',
  'Volunteer Coordinator',
  'Staff Member',
  'Teacher',
  'School Administrator',
  'Event Coordinator',
  'Other',
];

const LOCATION_OPTIONS = [
  'Public location',
  'Organization facility',
  'School',
  'Community centre',
  'Outdoor location',
  'Private property',
  'Online',
  'Other',
];

export const VerificationModal: React.FC<VerificationModalProps> = ({
  currentOrg,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Organization Info
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
  const [postalCode, setPostalCode] = useState(currentOrg.postal_code || '');

  // Step 2: Registration Info
  const [registrationType, setRegistrationType] = useState(currentOrg.registration_type || 'Non-profit corporation');
  const [registrationNumber, setRegistrationNumber] = useState(currentOrg.registration_number || '');
  const [registrationAuthority, setRegistrationAuthority] = useState(currentOrg.registration_authority || 'Corporations Canada');
  const [countryOfRegistration, setCountryOfRegistration] = useState(currentOrg.country_of_registration || 'Canada');
  const [regDocFileName, setRegDocFileName] = useState<string | null>(
    currentOrg.documents?.find((d) => d.document_type === 'registration')?.file_name || null
  );

  // Step 3: Representative & Email Verification
  const [repName, setRepName] = useState(currentOrg.representative?.full_name || '');
  const [repRole, setRepRole] = useState(currentOrg.representative?.role || 'Volunteer Coordinator');
  const [repEmail, setRepEmail] = useState(currentOrg.representative?.email || '');
  const [repPhone, setRepPhone] = useState(currentOrg.representative?.phone || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(currentOrg.representative?.verification_code || null);
  const [emailVerified, setEmailVerified] = useState(currentOrg.representative?.email_verified || false);
  const [codeMsg, setCodeMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Step 4: Proof of Affiliation
  const [affiliationMode, setAffiliationMode] = useState<'email' | 'document'>('email');
  const [affDocFileName, setAffDocFileName] = useState<string | null>(
    currentOrg.documents?.find((d) => d.document_type === 'affiliation')?.file_name || null
  );

  // Step 5: Safety Information
  const [activities, setActivities] = useState(currentOrg.safety_info?.activities || '');
  const [locations, setLocations] = useState<string[]>(currentOrg.safety_info?.locations || ['Organization facility']);
  const [supervisorInfo, setSupervisorInfo] = useState(currentOrg.safety_info?.supervisor_info || '');
  const [minorsAllowed, setMinorsAllowed] = useState<boolean>(currentOrg.safety_info?.minors_allowed ?? true);
  const [backgroundChecks, setBackgroundChecks] = useState<string>(currentOrg.safety_info?.background_checks || 'No');
  const [safetyRequirements, setSafetyRequirements] = useState<string>(currentOrg.safety_info?.safety_requirements || '');
  const [agreedRules, setAgreedRules] = useState<boolean>(currentOrg.safety_info?.agreed_rules ?? false);

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendVerificationCode = () => {
    if (!repEmail || !repEmail.includes('@')) {
      setCodeMsg({ text: 'Please enter a valid representative email address.', error: true });
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setCodeMsg({ text: `Verification code sent to ${repEmail}! (Code: ${code})`, error: false });
  };

  const handleVerifyEmailCode = () => {
    if (!sentCode || verificationCode.trim() !== sentCode) {
      setCodeMsg({ text: 'Invalid verification code. Please check and try again.', error: true });
      return;
    }
    setEmailVerified(true);
    setCodeMsg({ text: 'Email address verified successfully!', error: false });
  };

  const handleLocationToggle = (loc: string) => {
    if (locations.includes(loc)) {
      setLocations(locations.filter((l) => l !== loc));
    } else {
      setLocations([...locations, loc]);
    }
  };

  const validateStep = (s: number): boolean => {
    setFormError(null);
    if (s === 1) {
      if (!legalName.trim()) {
        setFormError('Legal Organization Name is required.');
        return false;
      }
      if (!description.trim()) {
        setFormError('Organization description is required.');
        return false;
      }
      if (!phone.trim()) {
        setFormError('Organization phone number is required.');
        return false;
      }
      if (!city.trim() || !country.trim()) {
        setFormError('City and Country are required.');
        return false;
      }
    } else if (s === 2) {
      if (!countryOfRegistration.trim()) {
        setFormError('Country of Registration is required.');
        return false;
      }
    } else if (s === 3) {
      if (!repName.trim()) {
        setFormError('Representative Full Name is required.');
        return false;
      }
      if (!repEmail.trim() || !repEmail.includes('@')) {
        setFormError('Valid representative organization email is required.');
        return false;
      }
      if (!repPhone.trim()) {
        setFormError('Representative phone number is required.');
        return false;
      }
    } else if (s === 4) {
      if (affiliationMode === 'document' && !affDocFileName) {
        setFormError('Please upload proof of affiliation document or select verified email mode.');
        return false;
      }
    } else if (s === 5) {
      if (!activities.trim()) {
        setFormError('Please describe expected volunteer activities.');
        return false;
      }
      if (!supervisorInfo.trim()) {
        setFormError('Please specify who supervises volunteers.');
        return false;
      }
      if (!agreedRules) {
        setFormError('You must agree to Krow’s Volunteer Safety Rules to proceed.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setFormError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      setStep(5);
      return;
    }

    setIsSubmitting(true);

    const documents: OrgVerificationDocument[] = [];

    if (regDocFileName) {
      documents.push({
        id: `doc-reg-${Date.now()}`,
        organization_id: currentOrg.id,
        document_type: 'registration',
        file_name: regDocFileName,
        storage_path: `/private/verification/${currentOrg.id}/registration_${regDocFileName}`,
        uploaded_at: new Date().toISOString(),
        status: 'pending',
      });
    }

    if (affDocFileName) {
      documents.push({
        id: `doc-aff-${Date.now()}`,
        organization_id: currentOrg.id,
        document_type: 'affiliation',
        file_name: affDocFileName,
        storage_path: `/private/verification/${currentOrg.id}/affiliation_${affDocFileName}`,
        uploaded_at: new Date().toISOString(),
        status: 'pending',
      });
    }

    const representative: OrgRepresentative = {
      full_name: repName,
      role: repRole,
      email: repEmail,
      phone: repPhone,
      email_verified: emailVerified,
      verification_code: sentCode || undefined,
    };

    const safetyInfo: OrgSafetyInfo = {
      activities,
      locations,
      supervisor_info: supervisorInfo,
      minors_allowed: minorsAllowed,
      background_checks: backgroundChecks,
      safety_requirements: safetyRequirements,
      agreed_rules: agreedRules,
    };

    await db.submitVerificationApplication(currentOrg.id, {
      legal_name: legalName,
      public_name: publicName,
      organization_type: orgType,
      description,
      website: website || undefined,
      phone,
      address,
      city,
      province_state: provinceState,
      country,
      postal_code: postalCode || undefined,
      registration_type: registrationType,
      registration_number: registrationNumber || undefined,
      registration_authority: registrationAuthority || undefined,
      country_of_registration: countryOfRegistration,
      representative,
      documents,
      safety_info: safetyInfo,
    });

    setIsSubmitting(false);
    onSubmitted();
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
      {[
        { num: 1, label: 'Organization' },
        { num: 2, label: 'Registration' },
        { num: 3, label: 'Representative' },
        { num: 4, label: 'Affiliation' },
        { num: 5, label: 'Safety' },
        { num: 6, label: 'Review' },
      ].map((s) => {
        const isActive = step === s.num;
        const isDone = step > s.num;
        return (
          <div key={s.num} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDone
                  ? 'bg-purple-100 text-[#635BFF]'
                  : isActive
                  ? 'bg-[#635BFF] text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-[10px] font-semibold mt-1 hidden sm:block ${
                isActive ? 'text-[#635BFF]' : isDone ? 'text-gray-700' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Organization Verification</h2>
              <p className="text-xs text-gray-500 font-medium">
                Complete Krow's safety & trust verification application
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

        {/* Progress Bar */}
        <div className="pt-4">{renderStepIndicator()}</div>

        {/* Form Error Banner */}
        {formError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* STEP 1: ORGANIZATION INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">Legal Organization Name *</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Coquitlam Community Food Bank Society"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">Public Organization Name (Optional)</label>
                <input
                  type="text"
                  value={publicName}
                  onChange={(e) => setPublicName(e.target.value)}
                  placeholder="e.g. Coquitlam Food Bank"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Organization Type *</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium bg-white"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (604) 555-0199"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">Organization Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your organization do?"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700 flex items-center justify-between">
                  <span>Organization Website</span>
                  <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.example.org"
                    className="w-full pl-9 p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Country *</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Province / State *</label>
                  <input
                    type="text"
                    value={provinceState}
                    onChange={(e) => setProvinceState(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="font-extrabold text-gray-700">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-extrabold text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Community Way"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REGISTRATION INFO */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">How is your organization registered? *</label>
                <select
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium bg-white"
                >
                  {REGISTRATION_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. 123456789 RR0001"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Registration Authority</label>
                  <input
                    type="text"
                    value={registrationAuthority}
                    onChange={(e) => setRegistrationAuthority(e.target.value)}
                    placeholder="e.g. CRA / Corporations Canada / Provincial"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">Country of Registration *</label>
                <input
                  type="text"
                  value={countryOfRegistration}
                  onChange={(e) => setCountryOfRegistration(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              {/* Registration Document Upload */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-extrabold">
                  <FileText className="w-4 h-4 text-[#635BFF]" />
                  <span>Registration Document (Optional)</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Upload proof of registration (PDF, JPG, PNG). Uploading a document helps Krow verify your application faster.
                </p>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2.5 bg-white border border-gray-200 hover:border-[#635BFF] rounded-xl cursor-pointer text-xs font-bold text-gray-700 hover:text-[#635BFF] flex items-center gap-2 transition-all shadow-2xs">
                    <Upload className="w-4 h-4" />
                    <span>{regDocFileName ? 'Change Document' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setRegDocFileName(file.name);
                        }
                      }}
                    />
                  </label>
                  {regDocFileName && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {regDocFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REPRESENTATIVE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-[#635BFF] text-xs font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Verify that the person operating this account represents the organization.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Representative Full Name *</label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Position / Role *</label>
                  <select
                    value={repRole}
                    onChange={(e) => setRepRole(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Organization Email *</label>
                  <input
                    type="email"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    placeholder="jane@organization.org"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Representative Phone *</label>
                  <input
                    type="text"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    placeholder="+1 (604) 555-0199"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Email Verification Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900">Organization Email Verification</span>
                  {emailVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> EMAIL VERIFIED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                      UNVERIFIED
                    </span>
                  )}
                </div>

                {!emailVerified && (
                  <div className="space-y-2">
                    <p className="text-gray-500 text-[11px]">
                      Send a verification code to confirm ownership of {repEmail || 'your organization email'}.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        className="px-3.5 py-2 bg-[#635BFF] text-white rounded-xl font-bold text-xs shadow-2xs hover:bg-[#5046E5] transition-all shrink-0"
                      >
                        Send Code
                      </button>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="6-digit code"
                        className="w-32 p-2 rounded-xl border border-gray-200 font-mono text-center text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailCode}
                        className="px-3.5 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all shrink-0"
                      >
                        Confirm Code
                      </button>
                    </div>
                  </div>
                )}

                {codeMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-bold ${
                      codeMsg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {codeMsg.text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: PROOF OF AFFILIATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-sm">Proof of Affiliation</h3>
                <p className="text-gray-500 text-xs">
                  Provide evidence that you are authorized to create opportunities for this organization.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setAffiliationMode('email')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    affiliationMode === 'email' ? 'border-[#635BFF] bg-purple-50/40' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-extrabold text-gray-900 mb-1">
                    <Mail className="w-4 h-4 text-[#635BFF]" />
                    <span>Option A: Verified Email</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Use organization domain email ({repEmail || 'your email'}).
                  </p>
                  {emailVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 mt-2">
                      <CheckCircle2 className="w-3 h-3" /> Email Verified
                    </span>
                  )}
                </div>

                <div
                  onClick={() => setAffiliationMode('document')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    affiliationMode === 'document' ? 'border-[#635BFF] bg-purple-50/40' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-extrabold text-gray-900 mb-1">
                    <FileCheck className="w-4 h-4 text-[#635BFF]" />
                    <span>Option B: Document Upload</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Upload Staff ID, Organization ID, or official letter on letterhead.
                  </p>
                </div>
              </div>

              {affiliationMode === 'document' && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <label className="font-extrabold text-gray-900 block">Upload Proof Document *</label>
                  <p className="text-gray-500 text-[11px]">
                    Acceptable: Staff ID, Organization ID, official letter. (Do NOT upload passports or driver's licences).
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2.5 bg-white border border-gray-200 hover:border-[#635BFF] rounded-xl cursor-pointer text-xs font-bold text-gray-700 hover:text-[#635BFF] flex items-center gap-2 transition-all shadow-2xs">
                      <Upload className="w-4 h-4" />
                      <span>{affDocFileName ? 'Change Document' : 'Choose File'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setAffDocFileName(file.name);
                        }}
                      />
                    </label>
                    {affDocFileName && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {affDocFileName}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: VOLUNTEER SAFETY INFORMATION */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">What will volunteers generally do? *</label>
                <textarea
                  rows={2}
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  placeholder="Describe typical tasks, roles, or activities for volunteers..."
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700 block">Where will volunteers volunteer? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {LOCATION_OPTIONS.map((loc) => {
                    const sel = locations.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleLocationToggle(loc)}
                        className={`p-2 rounded-xl text-left border font-semibold text-[11px] transition-all flex items-center justify-between ${
                          sel ? 'bg-purple-50 border-[#635BFF] text-[#635BFF]' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        <span className="truncate">{loc}</span>
                        {sel && <CheckCircle2 className="w-3 h-3 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">Who supervises volunteers? *</label>
                <input
                  type="text"
                  value={supervisorInfo}
                  onChange={(e) => setSupervisorInfo(e.target.value)}
                  placeholder="e.g. On-site Volunteer Coordinator or Staff Lead"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Are minors allowed to volunteer?</label>
                  <select
                    value={minorsAllowed ? 'yes' : 'no'}
                    onChange={(e) => setMinorsAllowed(e.target.value === 'yes')}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium bg-white"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-700">Background checks required?</label>
                  <select
                    value={backgroundChecks}
                    onChange={(e) => setBackgroundChecks(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Depends on role">Depends on role</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-700">Safety Requirements & Equipment</label>
                <input
                  type="text"
                  value={safetyRequirements}
                  onChange={(e) => setSafetyRequirements(e.target.value)}
                  placeholder="e.g. Closed-toe shoes, high-visibility vest provided"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#635BFF] focus:outline-hidden font-medium"
                />
              </div>

              {/* Safety Rules Agreement */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="safetyCheck"
                  checked={agreedRules}
                  onChange={(e) => setAgreedRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#635BFF] rounded-xs border-gray-300 focus:ring-[#635BFF]"
                />
                <label htmlFor="safetyCheck" className="text-gray-700 text-xs font-semibold leading-relaxed cursor-pointer">
                  I confirm that the information provided is accurate and that volunteer opportunities posted through Krow will comply with applicable laws, safety requirements, and Krow's platform policies. *
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: APPLICATION SUMMARY */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] font-extrabold text-xs flex items-center gap-2 border border-[#635BFF]/20">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Review your application summary before final submission.</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                <div>
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Organization</span>
                  <span className="font-extrabold text-gray-900 text-sm">{legalName}</span>
                  {publicName && publicName !== legalName && (
                    <span className="text-gray-500 font-medium block">({publicName})</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-2 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold text-[10px] uppercase block">Type</span>
                    <span className="font-bold text-gray-800">{orgType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold text-[10px] uppercase block">Location</span>
                    <span className="font-bold text-gray-800">{city}, {provinceState}, {country}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold text-[10px] uppercase block">Website</span>
                    <span className="font-bold text-gray-800">{website || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold text-[10px] uppercase block">Registration</span>
                    <span className="font-bold text-gray-800">{registrationType} ({registrationNumber || 'No reg #'})</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Representative</span>
                  <span className="font-extrabold text-gray-900">{repName}</span> · <span className="text-gray-600">{repRole}</span> ({repEmail})
                  {emailVerified && (
                    <span className="ml-2 text-emerald-600 font-bold text-[10px]">✓ Email Verified</span>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Volunteer Activities</span>
                  <p className="text-gray-700 font-medium text-xs mt-0.5">{activities}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs shadow-md flex items-center gap-1 transition-all cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
