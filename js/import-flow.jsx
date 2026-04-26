// import-flow.jsx — Paste notes -> mocked parse -> review -> confirm

const SAMPLE_NOTES = `Apr 4 morning - 178 (cgm 184), gave 6u basal in left thigh. breakfast bolus 4u in belly.
lunch ~12pm BG 102, 3.5u bolus right arm pre-meal
3pm checked - 156 cgm said 162
dinner 5:45 BG 134, 4.5u bolus abdomen R
bedtime 145 (cgm 150)

Apr 5 \u2014 fasting 165, 6u basal in R thigh. bolus 4u arm L for breakfast.
mid morning low 68!! juice. 30 min later 110.
lunch 118, 3u arm right
ate cookie 3:45 215, post-meal 1.5u abd L
dinner 152, 4u abdomen left
bed 138`;

const MOCK_PARSED = [
  { kind: 'glucose', ts: '2026-04-04T07:00:00', bg: 178, cgm: 184, note: 'morning' },
  { kind: 'insulin', ts: '2026-04-04T07:05:00', insulinType: 'basal', units: 6, site: 'thigh-L' },
  { kind: 'insulin', ts: '2026-04-04T07:30:00', insulinType: 'bolus', units: 4, site: 'abdomen-L', mealContext: 'pre' },
  { kind: 'glucose', ts: '2026-04-04T12:00:00', bg: 102, cgm: null },
  { kind: 'insulin', ts: '2026-04-04T12:00:00', insulinType: 'bolus', units: 3.5, site: 'arm-R', mealContext: 'pre' },
  { kind: 'glucose', ts: '2026-04-04T15:00:00', bg: 156, cgm: 162 },
  { kind: 'glucose', ts: '2026-04-04T17:45:00', bg: 134, cgm: null },
  { kind: 'insulin', ts: '2026-04-04T17:50:00', insulinType: 'bolus', units: 4.5, site: 'abdomen-R', mealContext: 'pre' },
  { kind: 'glucose', ts: '2026-04-04T21:00:00', bg: 145, cgm: 150, note: 'bedtime' },
  { kind: 'glucose', ts: '2026-04-05T07:00:00', bg: 165, cgm: null, note: 'fasting' },
  { kind: 'insulin', ts: '2026-04-05T07:05:00', insulinType: 'basal', units: 6, site: 'thigh-R' },
  { kind: 'insulin', ts: '2026-04-05T07:30:00', insulinType: 'bolus', units: 4, site: 'arm-L', mealContext: 'pre' },
  { kind: 'glucose', ts: '2026-04-05T10:30:00', bg: 68, cgm: null, note: 'low \u2014 juice' },
  { kind: 'glucose', ts: '2026-04-05T11:00:00', bg: 110, cgm: null },
  { kind: 'glucose', ts: '2026-04-05T12:00:00', bg: 118, cgm: null },
  { kind: 'insulin', ts: '2026-04-05T12:05:00', insulinType: 'bolus', units: 3, site: 'arm-R', mealContext: 'pre' },
  { kind: 'glucose', ts: '2026-04-05T15:45:00', bg: 215, cgm: null, note: 'cookie' },
  { kind: 'insulin', ts: '2026-04-05T15:50:00', insulinType: 'bolus', units: 1.5, site: 'abdomen-L', mealContext: 'post' },
  { kind: 'glucose', ts: '2026-04-05T18:00:00', bg: 152, cgm: null },
  { kind: 'insulin', ts: '2026-04-05T18:10:00', insulinType: 'bolus', units: 4, site: 'abdomen-L', mealContext: 'pre' },
  { kind: 'glucose', ts: '2026-04-05T21:30:00', bg: 138, cgm: null, note: 'bedtime' },
];

