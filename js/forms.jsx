// forms.jsx — Blood sugar form + Insulin form

function BgForm({ theme, onSave, onCancel }) {
  const [bg, setBg] = React.useState('');
  const [cgm, setCgm] = React.useState('');
  const [ts, setTs] = React.useState(new Date().toISOString());
  const [note, setNote] = React.useState('');

  const hasBg = bg !== '';
  const hasCgm = cgm !== '';
  const canSave = hasBg || hasCgm;
  const statusValue = hasBg ? Number(bg) : (hasCgm ? Number(cgm) : null);
  const status = statusValue != null ? classifyBg(statusValue, theme) : null;

  const Pad = ({ onPress }) => {
    const keys = ['1','2','3','4','5','6','7','8','9','.', '0', '\u232B'];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {keys.map(k => (
          <button key={k} onClick={() => onPress(k)} style={{
            height: 48, border: 0,
            background: theme.raised, color: theme.ink,
            borderRadius: theme.radius.md,
            fontFamily: theme.numFont, fontSize: 22, fontWeight: 600,
            cursor: 'pointer',
          }}>{k}</button>
        ))}
      </div>
    );
  };

  const [field, setField] = React.useState('bg');
  const press = (k) => {
    const set = field === 'bg' ? setBg : setCgm;
    const cur = field === 'bg' ? bg : cgm;
    if (k === '\u232B') set(cur.slice(0, -1));
    else if (k === '.' && cur.includes('.')) return;
    else if (cur.length < 5) set(cur + k);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 16px 24px', height: '100%' }}>
      <Card theme={theme} padding={20}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: theme.inkMute,
            letterSpacing: 0.6, textTransform: 'uppercase',
          }}>
            Glucometer
          </div>
          {status && <StatusPill status={status} theme={theme} size="sm"/>}
        </div>
        <button onClick={() => setField('bg')} style={{
          background: 'transparent', border: 0, padding: 0, textAlign: 'left',
          width: '100%', cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6,
            borderBottom: field === 'bg' ? `2px solid ${theme.primary}` : `2px solid transparent`,
            paddingBottom: 4,
          }}>
            <span style={{
              fontFamily: theme.numFont, fontWeight: 700, fontSize: 56,
              color: bg ? (status ? theme.status[status].fg : theme.ink) : theme.inkMute,
              letterSpacing: -1, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{bg || '\u2014'}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: theme.inkMute }}>mg/dL</span>
          </div>
        </button>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${theme.line}` }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: theme.inkMute,
            letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
          }}>
            CGM at this moment <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: theme.inkMute }}>&middot; optional</span>
          </div>
          <button onClick={() => setField('cgm')} style={{
            background: 'transparent', border: 0, padding: 0, textAlign: 'left',
            width: '100%', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6,
              borderBottom: field === 'cgm' ? `2px solid ${theme.primary}` : `2px solid transparent`,
              paddingBottom: 4,
            }}>
              <span style={{
                fontFamily: theme.numFont, fontWeight: 600, fontSize: 32,
                color: cgm ? theme.ink : theme.inkMute,
                letterSpacing: -0.5, lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>{cgm || '\u2014'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.inkMute }}>mg/dL</span>
              {bg && cgm && (
                <span style={{
                  marginLeft: 'auto', fontSize: 12, fontWeight: 700,
                  color: theme.inkDim, fontFamily: theme.numFont,
                }}>
                  \u0394 {Number(cgm) - Number(bg) > 0 ? '+' : ''}{Number(cgm) - Number(bg)}
                </span>
              )}
            </div>
          </button>
        </div>
      </Card>

      <TimeRow ts={ts} setTs={setTs} theme={theme}/>

      <Pad onPress={press}/>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <Btn variant="ghost" theme={theme} onClick={onCancel} style={{ flex: 1 }}>Cancel</Btn>
        <Btn variant="primary" theme={theme} size="lg" full
             onClick={() => canSave && onSave({ kind: 'glucose', ts, bg: hasBg ? Number(bg) : null, cgm: hasCgm ? Number(cgm) : null, note })}
             style={{ flex: 2, opacity: canSave ? 1 : 0.4 }}>
          <Ic.check width="18" height="18"/> Save
        </Btn>
      </div>
    </div>
  );
}

function TimeRow({ ts, setTs, theme }) {
  const inputRef = React.useRef(null);
  const d = new Date(ts);
  const isNow = (Date.now() - d.getTime()) < 60_000;

  const toLocalInput = (iso) => {
    const dt = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const handlePickerChange = (e) => {
    if (e.target.value) setTs(new Date(e.target.value).toISOString());
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: theme.raised, padding: '10px 14px',
      borderRadius: theme.radius.md, position: 'relative',
    }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: theme.radius.sm,
          background: theme.surface, color: theme.inkDim,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ic.calendar width="16" height="16"/>
        </div>
        <div style={{ flex: 1, padding: 0, textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            When
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums' }}>
            {isNow ? 'Just now' : `${fmtDay(ts)} \u00B7 ${fmtTime(ts)}`}
          </div>
        </div>
        <input ref={inputRef} type="datetime-local" value={toLocalInput(ts)}
          onChange={handlePickerChange}
          style={{
            position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0,
            overflow: 'hidden', clip: 'rect(0,0,0,0)',
          }}
        />
      </label>
      <button onClick={() => setTs(new Date().toISOString())} style={{
        position: 'relative', zIndex: 1,
        background: 'transparent', border: 0, fontSize: 13, fontWeight: 700,
        color: theme.primary, cursor: 'pointer', fontFamily: theme.uiFont,
      }}>Now</button>
    </div>
  );
}

function InsulinForm({ theme, onSave, onCancel }) {
  const [type, setType] = React.useState('bolus');
  const [units, setUnits] = React.useState('');
  const [site, setSite] = React.useState('abdomen-L');
  const [bodySide, setBodySide] = React.useState('front');
  const [meal, setMeal] = React.useState('pre');
  const [ts, setTs] = React.useState(new Date().toISOString());

  const Seg = ({ value, options, onChange }) => (
    <div style={{
      display: 'flex', padding: 3, background: theme.raised,
      borderRadius: theme.radius.md, gap: 2,
    }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, height: 38, border: 0, cursor: 'pointer',
          background: value === o.value ? theme.surface : 'transparent',
          color: value === o.value ? theme.ink : theme.inkMute,
          borderRadius: theme.radius.sm,
          fontFamily: theme.uiFont, fontWeight: 700, fontSize: 14,
          boxShadow: value === o.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          letterSpacing: -0.1,
        }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 16px 24px' }}>
      <Seg value={type} onChange={setType} options={[
        { value: 'basal', label: 'Basal' },
        { value: 'bolus', label: 'Bolus' },
      ]}/>

      <Card theme={theme} padding={18}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: theme.inkMute,
          letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
        }}>
          Units
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setUnits(String(Math.max(0, (Number(units) || 0) - 0.5)))} style={{
            width: 44, height: 44, borderRadius: theme.radius.md, border: 0,
            background: theme.raised, color: theme.ink, fontSize: 24, cursor: 'pointer',
            fontWeight: 600,
          }}>{'\u2212'}</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{
              fontFamily: theme.numFont, fontWeight: 700, fontSize: 56,
              color: units ? theme.ink : theme.inkMute,
              letterSpacing: -1, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{units || '0'}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: theme.inkMute, marginLeft: 4 }}>u</span>
          </div>
          <button onClick={() => setUnits(String((Number(units) || 0) + 0.5))} style={{
            width: 44, height: 44, borderRadius: theme.radius.md, border: 0,
            background: theme.primarySoft, color: theme.primaryInk, fontSize: 24, cursor: 'pointer',
            fontWeight: 600,
          }}>+</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center' }}>
          {[0.5, 1, 2, 5].map(d => (
            <button key={d} onClick={() => setUnits(String((Number(units) || 0) + d))} style={{
              padding: '4px 10px', borderRadius: 999, border: `0.5px solid ${theme.line}`,
              background: 'transparent', color: theme.inkDim, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: theme.numFont,
            }}>+{d}</button>
          ))}
        </div>
      </Card>

      <Card theme={theme} padding={16}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: theme.inkMute,
          letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
        }}>
          Injection site
        </div>
        <BodyMap value={site} onChange={setSite} theme={theme} side={bodySide} onSideChange={setBodySide}/>
      </Card>

      {type === 'bolus' && (
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: theme.inkMute,
            letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6, padding: '0 4px',
          }}>
            Meal context
          </div>
          <Seg value={meal} onChange={setMeal} options={[
            { value: 'pre', label: 'Pre' },
            { value: 'during', label: 'During' },
            { value: 'post', label: 'Post' },
          ]}/>
        </div>
      )}

      <TimeRow ts={ts} setTs={setTs} theme={theme}/>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Btn variant="ghost" theme={theme} onClick={onCancel} style={{ flex: 1 }}>Cancel</Btn>
        <Btn variant="primary" theme={theme} size="lg" full
             onClick={() => Number(units) > 0 && onSave({
               kind: 'insulin', ts, insulinType: type,
               units: Number(units), site,
               mealContext: type === 'bolus' ? meal : null,
             })}
             style={{ flex: 2, opacity: Number(units) > 0 ? 1 : 0.4 }}>
          <Ic.check width="18" height="18"/> Save
        </Btn>
      </div>
    </div>
  );
}

window.BgForm = BgForm;
window.InsulinForm = InsulinForm;
