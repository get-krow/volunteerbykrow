import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { UserProfile, BadgeDefinition, Opportunity, AttendanceRecord } from './types';
import { db } from './db';
import { getBadgeForHours } from './badges';

// Format date helper (ASCII safe)
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month] || parts[1]} ${day}, ${year}`;
}

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month] || parts[1]} ${day}`;
}

export async function generateVolunteerHoursReport(
  profile: UserProfile,
  totalAwardedHoursInput?: number,
  completedShiftsCountInput?: number,
  badgeInput?: BadgeDefinition
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const printableWidth = pageWidth - margin * 2; // 180mm

  // Fetch true single-source-of-truth data from db
  const totalAwardedHours = db.calculateVolunteerTotalHours(profile.id);
  const completedShiftsCount = db.calculateVolunteerCompletedShifts(profile.id);
  const badge = getBadgeForHours(totalAwardedHours);

  // Fetch all attendance records where volunteer actually attended (status === 'here')
  const rawAttendance = db.getAttendanceForVolunteer(profile.id);
  const verifiedAttendance = rawAttendance.filter((a) => a.status === 'here');
  const allOpps = db.getOpportunities();

  // Map attendance records to opportunity objects
  interface VerifiedExperienceItem {
    series_id?: string;
    is_recurring: boolean;
    title: string;
    org_name: string;
    org_is_verified: boolean;
    category_id: string;
    description: string;
    hours_awarded: number;
    completed_occurrences_count: number;
    total_occurrences_count: number;
    start_date: string;
    end_date: string;
    completed_dates: string[];
  }

  const experienceItems: VerifiedExperienceItem[] = [];
  const processedSeriesIds = new Set<string>();

  // Process completed attendance records
  verifiedAttendance.forEach((att) => {
    const opp = allOpps.find((o) => o.id === att.opportunity_id);
    const seriesId = opp?.recurrence_series_id;

    if (opp?.is_recurring && opp?.recurrence_type === 'same_volunteers' && seriesId) {
      if (processedSeriesIds.has(seriesId)) return;
      processedSeriesIds.add(seriesId);

      const seriesOpps = allOpps.filter((o) => o.recurrence_series_id === seriesId);
      const seriesAtts = verifiedAttendance.filter((a) => {
        const sOpp = seriesOpps.find((o) => o.id === a.opportunity_id);
        return !!sOpp;
      });

      const mainOpp = seriesOpps.find((o) => o.occurrence_number === undefined) || seriesOpps[0] || opp;
      const totalSeriesHours = seriesAtts.reduce((sum, a) => sum + (a.hours_awarded || mainOpp.duration_hours || 0), 0);
      const dates = seriesAtts
        .map((a) => {
          const o = seriesOpps.find((x) => x.id === a.opportunity_id);
          return o?.date || '';
        })
        .filter(Boolean)
        .sort();

      const totalOccurrences =
        mainOpp.recurrence_count ||
        seriesOpps.filter((o) => o.occurrence_number !== undefined).length ||
        seriesAtts.length;

      const org = db.getOrganizer(mainOpp.org_id);
      const isOrgVerified = (org?.verification_status || mainOpp.org_verification_status || 'verified') === 'verified';

      experienceItems.push({
        series_id: seriesId,
        is_recurring: true,
        title: mainOpp.title,
        org_name: mainOpp.org_name || 'Organization',
        org_is_verified: isOrgVerified,
        category_id: mainOpp.category_id || 'community',
        description: mainOpp.description || 'Assisted with community volunteer activities.',
        hours_awarded: Math.round(totalSeriesHours * 10) / 10,
        completed_occurrences_count: seriesAtts.length,
        total_occurrences_count: totalOccurrences,
        start_date: dates[0] || mainOpp.date,
        end_date: dates[dates.length - 1] || mainOpp.date,
        completed_dates: dates,
      });
    } else if (opp) {
      const org = db.getOrganizer(opp.org_id);
      const isOrgVerified = (org?.verification_status || opp.org_verification_status || 'verified') === 'verified';
      const hrs = att.hours_awarded || opp.duration_hours || 0;

      experienceItems.push({
        is_recurring: false,
        title: opp.title,
        org_name: opp.org_name || 'Organization',
        org_is_verified: isOrgVerified,
        category_id: opp.category_id || 'community',
        description: opp.description || 'Participated in community volunteer initiative.',
        hours_awarded: Math.round(hrs * 10) / 10,
        completed_occurrences_count: 1,
        total_occurrences_count: 1,
        start_date: opp.date,
        end_date: opp.date,
        completed_dates: [opp.date],
      });
    }
  });

  // Sort experiences: Most recent first
  experienceItems.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

  // Issue official certificate record in database (Source of Truth)
  const certRecord = db.issueCertificate(profile.id);
  const krowId = profile.krow_id || certRecord.krow_id;
  const certificateId = certRecord.certificate_id;

  const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verifyUrl = `https://volunteerbykrow.vercel.app/verify/${certificateId}`;

  // Layout tracking state
  let currentY = 15;
  let pageNumber = 1;

  const drawHeaderBar = () => {
    // Top purple brand bar
    doc.setFillColor(99, 91, 255);
    doc.rect(0, 0, pageWidth, 3.5, 'F');
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(99, 91, 255);
    doc.text('VOLUNTEER BY KROW', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('VERIFIED VOLUNTEER RECORD', pageWidth - margin, 12, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const drawRunningFooter = (pageNum: number) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Volunteer by Krow - Official Record - ${certificateId}`, margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
  };

  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      drawRunningFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      drawHeaderBar();
      drawRunningHeader();
      currentY = 22;
    }
  };

  // --- START PDF PAGE 1 GENERATION ---
  drawHeaderBar();

  // Document Branding Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(99, 91, 255); // Krow Brand Purple
  doc.text('Volunteer by Krow', margin, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('VERIFIED VOLUNTEER RECORD', pageWidth - margin, currentY + 6, { align: 'right' });

  currentY += 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Volunteer Info & Rank Box
  const infoStartY = currentY;

  // Volunteer Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name || 'Volunteer', margin, currentY + 5);

  // Volunteer Location (ASCII safe)
  const locationStr = [profile.city, profile.province_state, profile.country].filter(Boolean).join(', ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(locationStr || 'Location Not Specified', margin, currentY + 11);

  // Document Generation Date
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Record Generated: ${dateFormatted}`, margin, currentY + 16);

  // Rank Box (Right Column - ASCII safe)
  const rankBoxW = 60;
  const rankBoxH = 20;
  const rankBoxX = pageWidth - margin - rankBoxW;
  const rankBoxY = infoStartY;

  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(rankBoxX, rankBoxY, rankBoxW, rankBoxH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(109, 40, 217);
  doc.text('KROW VOLUNTEER RANK', rankBoxX + 6, rankBoxY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(`Rank: ${badge.name}`, rankBoxX + 6, rankBoxY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${totalAwardedHours} verified hours`, rankBoxX + 6, rankBoxY + 16);

  currentY += 24;

  // Impact Summary Grid (2 Clean Metric Cards: VERIFIED HOURS & COMPLETED OPPORTUNITIES)
  ensureSpace(24);
  const cardGap = 8;
  const cardW = (printableWidth - cardGap) / 2; // ~86mm each
  const cardH = 22;

  const metrics = [
    { label: 'VERIFIED VOLUNTEER HOURS', val: `${totalAwardedHours} Hours` },
    { label: 'COMPLETED OPPORTUNITIES', val: `${completedShiftsCount} Shifts` },
  ];

  metrics.forEach((m, idx) => {
    const cx = margin + idx * (cardW + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, currentY, cardW, cardH, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(79, 70, 229);
    doc.text(m.val, cx + cardW / 2, currentY + 10, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cx + cardW / 2, currentY + 16.5, { align: 'center' });
  });

  currentY += cardH + 7;

  // Verified Hours Highlight Banner Box
  ensureSpace(16);
  doc.setFillColor(240, 253, 244); // Light Emerald fill
  doc.setDrawColor(16, 185, 129); // Emerald border
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, printableWidth, 14, 3, 3, 'FD');

  // Left accent bar
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, currentY, 2.5, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text(`Official Verified Volunteer Hours: ${totalAwardedHours} Hours`, margin + 6, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text(
    'Hours displayed represent attendance verified and confirmed directly by participating partner organizations.',
    margin + 6,
    currentY + 10.5
  );

  currentY += 20;

  // Volunteer Experience Section Header
  ensureSpace(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text('VOLUNTEER EXPERIENCE', margin, currentY);
  currentY += 2;
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + 45, currentY);
  currentY += 6;

  // Render Volunteer Experience List
  if (experienceItems.length === 0) {
    ensureSpace(20);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, printableWidth, 18, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No verified volunteer experience recorded yet.', margin + 8, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Completed volunteer opportunities verified by partner organizations will appear here.', margin + 8, currentY + 13);

    currentY += 24;
  } else {
    experienceItems.forEach((exp) => {
      const boxH = exp.is_recurring && exp.completed_dates.length > 0 ? 28 : 22;
      ensureSpace(boxH + 3);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, printableWidth, boxH, 3, 3, 'FD');

      // Left Accent Strip
      doc.setFillColor(99, 91, 255);
      doc.rect(margin, currentY, 2, boxH, 'F');

      // Title & Hours
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.title, margin + 5, currentY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(79, 70, 229);
      doc.text(`${exp.hours_awarded} verified hrs`, pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

      // Org Name & Verification Status (ASCII safe)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const orgLabel = exp.org_is_verified ? `Verified Partner: ${exp.org_name}` : exp.org_name;
      doc.text(orgLabel, margin + 5, currentY + 10);

      // Date Range & Occurrence Details (ASCII safe)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      let dateSubtext = '';
      if (exp.is_recurring) {
        dateSubtext = `${formatDateShort(exp.start_date)} - ${formatDate(exp.end_date)}  |  ${exp.completed_occurrences_count} of ${exp.total_occurrences_count} occurrences completed`;
      } else {
        dateSubtext = `${formatDate(exp.start_date)}`;
      }
      doc.text(dateSubtext, margin + 5, currentY + 14.5);

      // Description snippet
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const descSnippet = doc.splitTextToSize(exp.description, printableWidth - 10)[0] || '';
      doc.text(descSnippet, margin + 5, currentY + 18.5);

      // Optional Completed Dates list for recurring series (ASCII safe)
      if (exp.is_recurring && exp.completed_dates.length > 0 && boxH >= 28) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(124, 58, 237);
        const datesFormatted = exp.completed_dates.map(formatDateShort).join(', ');
        doc.text(`Completed dates: ${datesFormatted}`, margin + 5, currentY + 24);
      }

      currentY += boxH + 4;
    });
  }

  currentY += 6;

  // Verification Box & High-Resolution PNG QR Code
  ensureSpace(44);

  const vBoxY = currentY;
  const vBoxH = 38;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(99, 91, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, vBoxY, printableWidth, vBoxH, 4, 4, 'FD');

  // Left side: Verification Metadata
  const vLeftX = margin + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text('DOCUMENT VERIFICATION', vLeftX, vBoxY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const vStatement =
    'Volunteer hours displayed in this document are based on attendance and hours verified by participating organizations through Volunteer by Krow.';
  doc.text(doc.splitTextToSize(vStatement, printableWidth - 48), vLeftX, vBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`KROW ID:  ${krowId}   |   Certificate ID:  ${certificateId}`, vLeftX, vBoxY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued Date: ${dateFormatted}  |  Status: Official Verified Record`, vLeftX, vBoxY + 28);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Verification URL: ${verifyUrl}`, vLeftX, vBoxY + 33);

  // Right side: High-Resolution 300DPI Standard PNG QR Code via official 'qrcode' package
  const qrSize = 30; // 30mm x 30mm box
  const qrX = pageWidth - margin - qrSize - 4;
  const qrY = vBoxY + 3;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
      width: 300,
    });
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error('QR code generation error:', err);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(99, 91, 255);
  doc.text('Scan to verify this certificate', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });

  // Draw Page Number on Final Page
  drawRunningFooter(pageNumber);

  // Save PDF with Professional Filename
  const cleanName = (profile.name || 'Volunteer').replace(/\s+/g, '_');
  doc.save(`${cleanName}_Krow_Volunteer_Record.pdf`);
}
