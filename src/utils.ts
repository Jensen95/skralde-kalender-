/// <reference types="@cloudflare/workers-types" />

import { CalendarEvent } from './types';

export function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function formatDateForStorage(date: Date): string {
  return date.toISOString();
}

export function parseDateFromStorage(dateString: string): Date {
  return new Date(dateString);
}

export function createEventKey(eventId: string): string {
  return `event:${eventId}`;
}

export function createEventsListKey(): string {
  return 'events:list';
}

export async function getAllEventIds(kv: KVNamespace): Promise<string[]> {
  try {
    const listValue = await kv.get(createEventsListKey());
    if (!listValue) {
      return [];
    }
    return JSON.parse(listValue);
  } catch {
    return [];
  }
}

export async function addEventIdToList(kv: KVNamespace, eventId: string): Promise<void> {
  const currentIds = await getAllEventIds(kv);
  if (!currentIds.includes(eventId)) {
    currentIds.push(eventId);
    await kv.put(createEventsListKey(), JSON.stringify(currentIds));
  }
}

export async function removeEventIdFromList(kv: KVNamespace, eventId: string): Promise<void> {
  const currentIds = await getAllEventIds(kv);
  const filteredIds = currentIds.filter(id => id !== eventId);
  await kv.put(createEventsListKey(), JSON.stringify(filteredIds));
}

export async function storeEvent(kv: KVNamespace, event: CalendarEvent): Promise<void> {
  const eventData = {
    ...event,
    start: formatDateForStorage(event.start),
    end: formatDateForStorage(event.end),
    created: formatDateForStorage(event.created),
    modified: formatDateForStorage(event.modified)
  };
  
  await kv.put(createEventKey(event.id), JSON.stringify(eventData));
  await addEventIdToList(kv, event.id);
}

export async function getEvent(kv: KVNamespace, eventId: string): Promise<CalendarEvent | null> {
  try {
    const eventData = await kv.get(createEventKey(eventId));
    if (!eventData) {
      return null;
    }
    
    const parsed = JSON.parse(eventData);
    return {
      ...parsed,
      start: parseDateFromStorage(parsed.start),
      end: parseDateFromStorage(parsed.end),
      created: parseDateFromStorage(parsed.created),
      modified: parseDateFromStorage(parsed.modified)
    };
  } catch {
    return null;
  }
}

export async function getAllEvents(kv: KVNamespace): Promise<CalendarEvent[]> {
  const eventIds = await getAllEventIds(kv);
  const events: CalendarEvent[] = [];
  
  for (const eventId of eventIds) {
    const event = await getEvent(kv, eventId);
    if (event) {
      events.push(event);
    }
  }
  
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function deleteEvent(kv: KVNamespace, eventId: string): Promise<boolean> {
  try {
    await kv.delete(createEventKey(eventId));
    await removeEventIdFromList(kv, eventId);
    return true;
  } catch {
    return false;
  }
}