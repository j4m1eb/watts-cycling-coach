// Athlete profile — lab tested values Feb 2025
export const ATHLETE = {
  id: '98700',
  name: 'Athlete',
  age: 53,
  cp: 240,        // Critical Power (watts) — lab tested
  ftp: 250,       // FTP (watts)
  vo2max: 57,     // ml/kg/min — lab tested, excellent for age 53
  trainingDays: 5,
  preferredLongRideDay: 'weekend',

  // Power zones based on CP 240w (Coggan zones)
  zones: {
    z1: { name: 'Active Recovery', min: 0,   max: 144, color: '#4a9eff' },   // <60% CP
    z2: { name: 'Endurance',       min: 144, max: 192, color: '#00c896' },   // 60-80% CP
    z3: { name: 'Tempo',           min: 192, max: 216, color: '#f5c400' },   // 80-90% CP
    z4: { name: 'Sweet Spot',      min: 216, max: 240, color: '#ff7a00' },   // 90-100% CP
    z5: { name: 'VO2max',          min: 240, max: 288, color: '#ff3b3b' },   // 100-120% CP
    z6: { name: 'Anaerobic',       min: 288, max: 999, color: '#cc00ff' },   // >120% CP
  },

  // Key dates
  timeline: {
    today: '2026-02-17',
    calpeDeparture: '2026-02-20',
    calpeArrival: '2026-02-20',       // travel day
    calpeTrainingStart: '2026-02-21',
    calpeTrainingEnd: '2026-03-02',   // 10 training days
    calpeReturn: '2026-03-03',        // travel day home
    homeReturn: '2026-03-04',
    race1: '2026-03-08',              // First crit of season
    race1Name: 'Season Opener Crit',
  }
}

// CTL/ATL constants
export const PMC = {
  ctlDays: 42,   // Chronic Training Load — fitness
  atlDays: 7,    // Acute Training Load — fatigue
  // TSB (form) = CTL - ATL (positive = fresh, negative = fatigued)
  raceTargetTSB: { min: 0, max: 15 }, // ideal race day form window
}
