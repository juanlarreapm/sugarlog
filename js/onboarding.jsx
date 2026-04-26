// onboarding.jsx — 3-step onboarding wizard for new users

function OnboardingFlow({ theme, onComplete }) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    patientName: '',
    patientDob: '',
    diagnosisDate: '',
    diabetesType: 'T1D',
    rangeLow: 70,
    rangeHigh: 150,
    unit: 'mg/dL',
    carbRatios: {
      default: { breakfast: '', lunch: '', dinner: '', snack: '' },
      overrides: [],
    },
    correctionFactor: '',
    longActingDose: '',
    longActingTime: '',
  });

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

  const canNext = step === 1 ? form.patientName.trim().length > 0 : true;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const profile = {
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
      onComplete(profile);
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: theme.bg, fontFamily: theme.uiFont,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
      }}>
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} style={{
            background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
            color: theme.ink, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 15, fontWeight: 600, fontFamily: theme.uiFont,
          }}>
            <Ic.chevL width="20" height="20"/> Back
          </button>
        ) : <div style={{ width: 60 }}/>}
        <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkMute, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {step} of 3
        </div>
        <div style={{ width: 60 }}/>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 120px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
              <SugarlogMark theme={theme} size={28}/>
              <div style={{
                fontSize: 24, fontWeight: 800, color: theme.ink,
                letterSpacing: -0.5, marginTop: 16,
              }}>Welcome to Sugarlog</div>
              <div style={{ fontSize: 14, color: theme.inkMute, marginTop: 4, fontWeight: 500 }}>
                Let's set up your profile
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '8px 0' }}>
              <div style={{
                fontSize: 24, fontWeight: 800, color: theme.ink,
                letterSpacing: -0.5,
              }}>Glucose targets</div>
              <div style={{ fontSize: 14, color: theme.inkMute, marginTop: 4, fontWeight: 500 }}>
                Set your target blood sugar range
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '8px 0' }}>
              <div style={{
                fontSize: 24, fontWeight: 800, color: theme.ink,
                letterSpacing: -0.5,
              }}>Insulin settings</div>
              <div style={{ fontSize: 14, color: theme.inkMute, marginTop: 4, fontWeight: 500 }}>
                All fields are optional — you can update these later
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Carb ratios — default card */}
              {(() => {
                const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
                const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
                const MEAL_PLACEHOLDERS = { breakfast: 'e.g. 10', lunch: 'e.g. 12', dinner: 'e.g. 10', snack: 'e.g. 15' };

                const overrideDays = form.carbRatios.overrides.flatMap(o => o.days);
                const remainingDays = [0,1,2,3,4,5,6].filter(d => !overrideDays.includes(d));
                const hasOverride = form.carbRatios.overrides.length > 0;

                const defaultLabel = hasOverride
                  ? remainingDays.map(d => DAY_LABELS[d]).join(', ')
                  : 'Default (all days)';

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

                const cardStyle = {
                  padding: 14, borderRadius: theme.radius.md,
                  border: `0.5px solid ${theme.line}`, background: theme.surface,
                };

                return (
                  <>
                    <div style={cardStyle}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.inkMute, marginBottom: 10 }}>
                        {defaultLabel}
                      </div>
                      {mealInputs(form.carbRatios.default, setCarbDefault)}
                    </div>

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
                  </>
                );
              })()}
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
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div style={{
        padding: '12px 16px 16px', background: theme.bg,
        borderTop: `0.5px solid ${theme.line}`,
        position: 'sticky', bottom: 0,
      }}>
        <Btn variant="primary" theme={theme} size="lg" full
             onClick={handleNext}
             style={{ opacity: canNext ? 1 : 0.4, pointerEvents: canNext ? 'auto' : 'none' }}>
          {step === 3 ? 'Get started' : 'Next'}
        </Btn>
      </div>
    </div>
  );
}

window.OnboardingFlow = OnboardingFlow;