function ImportFlow({ theme, onClose, onConfirm }) {
  const [step, setStep] = React.useState('paste');
  const [text, setText] = React.useState('');
  const [parsed, setParsed] = React.useState([]);
  const [excluded, setExcluded] = React.useState(new Set());

  const startParse = () => {
    setStep('parsing');
    setTimeout(() => {
      setParsed(MOCK_PARSED.map((e, i) => ({ ...e, id: `imp-${i}` })));
      setStep('review');
    }, 1800);
  };

  const toggle = (id) => {
    const next = new Set(excluded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExcluded(next);
  };

  const confirm = () => {
    const final = parsed.filter(e => !excluded.has(e.id));
    onConfirm(final);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px 12px',
      }}>
        <button onClick={onClose} style={{
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          color: theme.ink, display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 15, fontWeight: 600, fontFamily: theme.uiFont,
        }}>
          <Ic.chevL width="20" height="20"/> Back
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {step === 'paste' ? '1 of 3 \u00B7 Paste' : step === 'parsing' ? '2 of 3 \u00B7 Parsing' : '3 of 3 \u00B7 Review'}
        </div>
        <div style={{ width: 60 }}/>
      </div>

      <div style={{ padding: '0 16px', borderBottom: `0.5px solid ${theme.line}`, paddingBottom: 14 }}>
        <div style={{
          fontFamily: theme.uiFont, fontSize: 24, fontWeight: 800,
          color: theme.ink, letterSpacing: -0.5,
        }}>
          {step === 'paste' && 'Import from notes'}
          {step === 'parsing' && 'Reading your notes\u2026'}
          {step === 'review' && `${parsed.length - excluded.size} entries to import`}
        </div>
        <div style={{ fontSize: 13, color: theme.inkDim, marginTop: 4, fontWeight: 500 }}>
          {step === 'paste' && "Paste 3 weeks of logs from any notes app \u2014 we'll parse them."}
          {step === 'parsing' && 'Extracting timestamps, BG readings, and insulin doses.'}
          {step === 'review' && 'Tap any row to exclude it before importing.'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 100px' }}>
        {step === 'paste' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste your notes here\u2026" style={{
                minHeight: 240, padding: 14, fontFamily: theme.numFont,
                fontSize: 13, lineHeight: 1.5, color: theme.ink,
                background: theme.raised, border: `0.5px solid ${theme.line}`,
                borderRadius: theme.radius.lg, resize: 'vertical', outline: 'none',
              }}/>
            <button onClick={() => setText(SAMPLE_NOTES)} style={{
              alignSelf: 'flex-start', background: 'transparent', border: 0,
              color: theme.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: theme.uiFont, padding: 0,
            }}>
              Use sample notes &rarr;
            </button>
          </div>
        )}

        {step === 'parsing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '40px 0', alignItems: 'center' }}>
            <ParsingDots theme={theme}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <ParseStep theme={theme} done>Reading text</ParseStep>
              <ParseStep theme={theme} done>Finding dates and times</ParseStep>
              <ParseStep theme={theme} active>Matching glucose readings</ParseStep>
              <ParseStep theme={theme}>Extracting insulin doses</ParseStep>
              <ParseStep theme={theme}>Inferring injection sites</ParseStep>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {parsed.map(e => {
              const isBG = e.kind === 'glucose';
              const bgVal = isBG ? entryBg(e) : null;
              const status = bgVal != null ? classifyBg(bgVal, theme) : null;
              const ex = excluded.has(e.id);
              return (
                <button key={e.id} onClick={() => toggle(e.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', background: theme.surface,
                  border: 0, borderRadius: theme.radius.md, cursor: 'pointer',
                  textAlign: 'left', opacity: ex ? 0.4 : 1,
                  boxShadow: theme.dark ? `0 0 0 0.5px ${theme.line}` : '0 1px 0 rgba(0,0,0,0.02)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `1.5px solid ${ex ? theme.line : theme.primary}`,
                    background: ex ? 'transparent' : theme.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', flexShrink: 0,
                  }}>
                    {!ex && <Ic.check width="14" height="14"/>}
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: theme.radius.sm,
                    background: isBG ? theme.status[status].bg : theme.primarySoft,
                    color: isBG ? theme.status[status].fg : theme.primaryInk,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isBG ? <Ic.drop width="14" height="14"/> : <Ic.syringe width="14" height="14"/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', gap: 6, alignItems: 'baseline',
                      fontSize: 13, fontWeight: 700, color: theme.ink,
                      fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums',
                    }}>
                      {isBG ? `${e.bg} mg/dL` : `${e.units}u ${e.insulinType}`}
                      {isBG && e.cgm && (
                        <span style={{ fontSize: 11, color: theme.inkMute, fontWeight: 600 }}>
                          CGM {e.cgm}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: theme.inkMute, marginTop: 1, fontFamily: theme.numFont }}>
                      {fmtDayShort(e.ts)} &middot; {fmtTime(e.ts)}
                      {!isBG && ` \u00B7 ${siteLabel(e.site)}`}
                      {e.note && ` \u00B7 ${e.note}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {step === 'paste' && (
        <div style={{ padding: '12px 16px 16px', background: theme.bg, borderTop: `0.5px solid ${theme.line}` }}>
          <Btn variant="primary" theme={theme} size="lg" full
               onClick={startParse}
               style={{ opacity: text.length > 20 ? 1 : 0.4 }}>
            <Ic.spark width="18" height="18"/> Parse with AI
          </Btn>
        </div>
      )}
      {step === 'review' && (
        <div style={{ padding: '12px 16px 16px', background: theme.bg, borderTop: `0.5px solid ${theme.line}`, display: 'flex', gap: 10 }}>
          <Btn variant="ghost" theme={theme} onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant="primary" theme={theme} size="lg" full onClick={confirm} style={{ flex: 2 }}>
            <Ic.check width="18" height="18"/> Import {parsed.length - excluded.size}
          </Btn>
        </div>
      )}
    </div>
  );
}

function ParsingDots({ theme }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: 999,
          background: theme.primary,
          animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
        }}/>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function ParseStep({ children, theme, done, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
      color: done ? theme.inkDim : active ? theme.ink : theme.inkMute,
      fontWeight: active ? 700 : 500,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: 999,
        background: done ? theme.status.inRange.fg : 'transparent',
        border: done ? 'none' : `1.5px solid ${active ? theme.primary : theme.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        {done && <Ic.check width="11" height="11"/>}
      </div>
      {children}
    </div>
  );
}

window.ImportFlow = ImportFlow;
