# Calendar API — Data Structures & Endpoints

> **Purpose**: This document defines the data models, DTOs, and RESTful API endpoints the backend (NestJS) should implement for the Calendar feature. The frontend will consume these endpoints to replace the current hardcoded/local calendar data.

---

## 1. Data Model — `CalendarEvent`

Stored in MongoDB. Each event belongs to the authenticated user.

### Schema

| Field         | Type       | Required | Default     | Description                                |
| ------------- | ---------- | -------- | ----------- | ------------------------------------------ |
| `_id`         | `ObjectId` | auto     | —           | MongoDB document ID                        |
| `userId`      | `ObjectId` | yes      | —           | Owner (ref → `User`). Set from JWT.        |
| `title`       | `string`   | yes      | —           | Event title (1–200 chars)                  |
| `description` | `string`   | no       | `""`        | Optional description / notes               |
| `date`        | `string`   | yes      | —           | ISO date portion, e.g. `"2026-02-28"`      |
| `startTime`   | `string`   | yes      | —           | 24h format, e.g. `"09:00"`                 |
| `endTime`     | `string`   | yes      | —           | 24h format, e.g. `"10:30"`                 |
| `color`       | `string`   | no       | `"#4A5C92"` | Hex color code for UI display              |
| `isAllDay`    | `boolean`  | no       | `false`     | If `true`, `startTime`/`endTime` ignored   |
| `location`    | `string`   | no       | `""`        | Event location                             |
| `recurrence`  | `object`   | no       | `null`      | Recurrence rule (see §1.1)                 |
| `reminders`   | `number[]` | no       | `[15]`      | Minutes before event to send reminder      |
| `createdAt`   | `Date`     | auto     | `now()`     | Timestamp                                  |
| `updatedAt`   | `Date`     | auto     | `now()`     | Timestamp                                  |

### 1.1 Recurrence Rule (optional)

If `recurrence` is provided:

```json
{
  "freq": "daily" | "weekly" | "monthly" | "yearly",
  "interval": 1,          // every N (freq) units — default 1
  "until": "2026-12-31",  // ISO date, inclusive end — optional
  "count": 10,            // max occurrences — optional (mutually exclusive with `until`)
  "byDay": ["MO", "WE", "FR"]  // for weekly freq — optional
}
```

> **Note:** Recurrence is a stretch goal. For the initial implementation, skip recurrence and treat every event as a one-off.

---

## 2. DTOs

### 2.1 `CreateCalendarEventDto`

```typescript
{
  title: string;        // required, min 1, max 200
  description?: string; // optional
  date: string;         // required, format "YYYY-MM-DD"
  startTime: string;    // required, format "HH:mm"
  endTime: string;      // required, format "HH:mm", must be > startTime
  color?: string;       // optional, hex color (default "#4A5C92")
  isAllDay?: boolean;   // optional (default false)
  location?: string;    // optional
  reminders?: number[]; // optional, array of minutes
}
```

### 2.2 `UpdateCalendarEventDto`

All fields optional (partial update via `PATCH`):

```typescript
{
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  isAllDay?: boolean;
  location?: string;
  reminders?: number[];
}
```

### 2.3 `CalendarEventResponseDto`

Returned by all endpoints:

```typescript
{
  _id: string;
  userId: string;
  title: string;
  description: string;
  date: string;          // "YYYY-MM-DD"
  startTime: string;     // "HH:mm"
  endTime: string;       // "HH:mm"
  color: string;
  isAllDay: boolean;
  location: string;
  reminders: number[];
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}
```

---

## 3. REST API Endpoints

**Base path:** `/api/calendar`  
**Auth:** All endpoints require `Authorization: Bearer <jwt_token>`  
**Content-Type:** `application/json`

### 3.1 List / Query Events

```
GET /api/calendar
```

**Query Parameters:**

| Param   | Type     | Required | Description                                      |
| ------- | -------- | -------- | ------------------------------------------------ |
| `from`  | `string` | no       | Start date inclusive, `YYYY-MM-DD`               |
| `to`    | `string` | no       | End date inclusive, `YYYY-MM-DD`                 |
| `month` | `number` | no       | Month (1–12). Use with `year`. Shortcut filter.  |
| `year`  | `number` | no       | Year (e.g. 2026). Use with `month`.              |
| `q`     | `string` | no       | Search title/description (case-insensitive)      |
| `page`  | `number` | no       | Page number, default `1`                         |
| `limit` | `number` | no       | Items per page, default `100`                    |

