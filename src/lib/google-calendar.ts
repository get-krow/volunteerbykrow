import { Opportunity } from './types';

/**
 * Formats YYYY-MM-DD and HH:MM into Google Calendar ISO compact format YYYYMMDDTHHmmssZ
 */
function formatGCalDateTime(dateStr: string, timeStr: string): string {
  try {
    const cleanTime = timeStr.replace(/[^0-9:]/g, '').trim();
    const [hours, minutes] = cleanTime.split(':').map((num) => num.padStart(2, '0'));
    const cleanDate = dateStr.replace(/-/g, '');
    const hh = hours || '09';
    const mm = minutes || '00';
    return `${cleanDate}T${hh}${mm}00`;
  } catch (e) {
    const cleanDate = dateStr.replace(/-/g, '');
    return `${cleanDate}T090000`;
  }
}

export function createGoogleCalendarUrl(opp: Opportunity): string {
  const startDt = formatGCalDateTime(opp.date, opp.start_time);
  const endDt = formatGCalDateTime(opp.date, opp.end_time);

  const title = encodeURIComponent(`Volunteer: ${opp.title} (${opp.org_name || 'Krow'})`);
  const details = encodeURIComponent(
    `${opp.description || ''}\n\nInstructions: ${opp.instructions || 'N/A'}\n\nPowered by Volunteer by Krow`
  );
  const location = encodeURIComponent(
    opp.location_type === 'physical'
      ? opp.location_address || 'See event details'
      : opp.location_type === 'online'
      ? 'Online Event'
      : 'Location TBD'
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDt}/${endDt}&details=${details}&location=${location}`;
}

export function openAllUpcomingInCalendar(opportunities: Opportunity[]): void {
  opportunities.forEach((opp) => {
    const url = createGoogleCalendarUrl(opp);
    window.open(url, '_blank');
  });
}
