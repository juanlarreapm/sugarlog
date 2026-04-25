# Sugarlog

A pediatric Type 1 Diabetes logging companion app. Track blood sugar readings, insulin doses (basal/bolus), injection sites, and CGM drift — all in a warm, friendly mobile-first interface.

## Features

- **Blood sugar logging** — finger-stick and CGM readings with a custom number pad
- **Insulin tracking** — basal and bolus doses with a body map for injection site rotation
- **Today view** — daily stats, sparkline chart, and timeline of all entries
- **History** — entries grouped by day with scrollable archive
- **CGM drift tracker** — paired dot and dual-line charts comparing meter vs CGM over time
- **Import/Export** — paste-to-import flow, CSV/PDF export with date range selection
- **Cloud sync** — optional Supabase backend for auth and persistence, with localStorage fallback

## Quick Start

Open `index.html` in a browser. No build step, no dependencies to install.

The app works immediately with mock data and localStorage. For cloud persistence, see [SETUP.md](SETUP.md).

## Architecture

The app runs entirely client-side using React 18 + Babel (in-browser transpilation) and Supabase JS SDK loaded from CDNs.

```
index.html              Entry point — loads React, Babel, Supabase SDK, fonts
js/
  supabase.jsx          Supabase client, auth helpers, data layer
  data.jsx              Mock seed data (3 days of entries)
  theme.jsx             Design tokens, oklch palettes, buildTheme()
  icons.jsx             SVG icon components
  shared.jsx            UI primitives (Card, Btn, StatusPill, etc.)
  body-map.jsx          Body silhouette with injection site picker
  forms.jsx             Blood sugar form + Insulin form
  screens-entry.jsx     Quick entry hub
  screens-today.jsx     Today view (stats, sparkline, timeline)
  screens-history.jsx   History grouped by day
  screens-drift.jsx     CGM drift tracker (paired dots + dual line charts)
  screens-export.jsx    Export view (date range, PDF/CSV)
  import-flow.jsx       3-step import (paste, parse, review)
  app.jsx               Main app shell (state, navigation, tab bar, modals)
```

## Data Flow

- **Without Supabase**: entries stored in localStorage, seeded with mock data on first load
- **With Supabase**: auth on mount → login screen if needed → load from cloud → optimistic UI updates → background writes → localStorage as offline fallback

## Design

- **Fonts**: Nunito (UI), JetBrains Mono (numbers)
- **Colors**: oklch-based teal palette with warm off-white background
- **Glucose range**: pediatric default 70–150 mg/dL
- **Status colors**: green (in range), amber (borderline), rose (high/low)
- **Responsive**: mobile-first with tablet and desktop max-width constraints

## Deployment

Deploys automatically to GitHub Pages on push to `main` via GitHub Actions.

## License

Private project.
