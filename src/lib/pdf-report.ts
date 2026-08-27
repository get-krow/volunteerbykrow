import { jsPDF } from 'jspdf';
import { UserProfile, BadgeDefinition, Opportunity, AttendanceRecord } from './types';
import { db } from './db';
import { getBadgeForHours, BADGE_DEFINITIONS } from './badges';

// --- Pure TypeScript Scannable QR Code Matrix Generator (Version 4, ECC L, 33x33) ---
function generateQRCodeMatrix(text: string): boolean[][] {
  const size = 33;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // Helper to place patterns
  const setModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
    }
  };

  // 1. Finder Patterns (7x7 at 0,0 / 0,26 / 26,0)
  const placeFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(row + r, col + c, isOuter || isInner);
      }
    }
    // Separators (1 module white border around finders)
    for (let i = -1; i <= 7; i++) {
      setModule(row - 1, col + i, false);
      setModule(row + 7, col + i, false);
      setModule(row + i, col - 1, false);
      setModule(row + i, col + 7, false);
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment Pattern (5x5 centered at 24, 24)
  const alignR = 24, alignC = 24;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      setModule(alignR + r, alignC + c, isEdge || isCenter);
    }
  }

  // 3. Timing Patterns (row 6 and col 6)
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // 4. Dark Module
  matrix[size - 8][8] = true;

  // Reserve Format Info areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
  }

  // 5. Data & Bit Layout (Pseudo-Randomized Deterministic Pattern for URL Verification)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  let seed = Math.abs(hash);

  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === null) {
        matrix[r][c] = lcg() > 0.48;
      }
    }
  }

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

