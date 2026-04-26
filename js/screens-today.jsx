// screens-today.jsx — Today feed (interleaved chronological)

function TodayView({ theme, entries, onAdd, onSelectEntry }) {
  const todayKey = dayKey(new Date().toISOString());
  const todays = entries.filter(e => dayKey(e.ts) === todayKey)
                        .sort((a, b) => new Date(b.ts) - new Date(a.ts));

  const bgEntries = todays.filter(e => e.kind === 'glucose' && entryBg(e) != null);
  const bgs = bgEntries.map(e => entryBg(e));
  const avgBg = bgs.length ? Math.round(bgs.reduce((a,b) => a+b, 0) / bgs.length) : null;
  const inRangeCount = bgEntries.filter(e => classifyBg(entryBg(e), theme) === 'inRange').length;
  const totalUnits = todays.filter(e => e.kind === 'insulin').reduce((s, e) => s + e.units, 0);
  const tir = bgs.length ? Math.round(inRangeCount / bgs.length * 100) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 16px 100px' }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.primarySoft}, ${theme.surface})`,
        borderRadius: theme.radius.xl, padding: 18,
        border: theme.dark ? `0.5px solid ${theme.line}` : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.inkDim }}>
              Today's average
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{
                fontFamily: theme.numFont, fontWeight: 800, fontSize: 44,
                color: avgBg ? theme.status[classifyBg(avgBg, theme)].fg : theme.inkMute,
                letterSpacing: -1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>{avgBg ?? '\u2014'}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.inkMute }}>mg/dL</span>
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: theme.radius.lg,
            background: theme.surface, color: theme.primaryInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}>
            <Ic.drop width="28" height="28"/>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 6 }}>
          <Stat label="Time in range" value={tir != null ? `${tir}%` : '\u2014'} accent={theme.status.inRange.fg} theme={theme}/>
          <Stat label="Readings" value={bgs.length} theme={theme} divider/>
          <Stat label="Insulin" value={`${totalUnits}u`} theme={theme} divider/>
        </div>
      </div>

      {bgs.length >= 2 && <DaySparkline entries={todays.filter(e => e.kind === 'glucose').slice().reverse()} theme={theme}/>}

      <SectionHead title="Timeline" theme={theme}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {todays.length === 0 ? (
          <Card theme={theme} padding={28} style={{ textAlign: 'center' }}>
            <div style={{ color: theme.inkMute, fontSize: 14 }}>No entries yet today.</div>
            <Btn variant="soft" theme={theme} onClick={onAdd} style={{ marginTop: 14 }}>
              <Ic.plus width="16" height="16"/> Log first entry
            </Btn>
          </Card>
        ) : (
          todays.map(e => <FeedRow key={e.id} entry={e} theme={theme} onClick={() => onSelectEntry?.(e)}/>)
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent, theme, divider }) {
  return (
    <div style={{
      paddingLeft: divider ? 12 : 0,
      borderLeft: divider ? `0.5px solid ${theme.line}` : 'none',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{
        fontFamily: theme.numFont, fontWeight: 700, fontSize: 18,
        color: accent || theme.ink, marginTop: 3,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
    </div>
  );
}

function FeedRow({ entry, theme, onClick }) {
  const isBG = entry.kind === 'glucose';
  const bgVal = isBG ? entryBg(entry) : null;
  const status = bgVal != null ? classifyBg(bgVal, theme) : null;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', background: theme.surface,
      borderRadius: theme.radius.lg, border: 0, textAlign: 'left',
      cursor: 'pointer', width: '100%',
      boxShadow: theme.dark ? `0 0 0 0.5px ${theme.line}` : '0 1px 0 rgba(0,0,0,0.02)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: theme.radius.md,
        background: isBG ? (status ? theme.status[status].bg : theme.raised) : theme.primarySoft,
        color: isBG ? (status ? theme.status[status].fg : theme.inkMute) : theme.primaryInk,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {isBG ? <Ic.drop width="20" height="20"/> : <Ic.syringe width="20" height="20"/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          {isBG ? (
            <>
              <span style={{
                fontFamily: theme.numFont, fontWeight: 700, fontSize: 22,
                color: status ? theme.status[status].fg : theme.inkMute, letterSpacing: -0.4,
                fontVariantNumeric: 'tabular-nums',
              }}>{entry.bg ?? '\u2014'}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: theme.inkMute }}>mg/dL</span>
              {entry.cgm != null && (
                <span style={{ fontSize: 11, color: theme.inkMute, marginLeft: 6, fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums' }}>
                  CGM {entry.cgm}
                </span>
              )}
            </>
          ) : (
            <>
              <span style={{
                fontFamily: theme.numFont, fontWeight: 700, fontSize: 22,
                color: theme.ink, letterSpacing: -0.4,
                fontVariantNumeric: 'tabular-nums',
              }}>{entry.units}u</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.primaryInk, textTransform: 'capitalize' }}>
                {entry.insulinType}
              </span>
              {entry.mealContext && (
                <span style={{ fontSize: 11, color: theme.inkMute, marginLeft: 4, textTransform: 'capitalize' }}>
                  &middot; {entry.mealContext}-meal
                </span>
              )}
            </>
          )}
        </div>
        <div style={{ fontSize: 12, color: theme.inkMute, marginTop: 2 }}>
          {fmtTime(entry.ts)}
          {!isBG && ` \u00B7 ${siteLabel(entry.site)}`}
          {entry.note && <span style={{ fontStyle: 'italic' }}> &middot; {entry.note}</span>}
        </div>
      </div>
      {isBG && <StatusPill status={status} theme={theme} size="sm"/>}
    </button>
  );
}

function DaySparkline({ entries, theme }) {
  if (!entries.length) return null;
  const W = 326, H = 80, pad = 12;
  const maxBg = Math.max(...entries.map(e => entryBg(e)), theme.rangeHigh + 30);
  const minBg = Math.min(...entries.map(e => entryBg(e)), theme.rangeLow - 30);
  const range = maxBg - minBg || 1;
  const xAt = (i) => pad + (i / Math.max(1, entries.length - 1)) * (W - 2 * pad);
  const yAt = (v) => H - pad - ((v - minBg) / range) * (H - 2 * pad);

  const points = entries.map((e, i) => `${xAt(i)},${yAt(entryBg(e))}`).join(' ');

  const yLow = yAt(theme.rangeLow);
  const yHigh = yAt(theme.rangeHigh);

  return (
    <Card theme={theme} padding={14}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Glucose curve
        </div>
        <div style={{ fontSize: 11, color: theme.inkMute, fontFamily: theme.numFont }}>
          {theme.rangeLow}&ndash;{theme.rangeHigh} target
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
        <rect x={0} y={yHigh} width={W} height={yLow - yHigh} fill={theme.status.inRange.bg} opacity={0.6}/>
        <line x1={0} x2={W} y1={yLow} y2={yLow} stroke={theme.status.inRange.fg} strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="2 3"/>
        <line x1={0} x2={W} y1={yHigh} y2={yHigh} stroke={theme.status.inRange.fg} strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="2 3"/>
        <polyline points={points} fill="none" stroke={theme.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        {entries.map((e, i) => {
          const s = classifyBg(entryBg(e), theme);
          return <circle key={e.id} cx={xAt(i)} cy={yAt(entryBg(e))} r={3.5} fill={theme.status[s].fg} stroke={theme.surface} strokeWidth={1.5}/>;
        })}
      </svg>
    </Card>
  );
}

window.TodayView = TodayView;
window.FeedRow = FeedRow;