> If neither `from`/`to` nor `month`/`year` are provided, return all events for the user sorted by `date` + `startTime` ascending.

**Response `200 OK`:**

```json
{
  "data": [ CalendarEventResponseDto, ... ],
  "total": 42,
  "page": 1,
  "limit": 100
}
```

### 3.2 Get Single Event

```
GET /api/calendar/:id
```

**Response `200 OK`:** `CalendarEventResponseDto`  
**Error:** `404` if not found or doesn't belong to user.

### 3.3 Create Event

```
POST /api/calendar
```

**Body:** `CreateCalendarEventDto`

**Response `201 Created`:** `CalendarEventResponseDto`  
**Errors:**  
- `400` validation errors  
- `401` unauthorized

### 3.4 Update Event

```
PATCH /api/calendar/:id
```

**Body:** `UpdateCalendarEventDto` (partial)

**Response `200 OK`:** `CalendarEventResponseDto` (updated)  
**Errors:**  
- `400` validation errors  
- `404` not found

### 3.5 Delete Event

```
DELETE /api/calendar/:id
```

**Response `204 No Content`**  
**Errors:**  
- `404` not found

---

## 4. Validation Rules

| Field       | Rule                                                         |
| ----------- | ------------------------------------------------------------ |
| `title`     | Non-empty string, 1–200 characters                          |
| `date`      | Valid ISO date string (`YYYY-MM-DD`)                         |
| `startTime` | Valid 24h time (`HH:mm`), e.g. `"00:00"` to `"23:59"`      |
| `endTime`   | Valid 24h time, must be strictly after `startTime`           |
| `color`     | Valid hex color (`#` + 6 hex digits), e.g. `"#4A5C92"`      |
| `reminders` | Array of positive integers (minutes), max 5 items            |

---

## 5. Example Requests

### Create an event

```bash
curl -X POST http://localhost:3000/api/calendar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Standup",
    "description": "Daily standup with the dev team",
    "date": "2026-02-28",
    "startTime": "09:00",
    "endTime": "09:30",
    "color": "#4A5C92"
  }'
```

### Fetch events for a month

```bash
curl "http://localhost:3000/api/calendar?month=2&year=2026" \
  -H "Authorization: Bearer <token>"
```

### Update an event

```bash
curl -X PATCH http://localhost:3000/api/calendar/60f7b2c5e4b0a12345678901 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Standup (Updated)",
    "startTime": "09:15",
    "endTime": "09:45"
  }'
```

### Delete an event

```bash
curl -X DELETE http://localhost:3000/api/calendar/60f7b2c5e4b0a12345678901 \
  -H "Authorization: Bearer <token>"
```

---

## 6. Error Response Format

Match the existing backend convention:

```json
{
  "statusCode": 400,
  "message": ["title must be a string", "date must be in YYYY-MM-DD format"],
  "error": "Bad Request"
}
```

---

## 7. Frontend Integration Notes

Once the backend is ready, the frontend will:

1. **Add `calendarApi` methods** in `app/lib/api.ts` (matching the pattern of `contactsApi` / `emailApi`):
   - `list(token, params?)` → `GET /api/calendar`
   - `get(token, id)` → `GET /api/calendar/:id`
   - `create(token, dto)` → `POST /api/calendar`
   - `update(token, id, dto)` → `PATCH /api/calendar/:id`
   - `delete(token, id)` → `DELETE /api/calendar/:id`

2. **Replace hardcoded events** in `CalendarView.tsx` with API fetches (re-fetch when month changes).

3. **Map `_id` → `id`** in the frontend like we do for contacts (`apiToContact` pattern).

4. **Current frontend fields used:** `id`, `title`, `description`, `date`, `startTime`, `endTime`, `color` — these are the **minimum** the backend must support for parity.

---

## 8. Suggested MongoDB Index

```javascript
db.calendarevents.createIndex({ userId: 1, date: 1 })
```

This covers the most common query: "all events for a user in a date range."
