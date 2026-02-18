# CLAUDE.md — Watts Cycling Coach

This file provides guidance for AI assistants working in this codebase.

---

## Project Overview

**Watts** is a personal cycling training dashboard built with Next.js. It integrates with the [Intervals.icu](https://intervals.icu) API to surface fitness data, track training load, and manage upcoming workouts. A planned Phase 2 will add an AI coaching chat interface via the Claude API.

The application is deployed on Vercel and is designed for a single athlete (no multi-user support).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.1.0 (Pages Router) |
| UI | React 18 (functional components, hooks) |
| Charts | Recharts 2.10.3 |
| Dates | date-fns 3.3.1 |
| HTTP | Native `fetch` (axios is imported but unused) |
| Styling | Inline JS style objects + `globals.css` CSS variables |
| Hosting | Vercel |
| External API | Intervals.icu REST API (Basic Auth) |

---

## Directory Structure

```
watts-cycling-coach/
├── components/           # React UI components (one file per component)
│   ├── AdherenceTable.js # Planned vs actual workout compliance view
│   ├── CalendarView.js   # Monthly calendar with workout CRUD
│   ├── PMCChart.js       # Performance Management Chart (CTL/ATL/TSB)
│   ├── TimelineBar.js    # Visual timeline from today to race day
│   ├── WeeklyTSSChart.js # Bar chart of weekly Training Stress Score
│   ├── WorkoutBuilder.js # Workout templates + custom workout creation
│   └── ZoneDonut.js      # Power zone distribution donut chart
├── lib/                  # Business logic and API clients
│   ├── athlete.js        # Static athlete profile and zone configuration
│   ├── intervals.js      # Intervals.icu API client
│   └── pmc.js            # PMC calculations (CTL, ATL, TSB, projections)
├── pages/
│   ├── api/
│   │   ├── dashboard.js  # Main data aggregation endpoint (GET)
│   │   └── workout.js    # Workout creation endpoint (POST)
│   ├── _app.js           # Next.js app wrapper
│   └── index.js          # Main dashboard page (all tabs)
├── styles/
│   └── globals.css       # CSS variables, base styles, fonts
├── next.config.js        # Next.js config (React strict mode enabled)
├── vercel.json           # Vercel deployment config (see security note)
└── package.json          # Scripts: dev, build, start
```

---

## Development Workflow

### Setup

```bash
npm install
npm run dev     # Starts on http://localhost:3000
```

### Scripts

```bash
npm run dev     # Local development server (hot reload)
npm run build   # Production build
npm run start   # Serve production build locally
```

There is **no test runner, no linter, and no CI pipeline** currently configured.

### Environment Variables

Credentials are required to call the Intervals.icu API. For local development, create `.env.local` (already in `.gitignore`):

```
INTERVALS_ATHLETE_ID=i98700
INTERVALS_API_KEY=<your_api_key>
```

**IMPORTANT:** `vercel.json` and `lib/intervals.js` currently contain hardcoded credentials — this is a known security issue. When touching either file, migrate the values to environment variables rather than extending the hardcoded pattern.

---

## Architecture and Data Flow

```
pages/index.js  →  GET /api/dashboard  →  lib/intervals.js  →  intervals.icu API
                                        →  lib/pmc.js          (in-memory calculations)
                                        →  lib/athlete.js      (static config)

pages/index.js  →  POST /api/workout   →  lib/intervals.js  →  intervals.icu API
```

- **`/api/dashboard`** fetches 90 days of activities, wellness records, and upcoming events in parallel, then runs all PMC calculations server-side before returning a single JSON payload.
- **`/api/workout`** accepts a workout definition and posts it to the athlete's Intervals.icu calendar.
- **`pages/index.js`** owns all top-level state; child components are purely presentational and receive data via props.
- There is no client-side state management library. State is local (`useState`) or lifted to the page.

---

## Key Library Files

### `lib/athlete.js`

Single source of truth for athlete configuration:

- `ATHLETE` — static profile (age, CP, FTP, VO2max)
- `POWER_ZONES` — six zones defined as percentages of Critical Power (CP)
- `TRAINING_TIMELINE` — key dates (camp start/end, race day) used across components
- `PMC_CONSTANTS` — CTL decay (42 days), ATL decay (7 days)

**When updating athlete data or key dates, always update this file.** Other files import from here; do not duplicate constants elsewhere.

### `lib/pmc.js`

Performance Management Chart math:

- `calculatePMC(activities, startDate)` — returns daily `{ date, ctl, atl, tsb }` array using exponentially weighted moving averages
- `projectPMC(currentPMC, futuredTSSByDate)` — extends the PMC curve into the future given planned daily TSS
- `getFormStatus(tsb)` — maps a TSB value to a label and color
- `calculateZoneDistribution(activities)` — aggregates zone_times across activities
- `weeklyTSS(activities)` — groups TSS by Monday-anchored week

CTL and ATL use the standard Coggan formulas:
- `CTL(t) = CTL(t-1) + (TSS(t) - CTL(t-1)) / 42`
- `ATL(t) = ATL(t-1) + (TSS(t) - ATL(t-1)) / 7`

### `lib/intervals.js`

Thin wrapper around the Intervals.icu REST API using Basic Auth. Key methods:

| Method | Intervals.icu endpoint |
|---|---|
| `getAthlete()` | GET `/athlete/{id}` |
| `getActivities(start, end)` | GET `/athlete/{id}/activities` |
| `getWellness(start, end)` | GET `/athlete/{id}/wellness` |
| `getEvents(start, end)` | GET `/athlete/{id}/events` |
| `postWorkout(data)` | POST `/athlete/{id}/events` |
| `updateEvent(id, data)` | PUT `/athlete/{id}/events/{id}` |

---

## Components Reference

### `PMCChart`

Props: `{ historical: PMCEntry[], projected: PMCEntry[] }`

Renders a `LineChart` with three lines (CTL, ATL, TSB) and reference lines for camp and race day. The historical and projected arrays are distinguished by a `projected: true` flag on each point.

### `WeeklyTSSChart`

Props: `{ weeks: WeekEntry[] }`

Where `WeekEntry = { week: string, tss: number, rides: number, hours: number }`. The current/most recent week is styled in bright accent color.

### `ZoneDonut`

Props: `{ activities: Activity[] }`

Derives zone distribution from `activity.zone_times` if available, otherwise falls back to a static zone table.

### `CalendarView`

Props: `{ activities, events, onPost }`

Full calendar with day-detail panel. The `onPost(workout)` callback bubbles up to `index.js` which calls `/api/workout`. Camp days, travel days, and the race day are color-coded based on `TRAINING_TIMELINE`.

### `WorkoutBuilder`

Props: `{ onPost }`

Provides 5 predefined workout templates and a custom builder. Calls `onPost` with a structured workout payload when the user submits.

### `AdherenceTable`

Props: `{ adherence: AdherenceEntry[] }`

Where `AdherenceEntry = { date, planned: { name, tss }, actual: { name, tss }, adherence: number }`. Shows last 14 days.

### `TimelineBar`

Props: `{ today: string }` (ISO date)

Stateless component; all event positions are derived from `TRAINING_TIMELINE` in `lib/athlete.js`.

---

## Styling Conventions

- **Inline style objects** are defined at the bottom of each component file in a `const styles = { ... }` block.
- **CSS variables** in `globals.css` define the color palette. Use these variables rather than hardcoding hex values:
  - `--acid: #c8f000` (primary accent — lime green)
  - `--red: ...`, `--orange: ...`, `--blue: ...`, `--green: ...`, `--purple: ...`
- **Fonts:** Bebas Neue (display/numbers), DM Mono (data/labels), DM Sans (body) — all via Google Fonts.
- **Theme:** Dark background with noise texture. All new components should follow this aesthetic.
- Do **not** use CSS modules, Tailwind, or any external component library.

---

## API Conventions

- API routes live in `pages/api/`.
- Use `async/await` and wrap the handler body in `try/catch`. Return `res.status(500).json({ error })` on failure.
- Data fetching from Intervals.icu should go through `lib/intervals.js`, not directly in API route files.
- Use `Promise.all()` for independent parallel fetches.

---

## Known Issues and Technical Debt

| Issue | Location | Priority |
|---|---|---|
| Hardcoded API credentials | `lib/intervals.js`, `vercel.json` | High |
| No test coverage | — | Medium |
| No linting/formatting config | — | Low |
| Axios imported but unused | `lib/intervals.js` | Low |
| Props drilling in `index.js` | `pages/index.js` | Low |
| Future TSS projections are hardcoded | `pages/api/dashboard.js` | Low |

---

## Planned Features (Phase 2)

- **AI Coach Chat** — Claude API integration for natural language training advice. Will require a `CLAUDE_API_KEY` environment variable and a new `/api/chat` endpoint.

---

## Security Notes

- **Never commit API keys.** Use `.env.local` locally and Vercel environment variables in production.
- The existing hardcoded credentials in `vercel.json` and `lib/intervals.js` should be migrated to `process.env.INTERVALS_ATHLETE_ID` and `process.env.INTERVALS_API_KEY` before adding any new credentials.
- The application has no authentication layer — it is intended for single-user personal use behind Vercel's default HTTPS.
