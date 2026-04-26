# Sugarlog

A pediatric Type 1 Diabetes logging companion app. Track blood sugar readings, insulin doses (basal/bolus), injection sites, and CGM drift — all in a warm, friendly iOS-style interface.

## Quick Start

Just open `index.html` in a browser. No build step needed.

The app works out of the box with mock data and localStorage. For cloud persistence, set up Supabase (see below).

## Supabase Setup (Optional — for cloud persistence + auth)

### 1. Create a free project

Go to [supabase.com](https://supabase.com), create a new project.

### 2. Create the `entries` table

In the Supabase SQL Editor, run:

```sql
create table entries (
  id text primary key,
  user_id uuid not null references auth.users(id),
  kind text not null,
  ts timestamptz not null,
  bg numeric,
  cgm numeric,
  note text,
  insulin_type text,
  units numeric,
  site text,
  meal_context text,
  created_at timestamptz default now()
);

alter table entries enable row level security;

create policy "Users access own entries" on entries
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 3b. Create the `profiles` table

In the Supabase SQL Editor, run:

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  patient_name text not null,
  patient_age integer,
  diagnosis_date date,
  diabetes_type text not null default 'T1D',
  range_low integer not null default 70,
  range_high integer not null default 150,
  unit text not null default 'mg/dL',
  carb_ratios jsonb,
  correction_factor numeric,
  long_acting_dose numeric,
  long_acting_time text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users access own profile" on profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);
```

### 3c. Add your credentials

Open `js/supabase.jsx` and replace the placeholder values:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Find these in your Supabase dashboard under **Settings > API**.

### 4. Create your account

Open the app in a browser. You'll see a login screen — click "Sign up" to create your account.

## Architecture

```
index.html          — Entry point (loads React, Babel, Supabase SDK, fonts)
js/
  supabase.jsx      — Supabase client, auth helpers, data layer
  ios-frame.jsx     — iOS device frame + status bar
  data.jsx          — Mock seed data (3 days of entries)
  theme.jsx         — Design tokens, palettes, buildTheme()
  icons.jsx         — SVG icon components
  shared.jsx        — Utilities + UI primitives (Card, Btn, StatusPill, etc.)
  body-map.jsx      — Body silhouette with injection site picker
  forms.jsx         — Blood sugar form (number pad, CGM) + Insulin form (stepper, body map)
  screens-entry.jsx — Quick entry hub
  screens-today.jsx — Today view (stats, sparkline, timeline)
  screens-history.jsx — History grouped by day
  screens-drift.jsx — CGM drift tracker (paired dots + dual line charts)
  screens-export.jsx — Export view (date range, PDF/CSV)
  import-flow.jsx   — 3-step import (paste, parse, review)
  app.jsx           — Main app shell (state, navigation, tab bar, modals)
```

## Data Flow

1. **Without Supabase**: entries stored in localStorage, seeded with mock data on first load
2. **With Supabase**: auth check on mount -> login screen if needed -> load entries from Supabase -> optimistic UI updates -> background Supabase writes -> localStorage as offline fallback

## Design

- **iOS frame**: 390x844, Dynamic Island, status bar
- **Fonts**: Nunito (UI), JetBrains Mono (numbers)
- **Colors**: oklch-based teal palette with warm off-white background
- **Glucose range**: pediatric default 70-150 mg/dL
- **Status colors**: green (in range), amber (borderline), rose (high/low)
