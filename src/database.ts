/// <reference types="@cloudflare/workers-types" />

import { CalendarEvent } from './types';

// Database schema
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  location TEXT,
  organizer TEXT,
  attendees TEXT, -- JSON array of email addresses
  created_at TEXT NOT NULL,
  modified_at TEXT NOT NULL,
  event_type TEXT DEFAULT 'general', -- e.g., 'storskrald', 'glas_metal', 'general'
  source_email TEXT -- Store original email for reference
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON calendar_events(created_at);
`;

export function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function formatDateForStorage(date: Date): string {
  return date.toISOString();
}

export function parseDateFromStorage(dateString: string): Date {
  return new Date(dateString);
}

export async function initializeDatabase(db: D1Database): Promise<void> {
  await db.exec(SCHEMA);
}

export async function storeEvent(db: D1Database, event: CalendarEvent): Promise<void> {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO calendar_events (
      id, title, description, start_date, end_date, location, 
      organizer, attendees, created_at, modified_at, event_type, source_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt
    .bind(
      event.id,
      event.title,
      event.description || null,
      formatDateForStorage(event.start),
      formatDateForStorage(event.end),
      event.location || null,
      event.organizer || null,
      JSON.stringify(event.attendees || []),
      formatDateForStorage(event.created),
      formatDateForStorage(event.modified),
      (event as unknown as { eventType?: string }).eventType || 'general',
      (event as unknown as { sourceEmail?: string }).sourceEmail || null
    )
    .run();
}

export async function getEvent(db: D1Database, eventId: string): Promise<CalendarEvent | null> {
  const stmt = db.prepare('SELECT * FROM calendar_events WHERE id = ?');
  const result = await stmt.bind(eventId).first();

  if (!result) {
    return null;
  }

  return dbRowToEvent(result);
}

export async function getAllEvents(db: D1Database): Promise<CalendarEvent[]> {
  const stmt = db.prepare('SELECT * FROM calendar_events ORDER BY start_date ASC');
  const result = await stmt.all();

  return result.results.map(dbRowToEvent);
}

export async function getEventsByAddress(
  db: D1Database,
  address: string
): Promise<CalendarEvent[]> {
  const stmt = db.prepare(`
    SELECT * FROM calendar_events 
    WHERE location LIKE ?
    ORDER BY start_date ASC
  `);

  const searchPattern = `%${address}%`;
  const result = await stmt.bind(searchPattern).all();

  return result.results.map(dbRowToEvent);
}

export async function getEventsByDateRange(
  db: D1Database,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const stmt = db.prepare(`
    SELECT * FROM calendar_events 
    WHERE start_date >= ? AND start_date <= ?
    ORDER BY start_date ASC
  `);

  const result = await stmt
    .bind(formatDateForStorage(startDate), formatDateForStorage(endDate))
    .all();

  return result.results.map(dbRowToEvent);
}

export async function getEventsByType(db: D1Database, eventType: string): Promise<CalendarEvent[]> {
  const stmt = db.prepare(`
    SELECT * FROM calendar_events 
    WHERE event_type = ?
    ORDER BY start_date ASC
  `);

  const result = await stmt.bind(eventType).all();
  return result.results.map(dbRowToEvent);
}

export async function deleteEvent(db: D1Database, eventId: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM calendar_events WHERE id = ?');
  const result = await stmt.bind(eventId).run();

  return result.meta.changes > 0;
}

export async function searchEvents(db: D1Database, query: string): Promise<CalendarEvent[]> {
  const stmt = db.prepare(`
    SELECT * FROM calendar_events 
    WHERE title LIKE ? OR description LIKE ? OR location LIKE ?
    ORDER BY start_date ASC
  `);

  const searchPattern = `%${query}%`;
  const result = await stmt.bind(searchPattern, searchPattern, searchPattern).all();

  return result.results.map(dbRowToEvent);
}

function dbRowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || undefined,
    start: parseDateFromStorage(row.start_date as string),
    end: parseDateFromStorage(row.end_date as string),
    location: (row.location as string) || undefined,
    organizer: (row.organizer as string) || undefined,
    attendees: row.attendees ? JSON.parse(row.attendees as string) : undefined,
    created: parseDateFromStorage(row.created_at as string),
    modified: parseDateFromStorage(row.modified_at as string),
  };
}
