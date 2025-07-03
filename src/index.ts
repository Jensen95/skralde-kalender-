/// <reference types="@cloudflare/workers-types" />

import { Env } from './types';
import { generateICalendar, generateCalendarResponse } from './calendar';
import { EmailEventParser, parseEmailMessage } from './email';
import { storeEvent, getAllEvents, deleteEvent } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      switch (url.pathname) {
        case '/calendar':
        case '/calendar.ics':
          return await handleCalendarRequest(env);
        
        case '/events':
          return await handleEventsRequest(request, env);
        
        case '/':
          return handleRootRequest();
        
        default:
          return new Response('Not found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  },

  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      console.log('Processing email:', message.headers.get('subject'));
      
      // Parse the email message
      const emailMessage = await parseEmailMessage(message.raw);
      
      // Extract events from the email
      const parser = new EmailEventParser();
      const events = await parser.extractEvents(emailMessage);
      
      console.log(`Extracted ${events.length} events from email`);
      
      // Store the events
      for (const event of events) {
        await storeEvent(env.CALENDAR_EVENTS, event);
        console.log(`Stored event: ${event.title} at ${event.start}`);
      }
      
    } catch (error) {
      console.error('Email processing error:', error);
    }
  }
};

async function handleCalendarRequest(env: Env): Promise<Response> {
  try {
    const icalContent = await generateICalendar(env);
    return generateCalendarResponse(icalContent);
  } catch (error) {
    console.error('Calendar generation error:', error);
    return new Response('Error generating calendar', { status: 500 });
  }
}

async function handleEventsRequest(request: Request, env: Env): Promise<Response> {
  const method = request.method;
  
  switch (method) {
    case 'GET':
      return await handleGetEvents(env);
    
    case 'DELETE':
      return await handleDeleteEvent(request, env);
    
    default:
      return new Response('Method not allowed', { status: 405 });
  }
}

async function handleGetEvents(env: Env): Promise<Response> {
  try {
    const events = await getAllEvents(env.CALENDAR_EVENTS);
    return new Response(JSON.stringify(events, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return new Response('Error fetching events', { status: 500 });
  }
}

async function handleDeleteEvent(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get('id');
    
    if (!eventId) {
      return new Response('Event ID required', { status: 400 });
    }
    
    const success = await deleteEvent(env.CALENDAR_EVENTS, eventId);
    
    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        }
      });
    } else {
      return new Response('Event not found', { status: 404 });
    }
  } catch (error) {
    console.error('Delete event error:', error);
    return new Response('Error deleting event', { status: 500 });
  }
}

function handleRootRequest(): Response {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ice Calendar Worker</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid #007bff;
        }
        .endpoint {
            font-family: monospace;
            background: #e9ecef;
            padding: 0.5rem;
            border-radius: 4px;
            margin: 0.5rem 0;
        }
        .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 4px;
            margin: 0.5rem 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧊 Ice Calendar Worker</h1>
        <p>Cloudflare Worker for email-to-calendar conversion</p>
    </div>
    
    <div class="card">
        <h2>📅 Calendar Access</h2>
        <p>Subscribe to your calendar using this URL:</p>
        <div class="endpoint">${new URL('/calendar.ics', 'https://your-worker.your-subdomain.workers.dev')}</div>
        <a href="/calendar.ics" class="button">Download Calendar</a>
    </div>
    
    <div class="card">
        <h2>📧 Email Setup</h2>
        <p>Forward emails to your configured address to automatically add events.</p>
        <p>The system will parse common date/time patterns and create calendar events.</p>
    </div>
    
    <div class="card">
        <h2>🔧 API Endpoints</h2>
        <div class="endpoint">GET /calendar.ics - Download iCalendar file</div>
        <div class="endpoint">GET /events - List all events (JSON)</div>
        <div class="endpoint">DELETE /events?id=EVENT_ID - Delete an event</div>
    </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...getCORSHeaders()
    }
  });
}

function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

function getCORSHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}