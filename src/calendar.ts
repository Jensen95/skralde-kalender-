/// <reference types="@cloudflare/workers-types" />

import { CalendarEvent, Env } from './types';
import { getAllEvents } from './utils';

export async function generateICalendar(env: Env): Promise<string> {
  const events = await getAllEvents(env.CALENDAR_EVENTS);
  
  const calendarLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ice Calendar Worker//EN',
    `X-WR-CALNAME:${env.CALENDAR_NAME}`,
    `X-WR-CALDESC:${env.CALENDAR_DESCRIPTION}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const event of events) {
    calendarLines.push(...generateEventLines(event));
  }

  calendarLines.push('END:VCALENDAR');

  return calendarLines.join('\r\n');
}

function generateEventLines(event: CalendarEvent): string[] {
  const lines: string[] = [];
  
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${event.id}`);
  lines.push(`DTSTAMP:${formatDateForICal(event.created)}`);
  lines.push(`DTSTART:${formatDateForICal(event.start)}`);
  lines.push(`DTEND:${formatDateForICal(event.end)}`);
  lines.push(`SUMMARY:${escapeText(event.title)}`);
  
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  
  if (event.organizer) {
    lines.push(`ORGANIZER:mailto:${event.organizer}`);
  }
  
  if (event.attendees && event.attendees.length > 0) {
    for (const attendee of event.attendees) {
      lines.push(`ATTENDEE:mailto:${attendee}`);
    }
  }
  
  lines.push(`CREATED:${formatDateForICal(event.created)}`);
  lines.push(`LAST-MODIFIED:${formatDateForICal(event.modified)}`);
  lines.push('STATUS:CONFIRMED');
  lines.push('TRANSP:OPAQUE');
  lines.push('END:VEVENT');
  
  return lines;
}

function formatDateForICal(date: Date): string {
  // Format: YYYYMMDDTHHMMSSZ
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

export function generateCalendarResponse(icalContent: string): Response {
  return new Response(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="calendar.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}