import { UserProfile, AttendanceRecord, Opportunity } from './types';
import { getBadgeForHours } from './badges';

export function generateVolunteerHoursReport(
  user: UserProfile,
  totalHours: number,
  completedShiftsCount: number,
  attendanceRecords: (AttendanceRecord & { opportunity?: Opportunity })[]
) {
  // Client-side execution check
  if (typeof window === 'undefined') return;

  const currentBadge = getBadgeForHours(totalHours);
  const generatedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Create printable HTML element
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) {
    alert('Please allow popups to download your Volunteer Hours Report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Volunteer Hours Report — ${user.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #635bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #635bff;
            letter-spacing: -0.5px;
          }
          .sublogo {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .title {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 8px;
          }
          .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .meta-item label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .meta-item value {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          th {
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 1px solid #cbd5e1;
            padding: 10px 8px;
          }
          td {
            font-size: 13px;
            border-bottom: 1px solid #f1f5f9;
            padding: 12px 8px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          .print-btn {
            background: #635bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            margin-bottom: 20px;
          }
          @media print {
            .print-btn { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

        <div class="header">
          <div>
            <div class="logo">VOLUNTEER BY KROW</div>
            <div class="sublogo">Official Hours Certification</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            Date Generated: ${generatedDate}
          </div>
        </div>

        <div class="title">Volunteer Hours Statement</div>
        <p style="color: #475569; font-size: 14px; margin-bottom: 25px;">
          This official report certifies the recorded community volunteer contributions for <strong>${user.name}</strong> (${user.email}).
        </p>

        <div class="meta-box">
          <div class="meta-item">
            <label>Total Awarded Hours</label>
            <value>${totalHours} Hours</value>
          </div>
          <div class="meta-item">
            <label>Completed Shifts</label>
            <value>${completedShiftsCount} Shifts</value>
          </div>
          <div class="meta-item">
            <label>Achievement Rank</label>
            <value>${currentBadge.name}</value>
          </div>
        </div>

        <h3 style="font-size: 16px; margin-bottom: 12px;">Verified Shift Record History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Opportunity Title</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Hours Awarded</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              const validRecs = attendanceRecords.filter((rec) => rec.opportunity_id !== 'admin-adjustment');
              if (validRecs.length === 0) {
                return `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">No completed shift records found.</td></tr>`;
              }
              return validRecs
                .map(
                  (rec) => `
              <tr>
                <td>${rec.opportunity?.date || new Date(rec.marked_at).toISOString().split('T')[0]}</td>
                <td><strong>${rec.opportunity_title || rec.opportunity?.title || 'Community Event'}</strong></td>
                <td>${rec.opportunity?.org_name || 'Organization'}</td>
                <td><span style="color: ${rec.is_verified_org_at_completion ? '#10b981' : '#f59e0b'}; font-weight: 700;">${
                    rec.is_verified_org_at_completion ? 'Verified Org' : 'Pending Org'
                  }</span></td>
                <td><strong>${rec.hours_awarded} hrs</strong></td>
              </tr>
            `
                )
                .join('');
            })()}
          </tbody>
        </table>

        <div class="footer">
          <div>Verified by Krow Platform • https://volunteerbykrow.vercel.app</div>
          <div>Document ID: KB-${Math.random().toString(36).substring(2, 9).toUpperCase()}</div>
        </div>

        <script>
          // Auto trigger print preview
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
    </html>
  `;

  reportWindow.document.write(htmlContent);
  reportWindow.document.close();
}
