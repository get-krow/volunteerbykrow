import { Opportunity } from './types';

export function getGoogleCalendarLink(opp: Opportunity): string {
  const title = encodeURIComponent(opp.title);
  const details = encodeURIComponent(
    `${opp.description || ''}\n\nOrganization: ${opp.org_name || ''}\nInstructions: ${opp.instructions || ''}`
  );
  const location = encodeURIComponent(
    opp.location_type === 'physical'
      ? opp.location_address || 'Physical Address'
      : opp.location_type === 'online'
      ? 'Online Event'
      : 'Location TBD'
  );

  // Format YYYYMMDDTHHmmssZ
  const formatDateToICS = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = (timeStr || '09:00').split(':');
    return `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
  };

  const startIso = formatDateToICS(opp.date, opp.start_time);
  const endIso = formatDateToICS(opp.date, opp.end_time || opp.start_time);
  const datesParam = `${startIso}/${endIso}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${datesParam}`;
}

export function openAllGoogleCalendarLinks(opportunities: Opportunity[]) {
  if (typeof window === 'undefined' || opportunities.length === 0) return;
  
  opportunities.forEach((opp) => {
    const link = getGoogleCalendarLink(opp);
    window.open(link, '_blank');
  });
}
