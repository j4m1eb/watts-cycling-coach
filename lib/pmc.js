import { PMC } from './athlete'

/**
 * Calculate CTL/ATL/TSB from an array of daily TSS values
 * Uses exponentially weighted moving averages — same maths as TrainingPeaks/Intervals.icu
 *
 * @param {Array} days - Array of { date: 'YYYY-MM-DD', tss: number }
 * @returns {Array} - Array of { date, tss, ctl, atl, tsb }
 */
export function calculatePMC(days) {
  if (!days || days.length === 0) return []

  // Sort by date ascending
  const sorted = [...days].sort((a, b) => new Date(a.date) - new Date(b.date))

  // EWM factors
  const ctlFactor = 1 - Math.exp(-1 / PMC.ctlDays)  // 42-day decay
  const atlFactor = 1 - Math.exp(-1 / PMC.atlDays)   // 7-day decay

  let ctl = 0
  let atl = 0

  return sorted.map(day => {
    const tss = day.tss || 0
    ctl = ctl + ctlFactor * (tss - ctl)
    atl = atl + atlFactor * (tss - atl)
    const tsb = ctl - atl  // form = fitness - fatigue

    return {
      date: day.date,
      tss: Math.round(tss),
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
    }
  })
}

/**
 * Project future CTL/ATL/TSB based on planned TSS values
 * Used to forecast race day form
 */
export function projectPMC(historicalPMC, futureDays) {
  if (!historicalPMC || historicalPMC.length === 0) return []

  const last = historicalPMC[historicalPMC.length - 1]
  let ctl = last.ctl
  let atl = last.atl

  const ctlFactor = 1 - Math.exp(-1 / PMC.ctlDays)
  const atlFactor = 1 - Math.exp(-1 / PMC.atlDays)

  return futureDays.map(day => {
    const tss = day.tss || 0
    ctl = ctl + ctlFactor * (tss - ctl)
    atl = atl + atlFactor * (tss - atl)
    const tsb = ctl - atl

    return {
      date: day.date,
      tss: Math.round(tss),
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
      projected: true,
    }
  })
}

/**
 * Get form status label from TSB value
 */
export function getFormStatus(tsb) {
  if (tsb > 25)  return { label: 'Very Fresh',    color: '#4a9eff', risk: 'Undertraining risk' }
  if (tsb > 5)   return { label: 'Fresh',          color: '#00c896', risk: null }
  if (tsb > -10) return { label: 'Optimal',        color: '#c8f000', risk: null }
  if (tsb > -25) return { label: 'Tired',          color: '#ff7a00', risk: 'Accumulating fatigue' }
  if (tsb > -40) return { label: 'Very Tired',     color: '#ff3b3b', risk: 'Recovery needed' }
  return           { label: 'Overreaching',        color: '#cc00ff', risk: 'Back off immediately' }
}

/**
 * Calculate zone distribution from activities
 */
export function calculateZoneDistribution(activities, zones) {
  const dist = {}
  Object.keys(zones).forEach(z => dist[z] = 0)

  activities.forEach(act => {
    if (!act.zone_times) return
    Object.keys(act.zone_times).forEach(z => {
      if (dist[z] !== undefined) dist[z] += act.zone_times[z] || 0
    })
  })

  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  return Object.entries(dist).map(([zone, seconds]) => ({
    zone,
    seconds,
    minutes: Math.round(seconds / 60),
    percent: total > 0 ? Math.round((seconds / total) * 100) : 0,
    ...zones[zone],
  }))
}

/**
 * Calculate weekly TSS totals
 */
export function weeklyTSS(activities) {
  const weeks = {}
  activities.forEach(act => {
    const date = new Date(act.start_date_local || act.date)
    // Get Monday of that week
    const day = date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    const key = monday.toISOString().split('T')[0]
    if (!weeks[key]) weeks[key] = { week: key, tss: 0, hours: 0, rides: 0 }
    weeks[key].tss += act.icu_training_load || act.tss || 0
    weeks[key].hours += (act.moving_time || act.elapsed_time || 0) / 3600
    weeks[key].rides += 1
  })
  return Object.values(weeks)
    .sort((a, b) => new Date(a.week) - new Date(b.week))
    .map(w => ({
      ...w,
      tss: Math.round(w.tss),
      hours: Math.round(w.hours * 10) / 10,
    }))
}
