import PostalMime from 'postal-mime';
import { CalendarEvent, EmailMessage, EmailParser, ParsedEmailDate } from './types';
import { generateEventId } from './database';

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

    // Look for Danish waste collection patterns and common date patterns
    const danishDatePatterns = [
      // Danish format: "mandag d.07-07-2025" or similar
      /(?:mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)\s+d\.(\d{2}-\d{2}-\d{4})/gi,
      // Alternative Danish format: "d. 07-07-2025" or "d.07-07-2025"
      /d\.?\s*(\d{2}-\d{2}-\d{4})/gi,
    ];
    
    const generalDatePatterns = [
      // Match patterns like "January 15, 2024 at 3:00 PM"
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\s+(?:at\s+)?\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/gi,
      // Match patterns like "2024-01-15 15:00" or "01/15/2024 3:00 PM"
      /\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?/gi,
      // Match patterns like "Monday, January 15th at 3 PM"
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?/gi
    ];
    
    const allDatePatterns = [...danishDatePatterns, ...generalDatePatterns];

    const fullText = `${subject} ${content}`;
    
          // Extract dates from the text
      const foundDates: Date[] = [];
      for (const pattern of allDatePatterns) {
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
              // Extract event type and create appropriate title
        const eventType = this.extractWasteCollectionType(fullText);
        const title = this.createEventTitle(subject, eventType);
        
        // Look for location keywords (including Danish addresses)
        const location = this.extractLocation(fullText);
      
              for (const startDate of foundDates) {
          // Default duration is 1 hour
          const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
          
          const eventData: any = {
            title,
            description: this.truncateText(content, 200),
            start: startDate,
            end: endDate,
            location,
            eventType,
            sourceEmail: `${subject}\n\n${content.substring(0, 500)}`
          };
          
          events.push(eventData);
        }
    }

    return events;
  }

  private parseDate(dateString: string): Date | null {
    try {
      // Handle Danish date format: "d.07-07-2025" or "mandag d.07-07-2025"
      const danishMatch = dateString.match(/(\d{2}-\d{2}-\d{4})/);
      if (danishMatch) {
        const [day, month, year] = danishMatch[1].split('-');
        // Default time to 8:00 AM for waste collection
        const date = new Date(`${year}-${month}-${day}T08:00:00`);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Try to parse the date string normally
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch {
      return null;
    }
  }

  private extractWasteCollectionType(text: string): string {
    const wasteTypes = {
      'storskrald': 'storskrald',
      'glas/metal': 'glas_metal',
      'papir': 'papir',
      'restaffald': 'restaffald',
      'madaffald': 'madaffald',
      'genbrugsplast': 'genbrugsplast'
    };

    for (const [pattern, type] of Object.entries(wasteTypes)) {
      if (text.toLowerCase().includes(pattern)) {
        return type;
      }
    }

    return 'general';
  }

  private createEventTitle(subject: string, eventType: string): string {
    const wasteTypeNames = {
      'storskrald': 'Storskrald afhentning',
      'glas_metal': 'Glas/metal afhentning',
      'papir': 'Papir afhentning',
      'restaffald': 'Restaffald afhentning',
      'madaffald': 'Madaffald afhentning',
      'genbrugsplast': 'Genbrugsplast afhentning',
      'general': this.cleanEventTitle(subject)
    };

    return wasteTypeNames[eventType as keyof typeof wasteTypeNames] || this.cleanEventTitle(subject);
  }

  private cleanEventTitle(subject: string): string {
    // Remove common email prefixes
    return subject
      .replace(/^(RE:|FW:|FWD:)\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractLocation(text: string): string | undefined {
    // Look for Danish address patterns first
    const danishAddressPattern = /adressen\s+([^,\n.]+)/gi;
    const danishMatch = text.match(danishAddressPattern);
    if (danishMatch && danishMatch[0]) {
      // Extract everything after "adressen"
      const addressPart = danishMatch[0].replace(/adressen\s+/gi, '').trim();
      return addressPart;
    }

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