import { EventDetails } from './types';

/**
 * Generates an iCalendar (.ics) string for importing into Apple Calendar, Google Calendar, or Outlook.
 */
export function generateIcsCalendar(event: EventDetails, sourceSummary?: string): string {
  const title = event.title || 'Campus Event (AccessLens Notice)';
  const location = event.venue || 'Campus Venue';
  const description = [
    sourceSummary || '',
    event.organizer ? `Organizer: ${event.organizer}` : '',
    event.registrationUrlOrEmail ? `Link/Contact: ${event.registrationUrlOrEmail}` : '',
    'Extracted via AccessLens with Gemma 4 multimodal intelligence.'
  ]
    .filter(Boolean)
    .join('\\n');

  // Parse or approximate ISO date strings
  let dtStart = '20261024T093000Z';
  let dtEnd = '20261024T173000Z';

  if (event.date) {
    const numbers = event.date.match(/\d{4}-\d{2}-\d{2}/);
    if (numbers) {
      const clean = numbers[0].replace(/-/g, '');
      dtStart = `${clean}T040000Z`;
      dtEnd = `${clean}T120000Z`;
    }
  }

  const uid = `accesslens-${Date.now()}@muj.ac.in`;
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AccessLens//Campus Notice Parser 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title.replace(/,/g, '\\,')}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${description.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadIcsFile(event: EventDetails, summary?: string) {
  const icsData = generateIcsCalendar(event, summary);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeFilename = (event.title || 'campus_notice')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  anchor.download = `${safeFilename}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
