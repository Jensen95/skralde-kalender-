import PostalMime from 'postal-mime';
import { CalendarEvent, EmailMessage, EmailParser, ParsedEmailDate } from './types';
import { generateEventId } from './utils';

export class EmailEventParser implements EmailParser {
  async extractEvents(email: EmailMessage): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    
    // Parse the email content to look for date/time patterns and event information
    const eventInfo = this.extractEventInfo(email.subject, email.content);
    
    if (eventInfo.length > 0) {
      for (const info of eventInfo) {
        const event: CalendarEvent = {
          id: generateEventId(),
          title: info.title,
          description: info.description,
          start: info.start,
          end: info.end,
          location: info.location,
          organizer: email.from,
          attendees: [email.to],
          created: new Date(),
          modified: new Date()
        };
        events.push(event);
      }
    }
    
    return events;
  }

  private extractEventInfo(subject: string, content: string): Array<{
    title: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
  }> {
    const events: Array<{
      title: string;
      description: string;
      start: Date;
      end: Date;
      location?: string;
    }> = [];

    // Look for common patterns in emails
    const datePatterns = [
      // Match patterns like "January 15, 2024 at 3:00 PM"
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\s+(?:at\s+)?\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/gi,
      // Match patterns like "2024-01-15 15:00" or "01/15/2024 3:00 PM"
      /\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?/gi,
      // Match patterns like "Monday, January 15th at 3 PM"
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?/gi
    ];

    const fullText = `${subject} ${content}`;
    
    // Extract dates from the text
    const foundDates: Date[] = [];
    for (const pattern of datePatterns) {
      const matches = fullText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const date = this.parseDate(match);
          if (date) {
            foundDates.push(date);
          }
        }
      }
    }

    // If we found dates, create events
    if (foundDates.length > 0) {
      // Use the subject as the title, clean it up
      const title = this.cleanEventTitle(subject);
      
      // Look for location keywords
      const location = this.extractLocation(fullText);
      
      for (const startDate of foundDates) {
        // Default duration is 1 hour
        const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
        
        events.push({
          title,
          description: this.truncateText(content, 200),
          start: startDate,
          end: endDate,
          location
        });
      }
    }

    return events;
  }

  private parseDate(dateString: string): Date | null {
    try {
      // Try to parse the date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch {
      return null;
    }
  }

  private cleanEventTitle(subject: string): string {
    // Remove common email prefixes
    return subject
      .replace(/^(RE:|FW:|FWD:)\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractLocation(text: string): string | undefined {
    // Look for common location patterns
    const locationPatterns = [
      /(?:at|@)\s+([^,\n.]+(?:room|office|building|street|avenue|drive|road|conference|zoom|teams|meet))/gi,
      /location:\s*([^\n,]+)/gi,
      /where:\s*([^\n,]+)/gi
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}

export async function parseEmailMessage(raw: ReadableStream<Uint8Array>): Promise<EmailMessage> {
  // PostalMime can handle ReadableStream directly in Cloudflare Workers
  const parsed = await PostalMime.parse(raw);
  
  // Convert headers to Map<string, string>
  const headers = new Map<string, string>();
  if (parsed.headers) {
    for (const header of parsed.headers) {
      headers.set(header.key, header.value);
    }
  }

  return {
    from: parsed.from?.address || '',
    to: parsed.to?.[0]?.address || '',
    subject: parsed.subject || '',
    content: parsed.text || parsed.html || '',
    headers,
    raw: new ArrayBuffer(0) // We don't need to store the raw data
  };
}