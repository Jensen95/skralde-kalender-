/// <reference types="@cloudflare/workers-types" />

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  organizer?: string;
  attendees?: string[];
  created: Date;
  modified: Date;
}

export interface EmailEventExtraction {
  subject: string;
  body: string;
  from: string;
  to: string;
  date: Date;
  events: CalendarEvent[];
}

export interface Env {
  CALENDAR_EVENTS: KVNamespace;
  CALENDAR_NAME: string;
  CALENDAR_DESCRIPTION: string;
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  content: string;
  headers: Map<string, string>;
  raw: ArrayBuffer;
}

export interface ParsedEmailDate {
  date?: Date;
  time?: string;
  duration?: number; // in minutes
}

export interface EmailParser {
  extractEvents(email: EmailMessage): Promise<CalendarEvent[]>;
}

export const EVENT_STATUS = {
  CONFIRMED: 'CONFIRMED',
  TENTATIVE: 'TENTATIVE',
  CANCELLED: 'CANCELLED'
} as const;

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];