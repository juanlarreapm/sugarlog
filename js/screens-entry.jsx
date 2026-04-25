// screens-entry.jsx — Quick entry hub

function QuickEntry({ theme, layout, onPick, recents }) {
  const Tile = ({ kind, label, sub, icon, accent }) => {
    const big = layout !== 'tiles';
    return (
      <button onClick={() => onPick(kind)} style={{
        background: theme.surface, border: 0,
        borderRadius: theme.radius.xl,
        padding: big ? '24px 22px' : '20px 16px',
        textAlign: 'left', cursor: 'pointer', width: '100%',
        boxShadow: theme.dark
          ? `0 0 0 0.5px ${theme.line}`
          : '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: big ? 'row' : 'column',
        alignItems: big ? 'center' : 'flex-start', gap: big ? 18 : 14,
        minHeight: big ? 112 : 140,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: big ? 60 : 52, height: big ? 60 : 52,
          borderRadius: theme.radius.lg,
          background: accent.bg, color: accent.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: theme.uiFont, fontSize: big ? 22 : 18,
            fontWeight: 800, color: theme.ink, letterSpacing: -0.4,
          }}>{label}</div>
          <div style={{
            fontSize: 13, color: theme.inkMute, marginTop: 3,
            fontWeight: 500,
          }}>{sub}</div>
        </div>
        {big && (
          <div style={{ color: theme.inkMute }}>
            <Ic.chevR width="20" height="20"/>
          </div>
        )}
      </button>
    );
  };

  const tiles = (
    <>
      <Tile kind="glucose" label="Blood sugar"
            sub="Glucometer + CGM"
            accent={{ bg: theme.status.out.bg, fg: theme.status.out.fg }}
            icon={<Ic.drop width="28" height="28"/>}/>
      <Tile kind="insulin" label="Insulin"
            sub="Basal or bolus"
            accent={{ bg: theme.primarySoft, fg: theme.primaryInk }}
            icon={<Ic.syringe width="28" height="28"/>}/>
    </>
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: '4px 16px 16px',
    }}>
      <div style={{ padding: '4px 4px 8px' }}>
        <div style={{
          fontFamily: theme.uiFont, fontSize: 28, fontWeight: 800,
          color: theme.ink, letterSpacing: -0.7, lineHeight: 1.1,
        }}>
          Log for Maya
        </div>
        <div style={{
          fontSize: 14, color: theme.inkMute, marginTop: 4, fontWeight: 500,
        }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {layout === 'tiles' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {tiles}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tiles}
        </div>
      )}

      {layout === 'stackedRecents' && recents.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHead title="Recent" theme={theme}/>
          <Card theme={theme} padding={0}>
            {recents.slice(0, 3).map((e, i) => (
              <RecentRow key={e.id} entry={e} theme={theme} isLast={i === Math.min(2, recents.length - 1)}/>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function RecentRow({ entry, theme, isLast }) {
  const isBG = entry.kind === 'glucose';
  const status = isBG ? classifyBg(entry.bg, theme) : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: isLast ? 'none' : `0.5px solid ${theme.line}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: theme.radius.sm,
        background: isBG ? theme.status.out.bg : theme.primarySoft,
        color: isBG ? theme.status.out.fg : theme.primaryInk,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isBG ? <Ic.drop width="18" height="18"/> : <Ic.syringe width="18" height="18"/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: theme.ink,
        }}>
          {isBG ? `${entry.bg} mg/dL` : `${entry.units}u ${entry.insulinType}`}
        </div>
        <div style={{
          fontSize: 12, color: theme.inkMute, marginTop: 1,
        }}>
          {fmtTime(entry.ts)}{isBG ? '' : ` \u00B7 ${siteLabel(entry.site)}`}
        </div>
      </div>
      {isBG && <StatusPill status={status} theme={theme} size="sm"/>}
    </div>
  );
}

window.QuickEntry = QuickEntry;