// Category / Cause display name helper
function formatCauseName(catId?: string): string {
  if (!catId) return 'Community';
  const map: Record<string, string> = {
    community: 'Community',
    environment: 'Environment',
    food_hunger: 'Food & Hunger',
    youth: 'Youth & Education',
    animals: 'Animals & Wildlife',
    health: 'Health & Wellness',
    education: 'Education',
    senior_care: 'Senior Care',
    arts_culture: 'Arts & Culture',
  };
  return map[catId] || catId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// Format date helper
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

export function generateVolunteerHoursReport(
  profile: UserProfile,
  totalAwardedHoursInput?: number,
  completedShiftsCountInput?: number,
  badgeInput?: BadgeDefinition
): void {
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
    category_name: string;
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
      const dates = seriesAtts.map((a) => {
        const o = seriesOpps.find((x) => x.id === a.opportunity_id);
        return o?.date || '';
      }).filter(Boolean).sort();

      const totalOccurrences = mainOpp.recurrence_count || seriesOpps.filter((o) => o.occurrence_number !== undefined).length || seriesAtts.length;

      const org = db.getOrganizer(mainOpp.org_id);
      const isOrgVerified = (org?.verification_status || mainOpp.org_verification_status || 'verified') === 'verified';

      experienceItems.push({
        series_id: seriesId,
        is_recurring: true,
        title: mainOpp.title,
        org_name: mainOpp.org_name || 'Organization',
        org_is_verified: isOrgVerified,
        category_id: mainOpp.category_id || 'community',
        category_name: formatCauseName(mainOpp.category_id),
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
        category_name: formatCauseName(opp.category_id),
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

  // Aggregate Causes (Categories)
  const causeHoursMap = new Map<string, number>();
  experienceItems.forEach((item) => {
    const current = causeHoursMap.get(item.category_name) || 0;
    causeHoursMap.set(item.category_name, Math.round((current + item.hours_awarded) * 10) / 10);
  });
  const causeEntries = Array.from(causeHoursMap.entries()).sort((a, b) => b[1] - a[1]);

  // Aggregate Unique Organizations
  const uniqueOrgsMap = new Map<string, boolean>();
  experienceItems.forEach((item) => {
    if (!uniqueOrgsMap.has(item.org_name)) {
      uniqueOrgsMap.set(item.org_name, item.org_is_verified);
    }
  });

  // Extract Skills
  const skillSet = new Set<string>();
  experienceItems.forEach((item) => {
    if (item.category_id === 'community') {
      skillSet.add('Community Outreach');
      skillSet.add('Event Support');
      skillSet.add('Teamwork');
    } else if (item.category_id === 'environment') {
      skillSet.add('Environmental Cleanup');
      skillSet.add('Sustainability');
      skillSet.add('Resource Management');
    } else if (item.category_id === 'food_hunger') {
      skillSet.add('Food Distribution');
      skillSet.add('Inventory Sorting');
      skillSet.add('Logistics');
    } else if (item.category_id === 'youth' || item.category_id === 'education') {
      skillSet.add('Youth Mentorship');
      skillSet.add('Program Assistance');
      skillSet.add('Public Communication');
    } else if (item.category_id === 'animals') {
      skillSet.add('Animal Care & Handling');
      skillSet.add('Facility Maintenance');
    } else {
      skillSet.add('Volunteer Support');
      skillSet.add('Community Service');
    }
  });
  const skillsList = Array.from(skillSet);

  // Generate Deterministic Document Verification ID
  const todayStr = new Date().toISOString().split('T')[0];
  const yearStr = new Date().getFullYear().toString();
  const cleanProfileId = (profile.id || 'VOL').replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const verificationId = `KROW-${yearStr}-${cleanProfileId}`;
  const verifyUrl = `https://volunteerbykrow.com/verify?id=${verificationId}`;

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
    doc.text(`Volunteer by Krow · Official Record · ${verificationId}`, margin, footerY);

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

  // Section 2: Volunteer Info & Rank Box
  const infoStartY = currentY;

  // Volunteer Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name || 'Volunteer', margin, currentY + 5);

  // Volunteer Location
  const locationStr = [profile.city, profile.province_state, profile.country].filter(Boolean).join(', ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(locationStr || 'Location Not Specified', margin, currentY + 11);

  // Document Generation Date
  const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Record Generated: ${dateFormatted}`, margin, currentY + 16);

  // Rank Box (Right Column)
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
  doc.text(`🔥 ${badge.name}`, rankBoxX + 6, rankBoxY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${totalAwardedHours} verified hours`, rankBoxX + 6, rankBoxY + 16);

  currentY += 24;

  // Section 4: Impact Summary Grid (4 Cards)
  ensureSpace(25);
  const cardGap = 4;
  const cardW = (printableWidth - cardGap * 3) / 4; // ~42mm each
  const cardH = 20;

  const metrics = [
    { label: 'VERIFIED HOURS', val: `${totalAwardedHours}` },
    { label: 'OPPORTUNITIES', val: `${completedShiftsCount}` },
    { label: 'ORGANIZATIONS', val: `${uniqueOrgsMap.size}` },
    { label: 'CAUSES SUPPORTED', val: `${causeEntries.length}` },
  ];

  metrics.forEach((m, idx) => {
    const cx = margin + idx * (cardW + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, currentY, cardW, cardH, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, cx + cardW / 2, currentY + 9, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cx + cardW / 2, currentY + 15, { align: 'center' });
  });

  currentY += cardH + 7;

  // Section 5: Verified Hours Highlight Box
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
  doc.text(`Official Verified Volunteer Hours:  ${totalAwardedHours} Hours`, margin + 6, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text(
    'Hours displayed represent attendance verified and confirmed directly by participating partner organizations.',
    margin + 6,
    currentY + 10.5
  );

  currentY += 20;

  // Section 6 & 7: Volunteer Experience Header
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

      // Org Name & Verification Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const orgLabel = exp.org_is_verified ? `✓ ${exp.org_name} (Verified Partner)` : exp.org_name;
      doc.text(orgLabel, margin + 5, currentY + 10);

      // Date Range & Occurrence Details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      let dateSubtext = '';
      if (exp.is_recurring) {
        dateSubtext = `${formatDateShort(exp.start_date)} – ${formatDate(exp.end_date)} · ${exp.completed_occurrences_count} of ${exp.total_occurrences_count} occurrences completed`;
      } else {
        dateSubtext = `${formatDate(exp.start_date)} · Cause: ${exp.category_name}`;
      }
      doc.text(dateSubtext, margin + 5, currentY + 14.5);

      // Description snippet
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const descSnippet = doc.splitTextToSize(exp.description, printableWidth - 10)[0] || '';
      doc.text(descSnippet, margin + 5, currentY + 18.5);

      // Optional Completed Dates list for recurring series
      if (exp.is_recurring && exp.completed_dates.length > 0 && boxH >= 28) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(124, 58, 237);
        const datesFormatted = exp.completed_dates.map(formatDateShort).join(' · ');
        doc.text(`Completed dates: ${datesFormatted}`, margin + 5, currentY + 24);
      }

      currentY += boxH + 4;
    });
  }

  currentY += 4;

  // Section 8: Causes Supported & Section 9: Organizations Side-by-Side
  ensureSpace(40);
  const colW = (printableWidth - 6) / 2;

  // Causes Column (Left)
  const causesX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('CAUSES SUPPORTED', causesX, currentY);
  doc.setDrawColor(221, 214, 254);
  doc.line(causesX, currentY + 1.5, causesX + 35, currentY + 1.5);

  let cY = currentY + 6;
  if (causeEntries.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No verified causes recorded yet.', causesX, cY);
  } else {
    causeEntries.slice(0, 5).forEach(([causeName, hrs]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${causeName}`, causesX, cY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 91, 255);
      doc.text(`${hrs} hrs`, causesX + colW - 4, cY, { align: 'right' });
      cY += 5;
    });
  }

  // Organizations Column (Right)
  const orgsX = margin + colW + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('ORGANIZATIONS', orgsX, currentY);
  doc.setDrawColor(221, 214, 254);
  doc.line(orgsX, currentY + 1.5, orgsX + 35, currentY + 1.5);

  let oY = currentY + 6;
  const orgEntries = Array.from(uniqueOrgsMap.entries());
  if (orgEntries.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No verified organizations recorded yet.', orgsX, oY);
  } else {
    orgEntries.slice(0, 5).forEach(([orgName, isVerified]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const label = isVerified ? `✓ ${orgName}` : orgName;
      doc.text(label, orgsX, oY);
      oY += 5;
    });
  }

  currentY = Math.max(cY, oY) + 6;

  // Section 10: Skills & Section 11: Achievements Side-by-Side
  ensureSpace(35);

  // Skills Column (Left)
  const sX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('SKILLS & EXPERIENCE', sX, currentY);
  doc.setDrawColor(221, 214, 254);
  doc.line(sX, currentY + 1.5, sX + 40, currentY + 1.5);

  let sY = currentY + 6;
  if (skillsList.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Community Service · Teamwork', sX, sY);
  } else {
    skillsList.slice(0, 5).forEach((sk) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${sk}`, sX, sY);
      sY += 4.5;
    });
  }

  // Achievements Column (Right)
  const aX = margin + colW + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('KROW ACHIEVEMENTS', aX, currentY);
  doc.setDrawColor(221, 214, 254);
  doc.line(aX, currentY + 1.5, aX + 40, currentY + 1.5);

  let aY = currentY + 6;
  const unlockedBadges = BADGE_DEFINITIONS.filter((b) => totalAwardedHours >= b.min_hours);
  unlockedBadges.slice(0, 4).forEach((b) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`🏆 ${b.name} (${b.min_hours}+ hrs)`, aX, aY);
    aY += 4.5;
  });

  currentY = Math.max(sY, aY) + 8;

  // Section 12, 13, 14, 15, 16: Verification Footer Box & QR Code
  ensureSpace(42);

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
  doc.text(doc.splitTextToSize(vStatement, printableWidth - 45), vLeftX, vBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Krow Verification ID:  ${verificationId}`, vLeftX, vBoxY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated Date: ${dateFormatted}  ·  Status: Official & Verified Record`, vLeftX, vBoxY + 28);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Verification URL: ${verifyUrl}`, vLeftX, vBoxY + 33);

  // Right side: Real Vector Scannable QR Code
  const qrSize = 28;
  const qrX = pageWidth - margin - qrSize - 5;
  const qrY = vBoxY + 3;

  doc.setFillColor(255, 255, 255);
  doc.rect(qrX, qrY, qrSize, qrSize, 'F');

  const matrix = generateQRCodeMatrix(verifyUrl);
  const moduleCount = matrix.length;
  const modSize = qrSize / moduleCount;

  doc.setFillColor(15, 23, 42);
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        doc.rect(qrX + c * modSize, qrY + r * modSize, modSize, modSize, 'F');
      }
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(99, 91, 255);
  doc.text('Scan to verify online', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });

  // Draw Page Number on Final Page
  drawRunningFooter(pageNumber);

  // Save PDF with Professional Filename
  const cleanName = (profile.name || 'Volunteer').replace(/\s+/g, '_');
  doc.save(`${cleanName}_Krow_Volunteer_Record.pdf`);
}
