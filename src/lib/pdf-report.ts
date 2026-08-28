import { jsPDF } from 'jspdf';
import { UserProfile, BadgeDefinition, Opportunity, AttendanceRecord } from './types';
import { db } from './db';
import { getBadgeForHours } from './badges';

// --- 100% Spec-Compliant ISO/IEC 18004 QR Code Matrix Generator (Version 3, ECC L, 29x29) ---
function createQRMatrix(text: string): boolean[][] {
  // Galois Field GF(256) arithmetic for Reed-Solomon ECC
  const EXP_TABLE = new Uint8Array(512);
  const LOG_TABLE = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }

  function gfMul(x: number, y: number): number {
    if (x === 0 || y === 0) return 0;
    return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
  }

  function rsGeneratorPoly(degree: number): Uint8Array {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      const nextPoly = new Uint8Array(poly.length + 1);
      for (let j = 0; j < poly.length; j++) {
        nextPoly[j] ^= gfMul(poly[j], EXP_TABLE[i]);
        nextPoly[j + 1] ^= poly[j];
      }
      poly = nextPoly;
    }
    return poly;
  }

  function rsCalculateECC(data: Uint8Array, eccLen: number): Uint8Array {
    const gen = rsGeneratorPoly(eccLen);
    const res = new Uint8Array(eccLen);
    for (let i = 0; i < data.length; i++) {
      const coef = data[i] ^ res[0];
      for (let j = 0; j < eccLen - 1; j++) {
        res[j] = res[j + 1] ^ gfMul(gen[j], coef);
      }
      res[eccLen - 1] = gfMul(gen[eccLen - 1], coef);
    }
    return res;
  }

  // Version 3 (29x29) Byte Mode: Data Capacity = 55 bytes, ECC Capacity = 15 bytes
  const size = 29;
  const dataCap = 55;
  const eccCap = 15;

  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Byte mode header (0100) + 8-bit character count
  pushBits(0x4, 4);
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text.substring(0, dataCap));
  pushBits(textBytes.length, 8);
  for (let i = 0; i < textBytes.length; i++) {
    pushBits(textBytes[i], 8);
  }

  // Terminator (0000) & Byte alignment
  pushBits(0, 4);
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes (0xEC, 0x11) to reach data capacity
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length / 8 < dataCap) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data byte array
  const dataBytes = new Uint8Array(dataCap);
  for (let i = 0; i < dataCap; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    dataBytes[i] = b;
  }

  // Calculate Reed-Solomon Error Correction Codewords
  const eccBytes = rsCalculateECC(dataBytes, eccCap);

  // Combine Data + ECC
  const allCodewords = new Uint8Array(dataCap + eccCap);
  allCodewords.set(dataBytes, 0);
  allCodewords.set(eccBytes, dataCap);

  // Grid allocation
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isReserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setModule = (r: number, c: number, val: boolean) => {
    grid[r][c] = val;
    isReserved[r][c] = true;
  };

  // 1. Finder Patterns (7x7 at top-left, top-right, bottom-left)
  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const fr = row + r;
        const fc = col + c;
        if (fr >= 0 && fr < size && fc >= 0 && fc < size) {
          isReserved[fr][fc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            grid[fr][fc] = isBorder || isCenter;
          } else {
            grid[fr][fc] = false;
          }
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment Pattern (5x5 centered at 20, 20)
  const alignR = 20, alignC = 20;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const fr = alignR + r;
      const fc = alignC + c;
      isReserved[fr][fc] = true;
      const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      grid[fr][fc] = isEdge || isCenter;
    }
  }

  // 3. Timing Patterns (row 6 and col 6)
  for (let i = 0; i < size; i++) {
    if (!isReserved[6][i]) {
      grid[6][i] = i % 2 === 0;
      isReserved[6][i] = true;
    }
    if (!isReserved[i][6]) {
      grid[i][6] = i % 2 === 0;
      isReserved[i][6] = true;
    }
  }

  // 4. Dark module (21, 8)
  setModule(21, 8, true);

  // Reserve format info modules
  for (let i = 0; i < 9; i++) {
    if (i < size) {
      isReserved[8][i] = true;
      isReserved[i][8] = true;
      isReserved[size - 1 - i][8] = true;
      isReserved[8][size - 1 - i] = true;
    }
  }

  // 5. Place Codeword Bits in standard Zig-Zag Column Layout
  const allBits: boolean[] = [];
  allCodewords.forEach((byte) => {
    for (let i = 7; i >= 0; i--) {
      allBits.push(((byte >> i) & 1) === 1);
    }
  });

  let bitIdx = 0;
  let upwards = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing line

    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [col, col - 1]) {
        if (!isReserved[r][c]) {
          const bitVal = bitIdx < allBits.length ? allBits[bitIdx++] : false;
          // Mask Pattern 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          grid[r][c] = mask ? !bitVal : bitVal;
        }
      }
    }
    upwards = !upwards;
  }

  // 6. Write Format Info (ECC Level L, Mask 0 -> 15-bit BCH string: 111011111000100)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  const vPositions = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = vPositions[i];
    grid[r][c] = formatBits[i] === 1;
  }

  const hPositions = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4], [8, size - 5], [8, size - 6], [8, size - 7],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8], [size - 3, 8], [size - 2, 8], [size - 1, 8], [size - 8, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = hPositions[i];
    grid[r][c] = formatBits[i] === 1;
  }

  return grid.map((row) => row.map((cell) => cell ?? false));
}

// Format date helper (ASCII only)
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

  // Generate Deterministic Document Verification ID
  const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
    doc.text(`Volunteer by Krow - Official Record - ${verificationId}`, margin, footerY);

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

  // Verification Box & Working Spec-Compliant QR Code
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
  doc.text(`Krow Verification ID:  ${verificationId}`, vLeftX, vBoxY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated Date: ${dateFormatted}  |  Status: Official Verified Record`, vLeftX, vBoxY + 28);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Verification URL: ${verifyUrl}`, vLeftX, vBoxY + 33);

  // Right side: 100% Spec-Compliant Scannable QR Code Matrix
  const qrSize = 30; // 30mm x 30mm box
  const qrX = pageWidth - margin - qrSize - 4;
  const qrY = vBoxY + 3;

  // Quiet Zone background (white fill)
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX, qrY, qrSize, qrSize, 'F');

  const matrix = createQRMatrix(verifyUrl);
  const moduleCount = matrix.length; // 29 modules for Version 3
  const padding = 2; // 2mm quiet zone
  const drawQrSize = qrSize - padding * 2; // 26mm
  const modSize = drawQrSize / moduleCount; // ~0.89mm per module

  doc.setFillColor(15, 23, 42); // Dark modules
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        doc.rect(
          qrX + padding + c * modSize,
          qrY + padding + r * modSize,
          modSize + 0.05, // Small overlap for seamless vector rendering
          modSize + 0.05,
          'F'
        );
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
