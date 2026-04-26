# Sugarlog

Pediatric Type 1 Diabetes logging companion app — mobile-first, warm UI.

## Architecture

**No build step.** The app is a single `index.html` that loads React 18, Babel, and Supabase JS SDK from CDNs. JSX files in `js/` are transpiled in-browser by Babel.

- **No ES modules** — all components and helpers are global functions attached to `window` (or just top-level declarations that Babel makes global).
- **No npm/node_modules** — there is no `package.json`. Don't try to install or import packages.
- **Inline styles only** — no CSS framework, no CSS files beyond the minimal `<style>` block in `index.html`. All styling uses React inline style objects.
- **Theme object** — `buildTheme()` in `theme.jsx` produces a theme object that gets passed as a prop through the component tree. Colors use oklch.

## File structure

```
index.html              Entry point — loads CDN scripts, mounts <App/>
js/
  supabase.jsx          Supabase client, auth, data layer (uses `sbClient` internally)
  data.jsx              Mock seed data
  theme.jsx             Design tokens, oklch palettes, buildTheme()
  icons.jsx             SVG icon components
  shared.jsx            UI primitives (Card, Btn, StatusPill) + date formatters
  body-map.jsx          Body silhouette for injection site rotation
  forms.jsx             Blood sugar form (number pad) + Insulin form (stepper, body map)
  onboarding.jsx        3-step onboarding wizard (patient info, glucose targets, insulin)
  profile.jsx           Profile/settings screen
  screens-entry.jsx     Quick entry hub
  screens-today.jsx     Today view (stats, sparkline, timeline)
  screens-history.jsx   History grouped by day
  screens-drift.jsx     CGM drift tracker
  screens-export.jsx    Export view (date range, PDF/CSV)
  import-flow.jsx       3-step import (paste, parse, review)
  app.jsx               Main shell — state, navigation, tab bar, modals
```

Script load order in `index.html` matters — files loaded later can reference globals from earlier files.

## Conventions

- **Components**: PascalCase function declarations (`function QuickEntry(...)`)
- **Files**: kebab-case (`screens-entry.jsx`)
- **State**: React.useState / React.useEffect (no hooks imports — React is global via CDN)
- **Props**: `theme` is threaded everywhere. `profile` carries user settings (name, range, insulin config).
- **IDs**: entries use `'e-' + Math.random().toString(36).slice(2, 9)`

## Data flow

- **Without Supabase**: entries in localStorage, seeded with `MOCK_ENTRIES` on first load.
- **With Supabase**: auth check -> load profile -> load entries -> optimistic UI -> background writes -> localStorage fallback.
- Supabase credentials live in `js/supabase.jsx`. The `supabaseConfigured` flag gates all cloud features.
- Two tables: `entries` (blood sugar/insulin logs) and `profiles` (patient settings). Both have RLS scoped to `auth.uid()`.

## Key patterns

- `classifyBg(value, theme)` returns a status string (`'low'`, `'ok'`, `'high'`) based on `theme.rangeLow`/`theme.rangeHigh`.
- `localDB.load()` / `localDB.save()` handle localStorage persistence.
- `db.rowToEntry()` and `db.profileToApp()` convert between Supabase snake_case and app camelCase.

## Mobile considerations

- This is a mobile-first app. Date/time pickers must work on mobile — use `<label>` wrapping instead of overlay patterns or `showPicker()`. See memory for details.
- Safe area insets are handled via `env(safe-area-inset-*)`.
- Touch targets should be at minimum 44px.

## Deployment

Push to `main` triggers GitHub Actions deploy to GitHub Pages (`.github/workflows/pages.yml`).

## MCP Servers

`.mcp.json` configures a Supabase MCP server that provides direct database query/update tools. If Supabase tools aren't appearing, the user may need to restart Claude Code for the MCP connection to initialize.

## Testing

No test framework. Verify changes by opening `index.html` in a browser. For Supabase features, you need a configured project (see `SETUP.md`).
