// app.jsx — main shell, state, navigation, tab bar

const THEME_CONFIG = {
  accent: 'teal',
  radius: 'softer',
  density: 'cozy',
  numFont: 'rounded',
  rangeLow: 70,
  rangeHigh: 150,
  dark: false,
};

function App() {
  const theme = buildTheme(THEME_CONFIG);

  // Auth state
  const [user, setUser] = React.useState(null);
  const [authChecked, setAuthChecked] = React.useState(!supabaseConfigured);

  React.useEffect(() => {
    if (!supabaseConfigured) return;
    auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Entries state — start empty if Supabase is configured (will load from cloud)
  const [entries, setEntries] = React.useState(() => {
    if (supabaseConfigured) return [];
    const local = localDB.load();
    return local || MOCK_ENTRIES;
  });

  // Load from Supabase when authenticated
  React.useEffect(() => {
    if (!supabaseConfigured || !user) return;
    db.loadEntries().then(({ data, error }) => {
      if (!error && data) {
        setEntries(data.map(db.rowToEntry));
      }
    });
  }, [user]);

  // Persist to localStorage as fallback
  React.useEffect(() => {
    localDB.save(entries);
  }, [entries]);

  const [tab, setTab] = React.useState('log');
  const [modal, setModal] = React.useState(null);
  const [driftViz, setDriftViz] = React.useState('paired');

  const addEntry = (e) => {
    const withId = { ...e, id: 'e-' + Math.random().toString(36).slice(2, 9) };
    setEntries(prev => [withId, ...prev]);
    setModal(null);
    setTab('today');
    // Persist to Supabase in background
    if (supabaseConfigured && user) {
      db.saveEntry(withId);
    }
  };

  const importEntries = (newOnes) => {
    const stamped = newOnes.map(e => ({ ...e, id: 'e-' + Math.random().toString(36).slice(2, 9) }));
    setEntries(prev => [...stamped, ...prev]);
    setModal(null);
    setTab('history');
    if (supabaseConfigured && user) {
      db.saveEntries(stamped);
    }
  };

  const recents = entries.slice(0, 3);

  // Show auth screen if Supabase is configured but user isn't logged in
  if (supabaseConfigured && authChecked && !user) {
    return <AuthScreen theme={theme} onAuth={() => {}}/>;
  }

  // Show loading while checking auth
  if (supabaseConfigured && !authChecked) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: theme.bg, fontFamily: theme.uiFont,
      }}>
        <SugarlogMark theme={theme} size={28}/>
      </div>
    );
  }

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'M';

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      flexDirection: 'column', background: theme.bg,
      fontFamily: theme.uiFont, color: theme.ink, position: 'relative',
      paddingTop: 54,
    }}>
      {!modal && <Header theme={theme} userInitial={userInitial} onSignOut={supabaseConfigured ? () => auth.signOut() : null}/>}

      {modal === 'bg' && (
        <ModalShell theme={theme} title="Blood sugar" onClose={() => setModal(null)}>
          <BgForm theme={theme} onSave={addEntry} onCancel={() => setModal(null)}/>
        </ModalShell>
      )}
      {modal === 'insulin' && (
        <ModalShell theme={theme} title="Insulin" onClose={() => setModal(null)}>
          <InsulinForm theme={theme} onSave={addEntry} onCancel={() => setModal(null)}/>
        </ModalShell>
      )}
      {modal === 'import' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ paddingTop: 14 }}/>
          <ImportFlow theme={theme} onClose={() => setModal(null)} onConfirm={importEntries}/>
        </div>
      )}
      {modal === 'drift' && (
        <ModalShell theme={theme} title="CGM drift" onClose={() => setModal(null)}>
          <DriftView theme={theme} entries={entries}
                     variant={{ value: driftViz, set: setDriftViz }}/>
        </ModalShell>
      )}

      {!modal && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'log' && (
            <QuickEntry theme={theme} layout="stackedRecents"
                        recents={recents} onPick={(k) => setModal(k === 'glucose' ? 'bg' : 'insulin')}/>
          )}
          {tab === 'today' && (
            <TodayView theme={theme} entries={entries}
                       onAdd={() => setTab('log')}
                       onSelectEntry={(e) => e.cgm && setModal('drift')}/>
          )}
          {tab === 'history' && (
            <>
              <div style={{ padding: '4px 16px 10px' }}>
                <button onClick={() => setModal('drift')} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', background: theme.surface, border: 0,
                  borderRadius: theme.radius.lg, cursor: 'pointer',
                  boxShadow: theme.dark ? `0 0 0 0.5px ${theme.line}` : '0 1px 2px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: theme.radius.sm,
                    background: theme.primarySoft, color: theme.primaryInk,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ic.spark width="20" height="20"/>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>CGM drift tracker</div>
                    <div style={{ fontSize: 12, color: theme.inkMute, marginTop: 1 }}>
                      Compare meter vs CGM over time
                    </div>
                  </div>
                  <Ic.chevR width="18" height="18" style={{ color: theme.inkMute }}/>
                </button>
              </div>
              <HistoryView theme={theme} entries={entries}/>
            </>
          )}
          {tab === 'export' && <ExportView theme={theme} entries={entries} onOpenImport={() => setModal('import')}/>}
        </div>
      )}

      {!modal && <TabBar tab={tab} setTab={setTab} theme={theme}/>}
    </div>
  );
}

