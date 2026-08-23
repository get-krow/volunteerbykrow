import { jsPDF } from 'jspdf';
import { UserProfile, BadgeDefinition } from './types';

export function generateVolunteerHoursReport(
  profile: UserProfile,
  totalAwardedHours: number,
  completedShiftsCount: number,
  badge: BadgeDefinition
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();

  // Background subtle border
  doc.setDrawColor(124, 58, 237); // Purple brand
  doc.setLineWidth(1.5);
  doc.rect(12, 12, width - 24, 273);

  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, width - 30, 267);

  // Header / Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(109, 40, 217); // Dark Purple
  doc.text('VOLUNTEER BY KROW', width / 2, 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Official Verified Volunteer Hours Report', width / 2, 43, { align: 'center' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(25, 49, width - 25, 49);

  // Statement text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text('This is to certify that the volunteer named below has accumulated', width / 2, 65, { align: 'center' });

  // Volunteer Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name || 'Volunteer', width / 2, 78, { align: 'center' });

  // Summary Metrics Box
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(30, 92, width - 60, 50, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(124, 58, 237);
  doc.text(`${totalAwardedHours} Hours`, width / 2, 114, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Awarded Volunteer Hours`, width / 2, 125, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(109, 40, 217);
  doc.text(`Rank Level: ${badge.name}`, width / 2, 134, { align: 'center' });

  // Details Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Volunteer Profile Summary', 30, 160);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);

  const startY = 170;
  const lineSpacing = 8;

  doc.text(`Completed Shifts Count:`, 30, startY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${completedShiftsCount} shifts`, 90, startY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Primary Location:`, 30, startY + lineSpacing);
  doc.setFont('helvetica', 'bold');
  doc.text(`${profile.city}, ${profile.province_state}, ${profile.country}`, 90, startY + lineSpacing);

  doc.setFont('helvetica', 'normal');
  doc.text(`Account Email:`, 30, startY + lineSpacing * 2);
  doc.setFont('helvetica', 'bold');
  doc.text(`${profile.email}`, 90, startY + lineSpacing * 2);

  doc.setFont('helvetica', 'normal');
  doc.text(`Report Date Generated:`, 30, startY + lineSpacing * 3);
  doc.setFont('helvetica', 'bold');
  doc.text(`${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 90, startY + lineSpacing * 3);

  // Policy Statement
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  const statement =
    'Note: Awarded volunteer hours are verified by Krow Partner Organizations. Hours earned at unverified/pending organizations are excluded from total awarded hours in accordance with Krow verification standards.';
  doc.text(doc.splitTextToSize(statement, width - 60), 30, 225);

  // Footer Signature Line
  doc.setDrawColor(124, 58, 237);
  doc.line(width / 2 - 40, 255, width / 2 + 40, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(109, 40, 217);
  doc.text('KROW VOLUNTEER VERIFICATION SYSTEM', width / 2, 261, { align: 'center' });

  doc.save(`Krow_Volunteer_Hours_Report_${profile.name.replace(/\s+/g, '_')}.pdf`);
}
