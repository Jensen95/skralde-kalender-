# Project Improvements

## Migration from KV to D1 Database

### Why D1 is Better for This Use Case

✅ **Better Query Capabilities**
- SQL queries for date range filtering
- Search events by title, location, or description
- Complex filtering and sorting operations

✅ **Relational Data Structure**
- Proper schema with indexes for performance
- Support for event types and categories
- Better data relationships and constraints

✅ **Scalability**
- Handle larger datasets more efficiently
- Better performance for calendar operations
- Supports complex calendar queries

✅ **Data Integrity**
- ACID transactions
- Schema validation
- Referential integrity

### Database Schema

```sql
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  location TEXT,
  organizer TEXT,
  attendees TEXT, -- JSON array
  created_at TEXT NOT NULL,
  modified_at TEXT NOT NULL,
  event_type TEXT DEFAULT 'general',
  source_email TEXT
);
```

### New Database Features

- **Event Types**: Categorize events (storskrald, glas_metal, etc.)
- **Search**: Full-text search across events
- **Date Filtering**: Query events by date range
- **Source Tracking**: Store original email content
- **Performance Indexes**: Optimized for calendar queries

## Danish Email Support

### Supported Email Patterns

🇩🇰 **Danish Date Formats**
- `mandag d.07-07-2025` (Monday d.07-07-2025)
- `d.07-07-2025` (d.07-07-2025)
- Automatically sets time to 8:00 AM for waste collection

🇩🇰 **Danish Address Format**
- `adressen Nøddeskellet 8, 2730 Herlev`
- Automatically extracts address after "adressen"

🇩🇰 **Waste Collection Types**
- `storskrald` → "Storskrald afhentning"
- `glas/metal` → "Glas/metal afhentning"
- `papir` → "Papir afhentning"
- `restaffald` → "Restaffald afhentning"
- `madaffald` → "Madaffald afhentning"
- `genbrugsplast` → "Genbrugsplast afhentning"

### Example Email Processing

**Input Email:**
```
Subject: Affaldsafhentning
Kære Morten Hartvig Jensen.

Du vil mandag d.07-07-2025 få afhentet storskrald på adressen Nøddeskellet 8, 2730 Herlev.
```

**Generated Event:**
- **Title**: "Storskrald afhentning"
- **Date**: July 7, 2025 at 8:00 AM
- **Location**: "Nøddeskellet 8, 2730 Herlev"
- **Type**: "storskrald"
- **Description**: Truncated email content

## API Enhancements

### New Endpoints

🔍 **Search Events**
```
GET /events?search=storskrald
```

📅 **Filter by Date Range**
```
GET /events?start=2025-01-01&end=2025-12-31
```

🗂️ **Filter by Type**
```
GET /events?type=storskrald
```

### Enhanced Event Data

Events now include:
- `event_type`: Categorization
- `source_email`: Original email content
- Better location parsing
- Improved descriptions

## Development Improvements

### Better TypeScript Support
- Proper D1 types
- Enhanced error handling
- Better type safety

### Deployment Enhancements
- Automated D1 database creation
- Database migration support
- Improved deployment script

### Testing Support
- Local D1 testing
- Database seed data
- Email parsing tests

## Performance Benefits

### Database Performance
- **Indexed Queries**: Fast date and type filtering
- **Efficient Storage**: Normalized data structure
- **Scalable**: Handles thousands of events

### Calendar Generation
- **Faster Queries**: SQL is more efficient than KV scans
- **Better Caching**: Database-level optimizations
- **Reduced Latency**: Single query vs multiple KV calls

## Migration Guide

### From KV to D1

1. **Create D1 Database**
   ```bash
   wrangler d1 create ice-calendar-db
   ```

2. **Update Configuration**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "ice-calendar-db"
   database_id = "your-database-id"
   ```

3. **Deploy with Auto-Migration**
   ```bash
   ./deploy.sh
   ```

### Data Migration

If you have existing KV data, create a migration script:

```typescript
// Migrate existing KV events to D1
async function migrateFromKV(env: Env) {
  const kvKeys = await env.CALENDAR_EVENTS.list();
  
  for (const key of kvKeys.keys) {
    if (key.name.startsWith('event:')) {
      const eventData = await env.CALENDAR_EVENTS.get(key.name);
      if (eventData) {
        const event = JSON.parse(eventData);
        await storeEvent(env.DB, event);
      }
    }
  }
}
```

## Future Enhancements

### Planned Features
- **Recurring Events**: Handle weekly waste collection
- **Event Categories**: Color coding for different types
- **Notifications**: Email/SMS reminders
- **Calendar Sync**: Two-way sync with external calendars
- **Multi-language**: Support for more languages
- **AI Parsing**: Better email content understanding

### Danish Municipalities
- Support for more Danish municipalities
- Municipal-specific parsing rules
- Custom waste collection schedules

## Benefits Summary

✅ **Better Performance**: SQL queries vs KV operations
✅ **Enhanced Features**: Search, filtering, categorization
✅ **Danish Support**: Native waste collection email parsing
✅ **Scalability**: Handle thousands of events efficiently
✅ **Data Integrity**: ACID transactions and schema validation
✅ **Developer Experience**: Better TypeScript support and tooling

The migration to D1 and addition of Danish email support makes this a much more robust and feature-rich calendar solution!