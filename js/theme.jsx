// theme.jsx — tokens, palettes, helpers

const ACCENT_PALETTES = {
  teal: {
    primary: 'oklch(0.62 0.06 195)',
    primarySoft: 'oklch(0.92 0.03 195)',
    primaryInk: 'oklch(0.32 0.05 195)',
    primaryGlow: 'oklch(0.78 0.07 195)',
  },
  coral: {
    primary: 'oklch(0.70 0.13 35)',
    primarySoft: 'oklch(0.93 0.04 35)',
    primaryInk: 'oklch(0.40 0.10 35)',
    primaryGlow: 'oklch(0.82 0.10 35)',
  },
  sage: {
    primary: 'oklch(0.65 0.07 145)',
    primarySoft: 'oklch(0.93 0.03 145)',
    primaryInk: 'oklch(0.36 0.06 145)',
    primaryGlow: 'oklch(0.80 0.08 145)',
  },
};

const RADIUS_SCALES = {
  soft:   { sm: 10, md: 14, lg: 20, xl: 28, pill: 9999 },
  softer: { sm: 14, md: 18, lg: 26, xl: 34, pill: 9999 },
  pill:   { sm: 18, md: 24, lg: 9999, xl: 9999, pill: 9999 },
};

const DENSITY = {
  cozy:    { padY: 16, gap: 14, rowH: 64,  hPad: 20, headPadY: 22 },
  compact: { padY: 10, gap: 8,  rowH: 52,  hPad: 16, headPadY: 14 },
};

const NUM_FONT = {
  rounded: '"Nunito", -apple-system, system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

function buildTheme(t) {
  const accent = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES.teal;
  const radius = RADIUS_SCALES[t.radius] || RADIUS_SCALES.softer;
  const density = DENSITY[t.density] || DENSITY.cozy;
  const dark = !!t.dark;

  const surfaces = dark ? {
    bg:      'oklch(0.20 0.01 70)',
    surface: 'oklch(0.25 0.01 70)',
    raised:  'oklch(0.30 0.01 70)',
    line:    'oklch(0.35 0.01 70)',
    ink:     'oklch(0.96 0.005 75)',
    inkDim:  'oklch(0.78 0.01 70)',
    inkMute: 'oklch(0.58 0.01 70)',
  } : {
    bg:      'oklch(0.985 0.005 75)',
    surface: '#ffffff',
    raised:  'oklch(0.97 0.008 75)',
    line:    'oklch(0.92 0.008 75)',
    ink:     'oklch(0.22 0.015 60)',
    inkDim:  'oklch(0.42 0.012 60)',
    inkMute: 'oklch(0.62 0.01 60)',
  };

  const status = {
    inRange:    { fg: dark ? 'oklch(0.78 0.10 145)' : 'oklch(0.50 0.10 145)',
                  bg: dark ? 'oklch(0.32 0.04 145)' : 'oklch(0.94 0.04 145)' },
    borderline: { fg: dark ? 'oklch(0.82 0.13 75)'  : 'oklch(0.58 0.12 65)',
                  bg: dark ? 'oklch(0.32 0.05 75)'  : 'oklch(0.94 0.06 75)' },
    out:        { fg: dark ? 'oklch(0.78 0.13 25)'  : 'oklch(0.55 0.15 25)',
                  bg: dark ? 'oklch(0.32 0.06 25)'  : 'oklch(0.94 0.05 25)' },
    low:        { fg: dark ? 'oklch(0.78 0.13 25)'  : 'oklch(0.55 0.15 25)',
                  bg: dark ? 'oklch(0.32 0.06 25)'  : 'oklch(0.94 0.05 25)' },
  };

  return {
    ...accent,
    ...surfaces,
    radius,
    density,
    status,
    dark,
    numFont: NUM_FONT[t.numFont] || NUM_FONT.rounded,
    uiFont: '"Nunito", -apple-system, system-ui, sans-serif',
    rangeLow: t.rangeLow,
    rangeHigh: t.rangeHigh,
  };
}

function classifyBg(bg, theme) {
  if (bg < 70) return 'low';
  if (bg <= theme.rangeHigh) return bg >= theme.rangeLow ? 'inRange' : 'borderline';
  if (bg <= theme.rangeHigh + 30) return 'borderline';
  return 'out';
}

function statusLabel(s) {
  return { inRange: 'In range', borderline: 'Borderline', out: 'High', low: 'Low' }[s] || s;
}

function entryBg(entry) {
  return entry.bg ?? entry.cgm;
}

window.buildTheme = buildTheme;
window.classifyBg = classifyBg;
window.statusLabel = statusLabel;
window.entryBg = entryBg;
window.ACCENT_PALETTES = ACCENT_PALETTES;
