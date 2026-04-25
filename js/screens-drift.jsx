// screens-drift.jsx — CGM drift tracker

function DriftView({ theme, entries, variant }) {
  const pairs = entries
    .filter(e => e.kind === 'glucose' && e.cgm != null)
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));

  const deltas = pairs.map(p => p.cgm - p.bg);
  const meanDelta = deltas.length ? deltas.reduce((a,b) => a+b, 0) / deltas.length : 0;
  const meanAbsDelta = deltas.length ? deltas.reduce((a,b) => a+Math.abs(b), 0) / deltas.length : 0;
  const direction = meanDelta > 1 ? 'CGM reads high' : meanDelta < -1 ? 'CGM reads low' : 'Well calibrated';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 16px 100px' }}>
      <Card theme={theme} padding={18}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.inkDim }}>
          Average drift
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <span style={{
            fontFamily: theme.numFont, fontWeight: 800, fontSize: 40,
            color: theme.ink, letterSpacing: -1, lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{meanDelta > 0 ? '+' : ''}{meanDelta.toFixed(1)}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.inkMute }}>mg/dL</span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: theme.primarySoft, color: theme.primaryInk,
            fontSize: 12, fontWeight: 700,
          }}>{direction}</span>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: theme.raised, color: theme.inkDim,
            fontSize: 12, fontWeight: 600, fontFamily: theme.numFont,
          }}>&plusmn;{meanAbsDelta.toFixed(1)} avg error</span>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: theme.raised, color: theme.inkDim,
            fontSize: 12, fontWeight: 600, fontFamily: theme.numFont,
          }}>{pairs.length} pairs</span>
        </div>
      </Card>

      <div style={{
        display: 'flex', padding: 3, background: theme.raised,
        borderRadius: theme.radius.md, gap: 2,
      }}>
        {[
          { v: 'paired', label: 'Paired dots' },
          { v: 'lines',  label: 'Dual line' },
        ].map(o => (
          <button key={o.v} onClick={() => variant.set(o.v)} style={{
            flex: 1, height: 36, border: 0, cursor: 'pointer',
            background: variant.value === o.v ? theme.surface : 'transparent',
            color: variant.value === o.v ? theme.ink : theme.inkMute,
            borderRadius: theme.radius.sm,
            fontFamily: theme.uiFont, fontWeight: 700, fontSize: 13,
            boxShadow: variant.value === o.v ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          }}>{o.label}</button>
        ))}
      </div>

      <Card theme={theme} padding={14}>
        {variant.value === 'paired'
          ? <PairedDotChart pairs={pairs} theme={theme}/>
          : <DualLineChart pairs={pairs} theme={theme}/>}
      </Card>

      <SectionHead title="Recent pairs" theme={theme}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pairs.slice().reverse().slice(0, 10).map(p => {
          const delta = p.cgm - p.bg;
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: theme.surface,
              borderRadius: theme.radius.md,
              boxShadow: theme.dark ? `0 0 0 0.5px ${theme.line}` : '0 1px 0 rgba(0,0,0,0.02)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: theme.inkMute, fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtDayShort(p.ts)} &middot; {fmtTime(p.ts)}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, color: theme.inkMute, fontWeight: 600 }}>METER</span>
                  <span style={{
                    fontFamily: theme.numFont, fontWeight: 700, fontSize: 16,
                    color: theme.ink, fontVariantNumeric: 'tabular-nums',
                  }}>{p.bg}</span>
                  <span style={{ fontSize: 11, color: theme.inkMute, fontWeight: 600, marginLeft: 6 }}>CGM</span>
                  <span style={{
                    fontFamily: theme.numFont, fontWeight: 700, fontSize: 16,
                    color: theme.inkDim, fontVariantNumeric: 'tabular-nums',
                  }}>{p.cgm}</span>
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 999,
                background: Math.abs(delta) > 15 ? theme.status.borderline.bg : theme.raised,
                color: Math.abs(delta) > 15 ? theme.status.borderline.fg : theme.inkDim,
                fontSize: 13, fontWeight: 700, fontFamily: theme.numFont,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {delta > 0 ? '+' : ''}{delta}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PairedDotChart({ pairs, theme }) {
  const W = 326, H = 200, padL = 32, padR = 12, padT = 14, padB = 28;
  const allVals = pairs.flatMap(p => [p.bg, p.cgm]);
  const yMin = Math.min(...allVals) - 10;
  const yMax = Math.max(...allVals) + 10;
  const xAt = (i) => padL + (i / Math.max(1, pairs.length - 1)) * (W - padL - padR);
  const yAt = (v) => H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB);
  const ticks = [yMin, (yMin+yMax)/2, yMax].map(v => Math.round(v / 10) * 10);

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, alignItems: 'center' }}>
        <Legend color={theme.ink} label="Meter" theme={theme}/>
        <Legend color={theme.primary} label="CGM" theme={theme} ring/>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        {ticks.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke={theme.line} strokeWidth={0.5}/>
            <text x={padL - 6} y={yAt(v) + 3} fontSize={9} fill={theme.inkMute} textAnchor="end" fontFamily={theme.numFont}>{v}</text>
          </g>
        ))}
        {pairs.map((p, i) => (
          <g key={p.id}>
            <line x1={xAt(i)} x2={xAt(i)} y1={yAt(p.bg)} y2={yAt(p.cgm)}
                  stroke={theme.inkMute} strokeOpacity={0.3} strokeWidth={1}/>
            <circle cx={xAt(i)} cy={yAt(p.bg)} r={3.5} fill={theme.ink}/>
            <circle cx={xAt(i)} cy={yAt(p.cgm)} r={3.5} fill="none" stroke={theme.primary} strokeWidth={1.6}/>
          </g>
        ))}
        {[0, Math.floor(pairs.length/2), pairs.length-1].filter((v,i,a) => a.indexOf(v) === i).map(i => (
          <text key={i} x={xAt(i)} y={H - 8} fontSize={9} fill={theme.inkMute} textAnchor="middle" fontFamily={theme.numFont}>
            {fmtDayShort(pairs[i].ts)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DualLineChart({ pairs, theme }) {
  const W = 326, H = 200, padL = 32, padR = 12, padT = 14, padB = 60;
  const allVals = pairs.flatMap(p => [p.bg, p.cgm]);
  const yMin = Math.min(...allVals) - 10;
  const yMax = Math.max(...allVals) + 10;
  const xAt = (i) => padL + (i / Math.max(1, pairs.length - 1)) * (W - padL - padR);
  const yAt = (v) => padT + ((yMax - v) / (yMax - yMin)) * (H - padT - padB - 30);

  const bandTop = H - padB;
  const bandH = 22;
  const maxAbsDelta = Math.max(...pairs.map(p => Math.abs(p.cgm - p.bg)), 1);
  const dAt = (d) => bandTop + bandH/2 - (d / maxAbsDelta) * (bandH/2 - 2);

  const meterPath = pairs.map((p, i) => `${i ? 'L' : 'M'}${xAt(i)},${yAt(p.bg)}`).join(' ');
  const cgmPath = pairs.map((p, i) => `${i ? 'L' : 'M'}${xAt(i)},${yAt(p.cgm)}`).join(' ');

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, alignItems: 'center' }}>
        <Legend color={theme.ink} label="Meter" theme={theme}/>
        <Legend color={theme.primary} label="CGM" theme={theme}/>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        <rect x={padL} y={yAt(theme.rangeHigh)} width={W - padL - padR}
              height={yAt(theme.rangeLow) - yAt(theme.rangeHigh)}
              fill={theme.status.inRange.bg} opacity={0.4}/>
        <path d={meterPath} fill="none" stroke={theme.ink} strokeWidth={1.8} strokeLinejoin="round"/>
        <path d={cgmPath} fill="none" stroke={theme.primary} strokeWidth={1.8} strokeLinejoin="round" strokeDasharray="4 3"/>
        {pairs.map((p, i) => (
          <g key={p.id}>
            <circle cx={xAt(i)} cy={yAt(p.bg)} r={2.5} fill={theme.ink}/>
            <circle cx={xAt(i)} cy={yAt(p.cgm)} r={2.5} fill={theme.primary}/>
          </g>
        ))}
        <text x={padL} y={bandTop - 4} fontSize={9} fill={theme.inkMute} fontFamily={theme.uiFont} fontWeight={700} letterSpacing="0.4">
          DELTA
        </text>
        <line x1={padL} x2={W - padR} y1={bandTop + bandH/2} y2={bandTop + bandH/2}
              stroke={theme.line} strokeWidth={0.5}/>
        {pairs.map((p, i) => {
          const d = p.cgm - p.bg;
          const y = dAt(d);
          return (
            <line key={p.id} x1={xAt(i)} x2={xAt(i)}
                  y1={bandTop + bandH/2} y2={y}
                  stroke={d > 0 ? theme.status.inRange.fg : theme.status.out.fg}
                  strokeWidth={2.5} strokeLinecap="round"/>
          );
        })}
        {[0, Math.floor(pairs.length/2), pairs.length-1].filter((v,i,a) => a.indexOf(v) === i).map(i => (
          <text key={i} x={xAt(i)} y={H - 6} fontSize={9} fill={theme.inkMute} textAnchor="middle" fontFamily={theme.numFont}>
            {fmtDayShort(pairs[i].ts)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function Legend({ color, label, theme, ring }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 10, height: 10, borderRadius: 999,
        background: ring ? 'transparent' : color,
        border: ring ? `1.6px solid ${color}` : 'none',
      }}/>
      <span style={{ fontSize: 12, color: theme.inkDim, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

window.DriftView = DriftView;
