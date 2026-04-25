// Mock pediatric T1D data (3 days seeded)

const NOW = new Date('2026-04-24T16:30:00');
const dayMs = 24 * 60 * 60 * 1000;

const t = (daysAgo, h, m) => {
  const d = new Date(NOW.getTime() - daysAgo * dayMs);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const MOCK_ENTRIES = [
  // TODAY
  { id: 'g1', kind: 'glucose', ts: t(0, 7, 15), bg: 168, cgm: 175, note: 'fasting' },
  { id: 'i1', kind: 'insulin', ts: t(0, 7, 25), insulinType: 'basal', units: 6, site: 'thigh-L' },
  { id: 'i2', kind: 'insulin', ts: t(0, 7, 40), insulinType: 'bolus', units: 3.5, site: 'abdomen-L', mealContext: 'pre' },
  { id: 'g2', kind: 'glucose', ts: t(0, 9, 30), bg: 142, cgm: 138 },
  { id: 'g3', kind: 'glucose', ts: t(0, 12, 5), bg: 98, cgm: 105, note: 'before lunch' },
  { id: 'i3', kind: 'insulin', ts: t(0, 12, 15), insulinType: 'bolus', units: 4, site: 'arm-R', mealContext: 'pre' },
  { id: 'g4', kind: 'glucose', ts: t(0, 14, 20), bg: 215, cgm: 198, note: 'birthday cake at school' },
  { id: 'i4', kind: 'insulin', ts: t(0, 14, 30), insulinType: 'bolus', units: 1.5, site: 'abdomen-R', mealContext: 'post' },
  { id: 'g5', kind: 'glucose', ts: t(0, 16, 0), bg: 156, cgm: 161 },

  // YESTERDAY
  { id: 'g6', kind: 'glucose', ts: t(1, 7, 0), bg: 182, cgm: 188 },
  { id: 'i5', kind: 'insulin', ts: t(1, 7, 10), insulinType: 'basal', units: 6, site: 'thigh-R' },
  { id: 'i6', kind: 'insulin', ts: t(1, 7, 30), insulinType: 'bolus', units: 4, site: 'abdomen-L', mealContext: 'pre' },
  { id: 'g7', kind: 'glucose', ts: t(1, 10, 0), bg: 124, cgm: 119 },
  { id: 'g8', kind: 'glucose', ts: t(1, 12, 30), bg: 110, cgm: 113 },
  { id: 'i7', kind: 'insulin', ts: t(1, 12, 40), insulinType: 'bolus', units: 3.5, site: 'arm-L', mealContext: 'pre' },
  { id: 'g9', kind: 'glucose', ts: t(1, 15, 0), bg: 88, cgm: 95, note: 'after soccer practice' },
  { id: 'g10', kind: 'glucose', ts: t(1, 18, 30), bg: 134, cgm: 140 },
  { id: 'i8', kind: 'insulin', ts: t(1, 18, 40), insulinType: 'bolus', units: 4.5, site: 'abdomen-R', mealContext: 'pre' },
  { id: 'g11', kind: 'glucose', ts: t(1, 21, 0), bg: 145, cgm: 152, note: 'bedtime' },

  // 2 DAYS AGO
  { id: 'g12', kind: 'glucose', ts: t(2, 7, 30), bg: 195, cgm: 201 },
  { id: 'i9', kind: 'insulin', ts: t(2, 7, 40), insulinType: 'basal', units: 6, site: 'thigh-L' },
  { id: 'i10', kind: 'insulin', ts: t(2, 7, 55), insulinType: 'bolus', units: 4, site: 'abdomen-R', mealContext: 'pre' },
  { id: 'g13', kind: 'glucose', ts: t(2, 11, 0), bg: 64, cgm: 78, note: 'felt shaky — juice' },
  { id: 'g14', kind: 'glucose', ts: t(2, 12, 0), bg: 128, cgm: 122 },
  { id: 'i11', kind: 'insulin', ts: t(2, 12, 15), insulinType: 'bolus', units: 3, site: 'arm-R', mealContext: 'pre' },
  { id: 'g15', kind: 'glucose', ts: t(2, 16, 0), bg: 167, cgm: 159 },
  { id: 'g16', kind: 'glucose', ts: t(2, 19, 0), bg: 152, cgm: 148 },
  { id: 'i12', kind: 'insulin', ts: t(2, 19, 15), insulinType: 'bolus', units: 4, site: 'abdomen-L', mealContext: 'pre' },
  { id: 'g17', kind: 'glucose', ts: t(2, 21, 30), bg: 138, cgm: 145 },
];

window.MOCK_ENTRIES = MOCK_ENTRIES;
