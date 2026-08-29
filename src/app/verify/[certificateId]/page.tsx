'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { db } from '@/lib/db';
import { CertificateRecord } from '@/lib/types';
import { decodeCertificateToken } from '@/lib/cert-token';
import { ShieldCheck, ShieldAlert, Award, Calendar, User, Hash, Clock, CheckCircle2, Search, ArrowRight, Copy, Check } from 'lucide-react';

export default function CertificateVerificationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [certRecord, setCertRecord] = useState<CertificateRecord | null | undefined>(undefined);
  const [inputCertId, setInputCertId] = useState('');
  const [copiedKrowId, setCopiedKrowId] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState(false);

  // Read certificateId from route params or fallback search query parameter
  const rawCertId = (params?.certificateId as string) || searchParams?.get('id') || '';
  const tokenParam = searchParams?.get('d') || '';

  useEffect(() => {
    let isMounted = true;

    // 1. Try decoding cryptographic payload token first for instant, guaranteed cross-device verification
    const tokenRecord = tokenParam ? decodeCertificateToken(tokenParam) : null;
    if (tokenRecord) {
      setCertRecord(tokenRecord);
    }

    if (rawCertId) {
      db.syncWithSupabase()
        .then(() => db.getCertificateByIdAsync(rawCertId))
        .then((found) => {
          if (isMounted) {
            if (found) {
              setCertRecord(found);
            } else if (!tokenRecord) {
              setCertRecord(null);
            }
          }
        });

      db.getCertificateByIdAsync(rawCertId).then((foundImmediately) => {
        if (isMounted && foundImmediately) {
          setCertRecord(foundImmediately);
        }
      });
    } else if (!tokenRecord) {
      setCertRecord(null);
    }

    return () => {
      isMounted = false;
    };
  }, [rawCertId, tokenParam]);

  const experiences = React.useMemo(() => {
    if (!certRecord?.user_id) return [];
    const rawAtt = db.getAttendanceForVolunteer(certRecord.user_id);
    const verifiedAtt = rawAtt.filter((a) => a.status === 'here');
    const allOpps = db.getOpportunities();

    const items: Array<{
      id: string;
      title: string;
      orgName: string;
      isVerifiedOrg: boolean;
      category: string;
      hours: number;
      dateStr: string;
      isRecurring: boolean;
      description: string;
      completedOccurrences?: number;
      totalOccurrences?: number;
    }> = [];

    const processedSeries = new Set<string>();

    verifiedAtt.forEach((att) => {
      const opp = allOpps.find((o) => o.id === att.opportunity_id);
      const seriesId = opp?.recurrence_series_id;

      if (opp?.is_recurring && opp?.recurrence_type === 'same_volunteers' && seriesId) {
        if (processedSeries.has(seriesId)) return;
        processedSeries.add(seriesId);

        const seriesOpps = allOpps.filter((o) => o.recurrence_series_id === seriesId);
        const seriesAtts = verifiedAtt.filter((a) => seriesOpps.some((o) => o.id === a.opportunity_id));
        const mainOpp = seriesOpps.find((o) => o.occurrence_number === undefined) || seriesOpps[0] || opp;
        const totalHrs = seriesAtts.reduce((sum, a) => sum + (a.hours_awarded || mainOpp.duration_hours || 0), 0);
        const dates = seriesAtts
          .map((a) => seriesOpps.find((x) => x.id === a.opportunity_id)?.date || '')
          .filter(Boolean)
          .sort();

        const org = db.getOrganizer(mainOpp.org_id);
        const isOrgVerified = (org?.verification_status || mainOpp.org_verification_status || 'verified') === 'verified';

        items.push({
          id: seriesId,
          title: mainOpp.title,
          orgName: mainOpp.org_name || 'Partner Organization',
          isVerifiedOrg: isOrgVerified,
          category: (mainOpp.category_id || 'community').replace('_', ' '),
          hours: Math.round(totalHrs * 10) / 10,
          dateStr: dates.length > 1 ? `${dates[0]} to ${dates[dates.length - 1]}` : dates[0] || mainOpp.date,
          isRecurring: true,
          description: mainOpp.description || 'Assisted with community volunteer initiative.',
          completedOccurrences: seriesAtts.length,
          totalOccurrences: mainOpp.recurrence_count || seriesOpps.filter((o) => o.occurrence_number !== undefined).length || seriesAtts.length,
        });
      } else if (opp) {
        const org = db.getOrganizer(opp.org_id);
        const isOrgVerified = (org?.verification_status || opp.org_verification_status || 'verified') === 'verified';
        const hrs = att.hours_awarded || opp.duration_hours || 0;

        items.push({
          id: att.id,
          title: opp.title,
          orgName: opp.org_name || 'Partner Organization',
          isVerifiedOrg: isOrgVerified,
          category: (opp.category_id || 'community').replace('_', ' '),
          hours: Math.round(hrs * 10) / 10,
          dateStr: opp.date,
          isRecurring: false,
          description: opp.description || 'Participated in community volunteer activity.',
        });
      }
    });

    return items;
  }, [certRecord?.user_id]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCertId.trim()) return;
    const clean = inputCertId.trim().toUpperCase();
    router.push(`/verify/${clean}`);
  };

  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        {/* Loading State */}
        {certRecord === undefined && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#635BFF] flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-gray-500">Verifying certificate against Krow's official database...</p>
          </div>
        )}

        {/* Valid Certificate View */}
        {certRecord && certRecord.status === 'VALID' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden space-y-0">
            {/* Top Verified Header Bar */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold flex items-center gap-1.5 border border-white/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" /> VERIFIED BY KROW
                </span>
                <span className="text-[11px] font-bold text-emerald-100 font-mono tracking-wider">
                  Official Database Record
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Verified Volunteer Record</h1>
                <p className="text-xs text-emerald-100 mt-1">
                  Official volunteer hours certificate issued and confirmed by Krow.
                </p>
              </div>
            </div>

            {/* Certificate Details Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Student Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-black text-xl border-2 border-purple-200 shadow-2xs">
                  {certRecord.student_name.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Student Volunteer</span>
                  <h2 className="text-xl font-black text-gray-900">{certRecord.student_name}</h2>
                </div>
              </div>

              {/* Verified Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Verified Volunteer Hours
                  </span>
                  <div className="text-2xl font-black text-[#635BFF]">{certRecord.hours} Hours</div>
                  <p className="text-[10px] text-purple-500 font-medium">Confirmed attendance & organization records</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Completed Activities
                  </span>
                  <div className="text-2xl font-black text-gray-900">{certRecord.activity_count} Opportunities</div>
                  <p className="text-[10px] text-slate-400 font-medium">Verified completed volunteer shifts</p>
                </div>
              </div>

              {/* Identifiers Detail Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">Student KROW ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900 font-mono tracking-wider">{certRecord.krow_id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(certRecord.krow_id);
                        setCopiedKrowId(true);
                        setTimeout(() => setCopiedKrowId(false), 2000);
                      }}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Copy KROW ID"
                    >
                      {copiedKrowId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">Certificate ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900 font-mono tracking-wider">{certRecord.certificate_id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(certRecord.certificate_id);
                        setCopiedCertId(true);
                        setTimeout(() => setCopiedCertId(false), 2000);
                      }}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Copy Certificate ID"
                    >
                      {copiedCertId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">Issued Date</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{formatDateStr(certRecord.issued_at)}</span>
                </div>
              </div>

              {/* Itemized Volunteer Experience Breakdown Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#635BFF]" />
                    <h3 className="font-extrabold text-sm text-gray-900">
                      Verified Experience & Shift Breakdown
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    {experiences.length} Activity Log{experiences.length === 1 ? '' : 's'}
                  </span>
                </div>

                {experiences.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-400 font-medium">
                    Verified shifts logged by partner organizations will appear here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs hover:border-purple-200 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#635BFF] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                {exp.category}
                              </span>
                              {exp.isRecurring && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                                  Recurring ({exp.completedOccurrences}/{exp.totalOccurrences} Shifts)
                                </span>
                              )}
                            </div>
                            <h4 className="font-black text-sm text-gray-900">{exp.title}</h4>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                              <span>{exp.orgName}</span>
                              {exp.isVerifiedOrg && (
                                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Verified Partner ✓
                                </span>
                              )}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-black text-xs shrink-0">
                            +{exp.hours} Verified Hrs
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#635BFF]" /> {exp.dateStr}
                          </span>
                          <span className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider">
                            Verified Attendance ✓
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Official Source of Truth Notice */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-900">Authentic & Verified Document</h4>
                  <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                    This certificate is valid and matches Krow's official database records. The hours shown above represent the authoritative source of truth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revoked Certificate View */}
        {certRecord && certRecord.status === 'REVOKED' && (
          <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto border-2 border-red-200">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900">⚠️ CERTIFICATE REVOKED</h1>
              <p className="text-xs text-red-600 font-semibold max-w-md mx-auto">
                This certificate is no longer considered valid by Krow and has been officially revoked.
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-left space-y-2 max-w-md mx-auto text-xs text-red-800">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Certificate ID:</span>
                <span className="font-mono font-bold">{certRecord.certificate_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Student Name:</span>
                <span className="font-bold">{certRecord.student_name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Invalid / Not Found View */}
        {certRecord === null && rawCertId && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">⚠️ CERTIFICATE NOT FOUND</h1>
                <p className="text-xs text-gray-500 font-medium">We could not verify this certificate against Krow's records.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                <span>Queried Certificate ID:</span>
                <span className="font-mono font-black text-amber-800 tracking-wider">{rawCertId.toUpperCase()}</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                Possible reasons why verification failed:
              </p>
              <ul className="text-[11px] text-amber-700 space-y-1 list-disc list-inside font-medium pl-1">
                <li>The Certificate ID does not exist in Krow's database.</li>
                <li>The certificate PDF details or ID may have been altered.</li>
                <li>The certificate may have been revoked or deleted.</li>
              </ul>
            </div>

            {/* Manual Lookup Form */}
            <form onSubmit={handleManualSearch} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-gray-700">Try Looking Up Another Certificate ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCertId}
                  onChange={(e) => setInputCertId(e.target.value)}
                  placeholder="e.g. CERT-4D92X7PQ"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  Verify <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty Search View (When visiting /verify directly without ID) */}
        {certRecord === null && !rawCertId && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#635BFF] flex items-center justify-center mx-auto border border-purple-200">
                <Search className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">Verify a Krow Certificate</h1>
              <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
                Enter the unique Certificate ID (e.g., CERT-4D92X7PQ) found on the student's volunteer certificate.
              </p>
            </div>

            <form onSubmit={handleManualSearch} className="space-y-3 max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={inputCertId}
                  onChange={(e) => setInputCertId(e.target.value)}
                  placeholder="e.g. CERT-4D92X7PQ"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 uppercase shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  Verify Certificate <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
