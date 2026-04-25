# Onboarding Flow Plan

## Context
The app currently hardcodes patient-specific values: name "Maya" in `screens-entry.jsx:71`, glucose range 70–150 in `app.jsx:8-9` (`THEME_CONFIG`), and avatar initial 'M' in `app.jsx:98`. After signup, users go straight to the main app with no way to configure their clinical settings. We need a multi-step onboarding wizard that collects patient info, glucose targets, and insulin settings on first login — stored in a Supabase `profiles` table.

## Approach
- New `profiles` table in Supabase with RLS
- New `js/onboarding.jsx` file with a 3-step wizard component
- Profile data helpers added to `js/supabase.jsx`
- `app.jsx` gates on profile existence: no profile → show onboarding, has profile → show app
- Profile values replace all hardcoded patient data throughout the app

## Supabase: `profiles` table

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  patient_name text not null,
  patient_age integer,
  diagnosis_date date,
  diabetes_type text not null default 'T1D',  -- 'T1D' | 'T2D' | 'gestational' | 'other'
  range_low integer not null default 70,
  range_high integer not null default 150,
  unit text not null default 'mg/dL',          -- 'mg/dL' | 'mmol/L'
  carb_ratio_breakfast numeric,
  carb_ratio_lunch numeric,
  carb_ratio_dinner numeric,
  correction_factor numeric,
  long_acting_dose numeric,
  long_acting_time text,                       -- e.g. '08:00', '22:00'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users access own profile" on profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);
```

## Files to modify

### 1. `js/supabase.jsx` — add profile helpers
Add to the `db` object:
- `db.loadProfile()` — `select * from profiles where id = user.id`, returns single row or null
- `db.saveProfile(profile)` — `upsert` into profiles (insert on first save, update on edits)
- `db.profileToApp(row)` — snake_case → camelCase converter

### 2. `js/onboarding.jsx` — NEW file, 3-step wizard

**Step 1: Patient Info**
- Patient name (text input, required)
- Age (number input)
- Date of diagnosis (date input)
- Diabetes type (segmented control: T1D / T2D / Gestational / Other)

**Step 2: Glucose Targets**
- Target range low (number input, default 70)
- Target range high (number input, default 150)
- Unit toggle (mg/dL or mmol/L segmented control)

**Step 3: Insulin Settings**
- Carb ratios by meal (3 number inputs: breakfast / lunch / dinner, e.g. "1u per X g")
- Correction factor (number input, e.g. "1u drops BG by X mg/dL")
- Long-acting dose (number input)
- Long-acting time (time-of-day, e.g. "8:00 AM" / "10:00 PM")

**UI details:**
- Progress indicator (3 dots or "Step 1 of 3" like the import flow)
- Back/Next navigation buttons
- Step 3 fields are all optional (can skip with "Get started")
- Styled with existing primitives: `Card`, `Btn`, `SugarlogMark`, theme colors
- Warm welcome header on step 1: "Welcome to Sugarlog" + Sugarlog mark

### 3. `js/app.jsx` — gate on profile, use profile values

**State changes:**
- Add `const [profile, setProfile] = React.useState(null)`
- Add `const [profileChecked, setProfileChecked] = React.useState(false)`
- On user login: call `db.loadProfile()` → if null, show onboarding; if exists, set profile
- After onboarding completes: call `db.saveProfile()`, set profile state

**Rendering logic** (after auth check):
```
user exists + profileChecked + no profile → <OnboardingFlow>
user exists + profile exists → <App> (main app)
```

**Replace hardcoded values:**
- `THEME_CONFIG.rangeLow/rangeHigh` → `profile.rangeLow/rangeHigh`
- `buildTheme()` called with profile range values instead of hardcoded 70/150
- Header avatar initial → `profile.patientName[0]` instead of email initial

### 4. `js/screens-entry.jsx` — dynamic patient name
- Line 71: `"Log for Maya"` → `"Log for {profile.patientName}"`
- Pass `profile` prop from App through to QuickEntry

### 5. `index.html` — add script tag
- Add `<script type="text/babel" src="js/onboarding.jsx"></script>` before `app.jsx`

### 6. `SETUP.md` — add profiles SQL
- Add the `create table profiles` SQL to the Supabase setup section

## Data flow

```
Auth check → user exists?
  ↓ YES
Load profile → profile exists?
  ↓ NO                    ↓ YES
Show OnboardingFlow     Build theme with profile.rangeLow/High
  ↓                     Show main App
User completes 3 steps    (profile.patientName in greeting,
  ↓                        profile values throughout)
db.saveProfile()
  ↓
Set profile state → show main App
```

## Verification
1. Clear Supabase data / use new account → should see onboarding after login
2. Step 1: enter name, age, diagnosis date, diabetes type → Next
3. Step 2: adjust range low/high, pick unit → Next
4. Step 3: optionally enter carb ratios, correction, basal → Get started
5. Main app loads with patient name in greeting, custom range in sparkline/classifyBg
6. Reload page → profile loads from Supabase, no onboarding shown
7. Check Supabase `profiles` table to confirm data stored