function Header({ theme, userInitial, onSignOut }) {
  const [showMenu, setShowMenu] = React.useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px 10px',
    }}>
      <SugarlogMark theme={theme} size={20}/>
      <div style={{ position: 'relative' }}>
        <button onClick={() => onSignOut && setShowMenu(!showMenu)} style={{
          width: 32, height: 32, borderRadius: 999,
          background: theme.primarySoft, color: theme.primaryInk,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 13, fontFamily: theme.uiFont,
          letterSpacing: -0.2, border: 0, cursor: onSignOut ? 'pointer' : 'default',
        }}>{userInitial}</button>
        {showMenu && onSignOut && (
          <div style={{
            position: 'absolute', top: 38, right: 0, zIndex: 100,
            background: theme.surface, borderRadius: theme.radius.md,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 4, minWidth: 120,
          }}>
            <button onClick={() => { setShowMenu(false); onSignOut(); }} style={{
              width: '100%', padding: '10px 14px', border: 0, borderRadius: theme.radius.sm,
              background: 'transparent', color: theme.status.out.fg, fontSize: 14,
              fontWeight: 600, cursor: 'pointer', fontFamily: theme.uiFont, textAlign: 'left',
            }}>Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalShell({ theme, title, onClose, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: theme.bg,
      display: 'flex', flexDirection: 'column', zIndex: 30,
      paddingTop: 50,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px 14px',
      }}>
        <button onClick={onClose} style={{
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          color: theme.ink, display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 15, fontWeight: 600, fontFamily: theme.uiFont,
        }}>
          <Ic.x width="22" height="22"/>
        </button>
        <div style={{
          fontSize: 17, fontWeight: 800, color: theme.ink,
          fontFamily: theme.uiFont, letterSpacing: -0.2,
        }}>{title}</div>
        <div style={{ width: 22 }}/>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  );
}

function TabBar({ tab, setTab, theme }) {
  const tabs = [
    { id: 'log', label: 'Log', icon: Ic.plus, primary: true },
    { id: 'today', label: 'Today', icon: Ic.home },
    { id: 'history', label: 'History', icon: Ic.list },
    { id: 'export', label: 'Share', icon: Ic.share },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
      padding: '8px 14px 28px', gap: 4,
      background: theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${theme.line}`,
    }}>
      {tabs.map(t => {
        const active = tab === t.id;
        if (t.primary) {
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: 56, height: 56, borderRadius: 999,
              background: theme.primary, color: '#fff', border: 0,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginBottom: 6,
            }}>
              <Ic.plus width="26" height="26"/>
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'transparent', border: 0, padding: '8px 12px',
            color: active ? theme.primary : theme.inkMute,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            cursor: 'pointer', flex: 1, fontFamily: theme.uiFont,
          }}>
            <t.icon width="22" height="22"/>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

window.App = App;
