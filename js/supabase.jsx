// supabase.jsx — Supabase client, auth helpers, and data layer
// Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with your project credentials.

const SUPABASE_URL = 'https://zijmfdywwruxnzxqkipo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OMhpajo9t2KBfLj9WnN7cg_caSdLs32';

const supabaseConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 10;

let sbClient = null;
if (supabaseConfigured) {
  const createClient = window.supabase?.createClient;
  if (createClient) {
    sbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

// ── Auth helpers ──────────────────────────────────────────

const auth = {
  signUp: async (email, password) => {
    if (!sbClient) return { error: { message: 'Supabase not configured' } };
    return sbClient.auth.signUp({ email, password });
  },
  signIn: async (email, password) => {
    if (!sbClient) return { error: { message: 'Supabase not configured' } };
    return sbClient.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    if (!sbClient) return;
    return sbClient.auth.signOut();
  },
  getUser: async () => {
    if (!sbClient) return { data: { user: null } };
    return sbClient.auth.getUser();
  },
  getSession: async () => {
    if (!sbClient) return { data: { session: null } };
    return sbClient.auth.getSession();
  },
  onAuthStateChange: (cb) => {
    if (!sbClient) return { data: { subscription: { unsubscribe: () => {} } } };
    return sbClient.auth.onAuthStateChange(cb);
  },
};

// ── Data helpers (RLS-scoped to authenticated user) ──────

const db = {
  loadEntries: async () => {
    if (!sbClient) return { data: null, error: { message: 'Supabase not configured' } };
    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) return { data: null, error: { message: 'Not authenticated' } };
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('ts', { ascending: false });
    return { data, error };
  },

  saveEntry: async (entry) => {
    if (!sbClient) return { error: { message: 'Supabase not configured' } };
    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) return { error: { message: 'Not authenticated' } };
    const row = {
      id: entry.id,
      user_id: user.id,
      kind: entry.kind,
      ts: entry.ts,
      bg: entry.bg || null,
      cgm: entry.cgm || null,
      note: entry.note || null,
      insulin_type: entry.insulinType || null,
      units: entry.units || null,
      site: entry.site || null,
      meal_context: entry.mealContext || null,
    };
    const { data, error } = await sbClient.from('entries').insert(row);
    return { data, error };
  },

  saveEntries: async (entries) => {
    if (!sbClient) return { error: { message: 'Supabase not configured' } };
    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) return { error: { message: 'Not authenticated' } };
    const rows = entries.map(entry => ({
      id: entry.id,
      user_id: user.id,
      kind: entry.kind,
      ts: entry.ts,
      bg: entry.bg || null,
      cgm: entry.cgm || null,
      note: entry.note || null,
      insulin_type: entry.insulinType || null,
      units: entry.units || null,
      site: entry.site || null,
      meal_context: entry.mealContext || null,
    }));
    const { data, error } = await sbClient.from('entries').insert(rows);
    return { data, error };
  },

  deleteEntry: async (id) => {
    if (!sbClient) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await sbClient.from('entries').delete().eq('id', id);
    return { data, error };
  },

  // Convert Supabase row (snake_case) to app entry (camelCase)
  rowToEntry: (row) => ({
    id: row.id,
    kind: row.kind,
    ts: row.ts,
    bg: row.bg ? Number(row.bg) : undefined,
    cgm: row.cgm ? Number(row.cgm) : undefined,
    note: row.note || undefined,
    insulinType: row.insulin_type || undefined,
    units: row.units ? Number(row.units) : undefined,
    site: row.site || undefined,
    mealContext: row.meal_context || undefined,
  }),
};

// ── localStorage fallback ────────────────────────────────

const localDB = {
  load: () => {
    try {
      const raw = localStorage.getItem('sugarlog.entries');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },
  save: (entries) => {
    try { localStorage.setItem('sugarlog.entries', JSON.stringify(entries)); } catch(e) {}
  },
};

// ── Auth screen component ────────────────────────────────

function AuthScreen({ theme, onAuth }) {
  const [mode, setMode] = React.useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const fn = mode === 'signup' ? auth.signUp : auth.signIn;
    const { error: err } = await fn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else if (mode === 'signup') {
      setError('Check your email to confirm your account, then sign in.');
      setMode('signin');
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 32,
      background: theme.bg, fontFamily: theme.uiFont, boxSizing: 'border-box',
    }}>
      <SugarlogMark theme={theme} size={28}/>
      <div style={{ height: 32 }}/>
      <div style={{
        fontSize: 22, fontWeight: 800, color: theme.ink,
        letterSpacing: -0.4, marginBottom: 4,
      }}>
        {mode === 'signin' ? 'Welcome back' : 'Create account'}
      </div>
      <div style={{ fontSize: 14, color: theme.inkMute, marginBottom: 24 }}>
        {mode === 'signin' ? 'Sign in to access your logs' : 'Set up your Sugarlog account'}
      </div>

      <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            height: 44, padding: '0 14px', borderRadius: theme.radius.md,
            border: `0.5px solid ${theme.line}`, background: theme.surface,
            color: theme.ink, fontSize: 15, fontFamily: theme.uiFont, outline: 'none',
          }}/>
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            height: 44, padding: '0 14px', borderRadius: theme.radius.md,
            border: `0.5px solid ${theme.line}`, background: theme.surface,
            color: theme.ink, fontSize: 15, fontFamily: theme.uiFont, outline: 'none',
          }}/>

        {error && (
          <div style={{
            fontSize: 13, color: theme.status.out.fg, padding: '8px 12px',
            background: theme.status.out.bg, borderRadius: theme.radius.sm,
          }}>{error}</div>
        )}

        <Btn variant="primary" theme={theme} size="lg" full onClick={handleSubmit}
          style={{ marginTop: 6, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </Btn>

        <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
          style={{
            background: 'transparent', border: 0, color: theme.primary,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: theme.uiFont,
            marginTop: 8,
          }}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

window.supabaseConfigured = supabaseConfigured;
window.auth = auth;
window.db = db;
window.localDB = localDB;
window.AuthScreen = AuthScreen;
