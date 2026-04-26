// profile.jsx — view & edit profile from avatar menu

function ProfilePage({ theme, profile, email, onSave, onSignOut, onClose }) {
  const [form, setForm] = React.useState(() => {
    const p = { ...profile };
    if (!p.carbRatios) {
      p.carbRatios = {
        default: { breakfast: '', lunch: '', dinner: '', snack: '' },
        overrides: [],
      };
    } else {
      // Convert nulls back to empty strings for form inputs
      const toStr = v => (v == null ? '' : String(v));
      p.carbRatios = {
        default: {
          breakfast: toStr(p.carbRatios.default?.breakfast),
          lunch: toStr(p.carbRatios.default?.lunch),
          dinner: toStr(p.carbRatios.default?.dinner),
          snack: toStr(p.carbRatios.default?.snack),
        },
        overrides: (p.carbRatios.overrides || []).map(o => ({
          days: o.days || [],
          breakfast: toStr(o.breakfast),
          lunch: toStr(o.lunch),
          dinner: toStr(o.dinner),
          snack: toStr(o.snack),
        })),
      };
    }
    // Convert numbers back to strings for numeric inputs
    if (!p.patientDob) p.patientDob = '';
    if (p.correctionFactor != null) p.correctionFactor = String(p.correctionFactor);
    else p.correctionFactor = '';
    if (p.longActingDose != null) p.longActingDose = String(p.longActingDose);
    else p.longActingDose = '';
    if (!p.longActingTime) p.longActingTime = '';
    if (!p.diagnosisDate) p.diagnosisDate = '';
    if (!p.patientName) p.patientName = '';
    return p;
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const inputStyle = {
    height: 44, padding: '0 14px', borderRadius: theme.radius.md,
    border: `0.5px solid ${theme.line}`, background: theme.surface,
    color: theme.ink, fontSize: 15, fontFamily: theme.uiFont, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 700, color: theme.inkMute,
    marginBottom: 4, display: 'block',
  };

  const segmentedControl = (options, value, onChange) => (
    <div style={{
      display: 'flex', gap: 0, borderRadius: theme.radius.md,
      border: `0.5px solid ${theme.line}`, overflow: 'hidden',
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          flex: 1, height: 40, border: 0, cursor: 'pointer',
          background: value === opt.value ? theme.primary : theme.surface,
          color: value === opt.value ? '#fff' : theme.ink,
          fontSize: 13, fontWeight: 700, fontFamily: theme.uiFont,
          borderRight: opt !== options[options.length - 1] ? `0.5px solid ${theme.line}` : 'none',
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  );

  const cardStyle = {
    padding: 14, borderRadius: theme.radius.md,
    border: `0.5px solid ${theme.line}`, background: theme.surface,
  };

  // Carb ratio helpers
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
  const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
  const MEAL_PLACEHOLDERS = { breakfast: 'e.g. 10', lunch: 'e.g. 12', dinner: 'e.g. 10', snack: 'e.g. 15' };

  const setCarbDefault = (meal, val) => {
    setForm(prev => ({
      ...prev,
      carbRatios: {
        ...prev.carbRatios,
        default: { ...prev.carbRatios.default, [meal]: val },
      },
    }));
  };

  const setCarbOverride = (idx, key, val) => {
    setForm(prev => {
      const overrides = prev.carbRatios.overrides.map((o, i) =>
        i === idx ? { ...o, [key]: val } : o
      );
      return { ...prev, carbRatios: { ...prev.carbRatios, overrides } };
    });
  };

  const toggleDay = (idx, day) => {
    setForm(prev => {
      const overrides = prev.carbRatios.overrides.map((o, i) => {
        if (i !== idx) return o;
        const days = o.days.includes(day)
          ? o.days.filter(d => d !== day)
          : [...o.days, day].sort();
        return { ...o, days };
      });
      return { ...prev, carbRatios: { ...prev.carbRatios, overrides } };
    });
  };

  const addOverride = () => {
    setForm(prev => ({
      ...prev,
      carbRatios: {
        ...prev.carbRatios,
        overrides: [...prev.carbRatios.overrides, {
          days: [], breakfast: '', lunch: '', dinner: '', snack: '',
        }],
      },
    }));
  };

  const removeOverride = (idx) => {
    setForm(prev => ({
      ...prev,
      carbRatios: {
        ...prev.carbRatios,
        overrides: prev.carbRatios.overrides.filter((_, i) => i !== idx),
      },
    }));
  };

  const mealInputs = (values, onChange) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {MEALS.map(meal => (
        <div key={meal}>
          <label style={labelStyle}>{MEAL_LABELS[meal]}</label>
          <input type="number" value={values[meal]} placeholder={MEAL_PLACEHOLDERS[meal]}
            inputMode="decimal"
            onChange={e => onChange(meal, e.target.value)}
            style={inputStyle}/>
        </div>
      ))}
    </div>
  );

  const overrideDays = form.carbRatios.overrides.flatMap(o => o.days);
  const remainingDays = [0,1,2,3,4,5,6].filter(d => !overrideDays.includes(d));
  const hasOverride = form.carbRatios.overrides.length > 0;
  const defaultLabel = hasOverride
    ? remainingDays.map(d => DAY_LABELS[d]).join(', ')
    : 'Default (all days)';

  const canSave = form.patientName.trim().length > 0 && !saving;

  const handleSave = async () => {
    setSaving(true);
    const cleaned = {
      ...form,
      patientDob: form.patientDob || null,
      rangeLow: Number(form.rangeLow) || 70,
      rangeHigh: Number(form.rangeHigh) || 150,
      carbRatios: (() => {
        const toNum = v => v === '' || v == null ? null : Number(v);
        const def = form.carbRatios.default;
        const hasDefault = Object.values(def).some(v => v !== '' && v != null);
        const overrides = form.carbRatios.overrides
          .filter(o => o.days.length > 0)
          .map(o => ({
            days: o.days,
            breakfast: toNum(o.breakfast),
            lunch: toNum(o.lunch),
            dinner: toNum(o.dinner),
            snack: toNum(o.snack),
          }));
        if (!hasDefault && overrides.length === 0) return null;
        return {
          default: {
            breakfast: toNum(def.breakfast),
            lunch: toNum(def.lunch),
            dinner: toNum(def.dinner),
            snack: toNum(def.snack),
          },
          overrides,
        };
      })(),
      correctionFactor: form.correctionFactor ? Number(form.correctionFactor) : null,
      longActingDose: form.longActingDose ? Number(form.longActingDose) : null,
      longActingTime: form.longActingTime || null,
      diagnosisDate: form.diagnosisDate || null,
    };
    await onSave(cleaned);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const sectionHeader = (title, subtitle) => (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.ink }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: theme.inkMute, marginTop: 2, fontWeight: 500 }}>{subtitle}</div>}
    </div>
  );

  return (
    <div style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Account email (read-only) */}
      {email && (
        <div style={{
          fontSize: 13, color: theme.inkMute, fontWeight: 500,
          textAlign: 'center', padding: '4px 0 0',
        }}>{email}</div>
      )}

      {/* Section 1: Patient Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sectionHeader('Patient info', 'Basic details')}
        <div>
          <label style={labelStyle}>Patient name *</label>
          <input type="text" value={form.patientName} placeholder="e.g. Ava"
            onChange={e => set('patientName', e.target.value)}
            style={inputStyle}/>
        </div>
        <div>
          <label style={labelStyle}>
            Date of birth
            <input type="date" value={form.patientDob}
              onChange={e => set('patientDob', e.target.value)}
              style={{ ...inputStyle, marginTop: 4 }}/>
          </label>
        </div>
        <div>
          <label style={labelStyle}>
            Date of diagnosis
            <input type="date" value={form.diagnosisDate}
              onChange={e => set('diagnosisDate', e.target.value)}
              style={{ ...inputStyle, marginTop: 4 }}/>
          </label>
        </div>
        <div>
          <label style={labelStyle}>Diabetes type</label>
          {segmentedControl(
            [{ value: 'T1D', label: 'T1D' }, { value: 'T2D', label: 'T2D' },
             { value: 'Gestational', label: 'Gest.' }, { value: 'Other', label: 'Other' }],
            form.diabetesType, v => set('diabetesType', v)
          )}
        </div>
      </div>

      {/* Section 2: Glucose Targets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sectionHeader('Glucose targets', 'Target blood sugar range')}
        <div>
          <label style={labelStyle}>Range low</label>
          <input type="number" value={form.rangeLow} inputMode="numeric"
            onChange={e => set('rangeLow', e.target.value)}
            style={inputStyle}/>
        </div>
        <div>
          <label style={labelStyle}>Range high</label>
          <input type="number" value={form.rangeHigh} inputMode="numeric"
            onChange={e => set('rangeHigh', e.target.value)}
            style={inputStyle}/>
        </div>
        <div>
          <label style={labelStyle}>Unit</label>
          {segmentedControl(
            [{ value: 'mg/dL', label: 'mg/dL' }, { value: 'mmol/L', label: 'mmol/L' }],
            form.unit, v => set('unit', v)
          )}
        </div>
      </div>

      {/* Section 3: Insulin Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sectionHeader('Insulin settings', 'Carb ratios and dosing')}

        {/* Carb ratios — default card */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.inkMute, marginBottom: 10 }}>
            {defaultLabel}
          </div>
          {mealInputs(form.carbRatios.default, setCarbDefault)}
        </div>

        {/* Override cards */}
        {form.carbRatios.overrides.map((override, idx) => (
          <div key={idx} style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.inkMute, marginBottom: 10 }}>
              {override.days.length > 0
                ? override.days.map(d => DAY_LABELS[d]).join(', ')
                : 'Select days'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {DAY_LETTERS.map((letter, dayIdx) => {
                const selected = override.days.includes(dayIdx);
                return (
                  <button key={dayIdx} onClick={() => toggleDay(idx, dayIdx)} style={{
                    width: 36, height: 36, borderRadius: 999, border: selected ? 0 : `0.5px solid ${theme.line}`,
                    background: selected ? theme.primary : theme.surface,
                    color: selected ? '#fff' : theme.ink,
                    fontSize: 13, fontWeight: 700, fontFamily: theme.uiFont,
                    cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {letter}
                  </button>
                );
              })}
            </div>
            {mealInputs(override, (meal, val) => setCarbOverride(idx, meal, val))}
            <button onClick={() => removeOverride(idx)} style={{
              background: 'transparent', border: 0, color: theme.inkMute,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: theme.uiFont,
              marginTop: 12, padding: 0,
            }}>
              Remove
            </button>
          </div>
        ))}

        {!hasOverride && (
          <button onClick={addOverride} style={{
            background: 'transparent', border: 0, color: theme.primary,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: theme.uiFont,
            padding: 0, textAlign: 'left',
          }}>
            + Different ratios for some days
          </button>
        )}

        <div>
          <label style={labelStyle}>Correction factor</label>
          <input type="number" value={form.correctionFactor} placeholder="e.g. 50"
            inputMode="decimal"
            onChange={e => set('correctionFactor', e.target.value)}
            style={inputStyle}/>
        </div>
        <div>
          <label style={labelStyle}>Long-acting dose</label>
          <input type="number" value={form.longActingDose} placeholder="e.g. 6"
            inputMode="decimal"
            onChange={e => set('longActingDose', e.target.value)}
            style={inputStyle}/>
        </div>
        <div>
          <label style={labelStyle}>
            Long-acting time
            <input type="time" value={form.longActingTime}
              onChange={e => set('longActingTime', e.target.value)}
              style={{ ...inputStyle, marginTop: 4 }}/>
          </label>
        </div>
      </div>

      {/* Footer — Save + Sign out */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
        <Btn variant="primary" theme={theme} size="lg" full
             onClick={handleSave}
             style={{ opacity: canSave ? 1 : 0.4, pointerEvents: canSave ? 'auto' : 'none' }}>
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
        </Btn>
        <button onClick={onSignOut} style={{
          background: 'transparent', border: 0, color: theme.status.out.fg,
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: theme.uiFont,
          padding: '8px 0', textAlign: 'center',
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

window.ProfilePage = ProfilePage;
