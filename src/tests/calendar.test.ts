import { generateIcsCalendar } from '../lib/calendar-export';
import { EventDetails } from '../lib/types';
import assert from 'node:assert';
import test from 'node:test';

test('generateIcsCalendar produces valid RFC 5545 iCalendar content', () => {
  const mockEvent: EventDetails = {
    title: 'Hacktoberfest 2026 Opening Ceremony',
    organizer: 'MUJ ACM Student Chapter',
    venue: 'Turing Auditorium AB-1',
    date: '2026-10-24',
    time: '10:00 AM IST',
    registrationUrlOrEmail: 'hacktoberfest@muj.ac.in',
    eligibility: 'All students'
  };

  const ics = generateIcsCalendar(mockEvent, 'Grand opening hackathon keynote and track briefings.');

  assert(ics.includes('BEGIN:VCALENDAR'), 'Must contain BEGIN:VCALENDAR');
  assert(ics.includes('VERSION:2.0'), 'Must contain VERSION:2.0');
  assert(ics.includes('BEGIN:VEVENT'), 'Must contain BEGIN:VEVENT');
  assert(ics.includes('SUMMARY:Hacktoberfest 2026 Opening Ceremony'), 'Must contain correct event summary');
  assert(ics.includes('LOCATION:Turing Auditorium AB-1'), 'Must contain correct location');
  assert(ics.includes('DTSTART:20261024T040000Z'), 'Must contain formatted DTSTART timestamp');
  assert(ics.includes('END:VCALENDAR'), 'Must end with END:VCALENDAR');
});

test('generateIcsCalendar handles null fields gracefully without crashing', () => {
  const minimalEvent: EventDetails = {
    title: null,
    organizer: null,
    venue: null,
    date: null,
    time: null,
    registrationUrlOrEmail: null,
    eligibility: null
  };

  const ics = generateIcsCalendar(minimalEvent);
  assert(ics.includes('SUMMARY:Campus Event (AccessLens Notice)'), 'Fallback summary used');
  assert(ics.includes('LOCATION:Campus Venue'), 'Fallback venue used');
});
