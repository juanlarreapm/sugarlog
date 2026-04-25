// body-map.jsx — front/back body map for injection site picker.

const SITES = {
  'arm-L':       { label: 'Left arm', side: 'front', x: 20, y: 38, r: 11 },
  'arm-R':       { label: 'Right arm', side: 'front', x: 80, y: 38, r: 11 },
  'abdomen-L':   { label: 'Abdomen left', side: 'front', x: 41, y: 53, r: 10 },
  'abdomen-R':   { label: 'Abdomen right', side: 'front', x: 59, y: 53, r: 10 },
  'thigh-L':     { label: 'Left thigh', side: 'front', x: 41, y: 78, r: 11 },
  'thigh-R':     { label: 'Right thigh', side: 'front', x: 59, y: 78, r: 11 },
  'buttock':     { label: 'Upper buttock', side: 'back',  x: 50, y: 56, r: 12 },
};

window.SITES = SITES;

function siteLabel(id) { return SITES[id]?.label || id; }
window.siteLabel = siteLabel;

function BodyMap({ value, onChange, theme, side: sideProp = 'front', onSideChange }) {
  const side = sideProp;

  const skin = theme.dark ? 'oklch(0.32 0.015 50)' : 'oklch(0.95 0.015 60)';
  const stroke = theme.dark ? 'oklch(0.45 0.015 50)' : 'oklch(0.84 0.015 60)';
  const dot = theme.inkMute;
  const active = theme.primary;
  const activeBg = theme.primarySoft;

  const frontPath = `
    M50 4 q6 0 7 7 q1 6 -2 11
    q4 1 5 4 q1 3 0 6
    q9 2 14 8 q3 4 4 11
    q1 6 -1 9 q-2 2 -3 -1
    l -2 -8
    l -1 13
    q1 7 1 18
    q0 7 -1 14
    q-1 5 -3 5 q-2 0 -3 -4
    q-1 -10 -2 -16
    l -1 4
    q-1 7 -1 16
    q0 13 -1 19
    q-1 5 -3 5 q-2 0 -3 -5
    q-1 -7 -1 -16
    l -1 -10
    l -1 10
    q0 9 -1 16
    q-1 5 -3 5 q-2 0 -3 -5
    q-1 -6 -1 -19
    q0 -9 -1 -16
    l -1 -4
    q-1 6 -2 16
    q-1 4 -3 4 q-2 0 -3 -5
    q-1 -7 -1 -14
    q0 -11 1 -18
    l -1 -13 l -2 8
    q-1 3 -3 1 q-2 -3 -1 -9
    q1 -7 4 -11 q5 -6 14 -8
    q-1 -3 0 -6 q1 -3 5 -4
    q-3 -5 -2 -11 q1 -7 7 -7 z
  `;

  const backPath = `
    M50 4 q6 0 7 7 q1 6 -2 11
    q4 1 5 4 q1 3 0 6
    q9 2 14 8 q3 4 4 11
    q1 6 -1 9 q-2 2 -3 -1
    l -2 -8
    l -1 13
    q1 7 1 18
    q0 7 -1 14
    q-1 5 -3 5 q-2 0 -3 -4
    q-1 -10 -2 -16
    l -1 4
    q-1 7 -1 16
    q0 13 -1 19
    q-1 5 -3 5 q-2 0 -3 -5
    q-1 -7 -1 -16
    l -1 -10
    l -1 10
    q0 9 -1 16
    q-1 5 -3 5 q-2 0 -3 -5
    q-1 -6 -1 -19
    q0 -9 -1 -16
    l -1 -4
    q-1 6 -2 16
    q-1 4 -3 4 q-2 0 -3 -5
    q-1 -7 -1 -14
    q0 -11 1 -18
    l -1 -13 l -2 8
    q-1 3 -3 1 q-2 -3 -1 -9
    q1 -7 4 -11 q5 -6 14 -8
    q-1 -3 0 -6 q1 -3 5 -4
    q-3 -5 -2 -11 q1 -7 7 -7 z
  `;

  const visibleSites = Object.entries(SITES).filter(([_, s]) => s.side === side);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <div style={{
        display: 'inline-flex', padding: 3,
        background: theme.raised, borderRadius: 999,
        fontSize: 13, fontWeight: 600, color: theme.inkDim,
      }}>
        {['front', 'back'].map(s => (
          <button key={s}
            onClick={() => onSideChange(s)}
            style={{
              padding: '6px 16px', border: 0, borderRadius: 999, cursor: 'pointer',
              background: side === s ? theme.surface : 'transparent',
              color: side === s ? theme.ink : theme.inkMute,
              boxShadow: side === s ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}>{s}</button>
        ))}
      </div>

      <svg viewBox="0 0 100 110" style={{ width: 200, height: 220 }}>
        <path d={side === 'front' ? frontPath : backPath}
              fill={skin} stroke={stroke} strokeWidth="0.6" strokeLinejoin="round"/>

        {visibleSites.map(([id, s]) => {
          const sel = value === id;
          return (
            <g key={id} style={{ cursor: 'pointer' }} onClick={() => onChange(id)}>
              {sel && (
                <circle cx={s.x} cy={s.y} r={s.r * 0.9}
                        fill={activeBg} opacity={0.85}/>
              )}
              <circle cx={s.x} cy={s.y} r={sel ? 3.4 : 2.2}
                      fill={sel ? active : 'transparent'}
                      stroke={sel ? active : dot}
                      strokeWidth={sel ? 0 : 1.2}/>
              <circle cx={s.x} cy={s.y} r={s.r}
                      fill="transparent"/>
            </g>
          );
        })}

        {side === 'front' && (
          <>
            <circle cx="46" cy="11" r="0.7" fill={stroke}/>
            <circle cx="54" cy="11" r="0.7" fill={stroke}/>
            <path d="M47 15 q3 1 6 0" stroke={stroke} strokeWidth="0.5" fill="none" strokeLinecap="round"/>
          </>
        )}
      </svg>

      <div style={{
        fontSize: 14, fontWeight: 600, color: theme.ink,
        minHeight: 20,
      }}>
        {value ? SITES[value].label : <span style={{ color: theme.inkMute, fontWeight: 500 }}>Tap a site</span>}
      </div>
    </div>
  );
}

window.BodyMap = BodyMap;
