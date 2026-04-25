// screens-export.jsx — Export view

function ExportView({ theme, entries, onOpenImport }) {
  const [from, setFrom] = React.useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return dayKey(d.toISOString());
  });
  const [to, setTo] = React.useState(() => dayKey(new Date().toISOString()));

  const inRange = entries.filter(e => {
    const k = dayKey(e.ts);
    return k >= from && k <= to;
  });
  const bgs = inRange.filter(e => e.kind === 'glucose');
  const insulins = inRange.filter(e => e.kind === 'insulin');
  const avg = bgs.length ? Math.round(bgs.reduce((s,e) => s+e.bg, 0)/bgs.length) : 0;
  const tir = bgs.length ? Math.round(bgs.filter(e => classifyBg(e.bg, theme) === 'inRange').length / bgs.length * 100) : 0;
  const totalUnits = insulins.reduce((s,e) => s+e.units, 0);

  const [exported, setExported] = React.useState(null);
  const fakeExport = (kind) => {
    setExported({ kind, ts: new Date().toISOString() });
    setTimeout(() => setExported(null), 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 16px 100px' }}>
      <Card theme={theme} padding={18}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Date range
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <DateField label="From" value={from} onChange={setFrom} theme={theme}/>
          <DateField label="To" value={to} onChange={setTo} theme={theme}/>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {[{l: '7 days', n: 6}, {l: '14 days', n: 13}, {l: '30 days', n: 29}].map(p => (
            <button key={p.l} onClick={() => {
              const d = new Date(); d.setDate(d.getDate() - p.n);
              setFrom(dayKey(d.toISOString()));
              setTo(dayKey(new Date().toISOString()));
            }} style={{
              padding: '6px 12px', borderRadius: 999, border: `0.5px solid ${theme.line}`,
              background: 'transparent', color: theme.inkDim, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: theme.uiFont,
            }}>{p.l}</button>
          ))}
        </div>
      </Card>

      <Card theme={theme} padding={18}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 }}>
          Summary preview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SumCell label="Average BG" value={avg || '\u2014'} unit="mg/dL" theme={theme}/>
          <SumCell label="Time in range" value={`${tir}%`} theme={theme} accent={theme.status.inRange.fg}/>
          <SumCell label="Readings" value={bgs.length} theme={theme}/>
          <SumCell label="Total insulin" value={totalUnits} unit="u" theme={theme}/>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn variant="primary" theme={theme} size="lg" full onClick={() => fakeExport('pdf')}>
          <Ic.share width="18" height="18"/> Generate PDF for medical team
        </Btn>
        <Btn variant="soft" theme={theme} size="lg" full onClick={() => fakeExport('csv')}>
          Download CSV
        </Btn>
      </div>

      {exported && (
        <div style={{
          padding: '12px 14px', background: theme.status.inRange.bg,
          color: theme.status.inRange.fg, borderRadius: theme.radius.md,
          fontSize: 13, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <Ic.check width="18" height="18"/>
          {exported.kind.toUpperCase()} ready &middot; 7-day summary for Maya
        </div>
      )}

      <SectionHead title="Import history" theme={theme}/>
      <Card theme={theme} onClick={onOpenImport} padding={16} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: theme.radius.md,
            background: theme.primarySoft, color: theme.primaryInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ic.spark width="22" height="22"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
              Import from notes
            </div>
            <div style={{ fontSize: 12, color: theme.inkMute, marginTop: 2 }}>
              Paste old logs &middot; we'll parse them for you
            </div>
          </div>
          <div style={{ color: theme.inkMute }}><Ic.chevR width="18" height="18"/></div>
        </div>
      </Card>
    </div>
  );
}

function DateField({ label, value, onChange, theme }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </span>
      <input type="date" value={value} onChange={e => onChange(e.target.value)} style={{
        height: 38, padding: '0 10px', borderRadius: theme.radius.sm,
        border: `0.5px solid ${theme.line}`, background: theme.raised,
        color: theme.ink, fontSize: 14, fontFamily: theme.numFont, fontWeight: 600,
        outline: 'none', fontVariantNumeric: 'tabular-nums',
      }}/>
    </label>
  );
}

function SumCell({ label, value, unit, accent, theme }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{
          fontFamily: theme.numFont, fontWeight: 800, fontSize: 22,
          color: accent || theme.ink, fontVariantNumeric: 'tabular-nums',
          letterSpacing: -0.4,
        }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: theme.inkMute, fontWeight: 600 }}>{unit}</span>}
      </div>
    </div>
  );
}

window.ExportView = ExportView;
