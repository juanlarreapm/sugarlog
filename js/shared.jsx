// shared.jsx — small UI primitives shared across screens

const fmtTime = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
};

const fmtDay = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const ymd = (x) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  if (ymd(d) === ymd(today)) return 'Today';
  const y = new Date(today); y.setDate(y.getDate() - 1);
  if (ymd(d) === ymd(y)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

const fmtDayShort = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const dayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

window.fmtTime = fmtTime;
window.fmtDay = fmtDay;
window.fmtDayShort = fmtDayShort;
window.dayKey = dayKey;

function StatusPill({ status, theme, size = 'md' }) {
  const s = theme.status[status];
  const py = size === 'sm' ? 2 : 4;
  const px = size === 'sm' ? 7 : 10;
  const fs = size === 'sm' ? 10.5 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: `${py}px ${px}px`, borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: fs, fontWeight: 700, letterSpacing: 0.1,
      fontFamily: theme.uiFont,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: s.fg,
      }}/>
      {statusLabel(status)}
    </span>
  );
}

function BigNumber({ value, unit, status, theme, size = 36 }) {
  const color = status ? theme.status[status].fg : theme.ink;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{
        fontFamily: theme.numFont, fontWeight: 700, fontSize: size,
        color, letterSpacing: -0.5, lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      {unit && (
        <span style={{
          fontSize: size * 0.32, fontWeight: 600, color: theme.inkMute,
          letterSpacing: 0,
        }}>{unit}</span>
      )}
    </div>
  );
}

function Card({ children, theme, style = {}, padding = 16, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        background: theme.surface, borderRadius: theme.radius.lg,
        padding, boxShadow: theme.dark
          ? '0 1px 0 rgba(255,255,255,0.04) inset'
          : '0 1px 0 rgba(255,255,255,0.7) inset, 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03)',
        border: theme.dark ? `0.5px solid ${theme.line}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>{children}</div>
  );
}

function SectionHead({ title, action, theme }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 4px',
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: 0.6,
        color: theme.inkMute, textTransform: 'uppercase',
      }}>{title}</div>
      {action}
    </div>
  );
}

function SugarlogMark({ theme, size = 22 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3.5c-3 4-6 7.2-6 11a6 6 0 0012 0c0-3.8-3-7-6-11z"
              fill={theme.primarySoft} stroke={theme.primary} strokeWidth="1.6" strokeLinejoin="round"/>
        <circle cx="10" cy="13" r="1.4" fill={theme.primary}/>
      </svg>
      <span style={{
        fontFamily: theme.uiFont, fontWeight: 800, fontSize: size * 0.82,
        letterSpacing: -0.3, color: theme.ink,
      }}>Sugarlog</span>
    </span>
  );
}

function Btn({ children, onClick, variant = 'primary', theme, size = 'md', style = {}, full }) {
  const palette = {
    primary: { bg: theme.primary, fg: '#fff' },
    soft:    { bg: theme.primarySoft, fg: theme.primaryInk },
    ghost:   { bg: 'transparent', fg: theme.ink },
    surface: { bg: theme.surface, fg: theme.ink },
  }[variant];
  const sz = size === 'lg'
    ? { h: 56, fs: 17, px: 22, r: theme.radius.lg }
    : size === 'sm'
    ? { h: 32, fs: 13, px: 12, r: theme.radius.sm }
    : { h: 44, fs: 15, px: 18, r: theme.radius.md };
  return (
    <button onClick={onClick} style={{
      height: sz.h, padding: `0 ${sz.px}px`, borderRadius: sz.r,
      background: palette.bg, color: palette.fg, border: 0,
      fontFamily: theme.uiFont, fontWeight: 700, fontSize: sz.fs,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', gap: 8, width: full ? '100%' : 'auto',
      letterSpacing: -0.1,
      ...style,
    }}>{children}</button>
  );
}

window.StatusPill = StatusPill;
window.BigNumber = BigNumber;
window.Card = Card;
window.SectionHead = SectionHead;
window.SugarlogMark = SugarlogMark;
window.Btn = Btn;
