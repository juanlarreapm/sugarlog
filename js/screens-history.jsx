// screens-history.jsx — History grouped by day

function HistoryView({ theme, entries, onSelectEntry }) {
  const groups = {};
  entries.forEach(e => {
    const k = dayKey(e.ts);
    (groups[k] = groups[k] || []).push(e);
  });
  const days = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 16px 100px' }}>
      {days.map(d => {
        const dayEntries = groups[d].sort((a, b) => new Date(b.ts) - new Date(a.ts));
        const bgs = dayEntries.filter(e => e.kind === 'glucose');
        const avg = bgs.length ? Math.round(bgs.reduce((s, e) => s + entryBg(e), 0) / bgs.length) : null;
        const tir = bgs.length ? Math.round(bgs.filter(e => classifyBg(entryBg(e), theme) === 'inRange').length / bgs.length * 100) : null;
        const units = dayEntries.filter(e => e.kind === 'insulin').reduce((s, e) => s + e.units, 0);
        return (
          <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '0 4px',
            }}>
              <div style={{
                fontFamily: theme.uiFont, fontSize: 18, fontWeight: 800,
                color: theme.ink, letterSpacing: -0.3,
              }}>{fmtDay(dayEntries[0].ts)}</div>
              <div style={{ fontSize: 11, color: theme.inkMute, fontFamily: theme.numFont }}>
                avg {avg ?? '\u2014'} &middot; {tir != null ? `${tir}% TIR` : '\u2014'} &middot; {units}u
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dayEntries.map(e => <FeedRow key={e.id} entry={e} theme={theme} onClick={() => onSelectEntry?.(e)}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.HistoryView = HistoryView;
