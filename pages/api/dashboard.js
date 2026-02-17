import { getDashboardData } from '../../lib/intervals'
import { calculatePMC, weeklyTSS, projectPMC } from '../../lib/pmc'
import { addDays, format } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { activities, wellness, events } = await getDashboardData()

    // Build daily TSS array for PMC from activities
    const dailyTSS = {}

    activities.forEach(act => {
      const date = (act.start_date_local || '').split('T')[0]
      if (!date) return
      const tss = act.icu_training_load || act.tss || 0
      if (!dailyTSS[date]) dailyTSS[date] = 0
      dailyTSS[date] += tss
    })

    // Also incorporate wellness TSS if available
    wellness.forEach(w => {
      if (w.date && w.ctl !== undefined) {
        // wellness entries may have direct ctl/atl — we use for validation
      }
    })

    const pmcInput = Object.entries(dailyTSS).map(([date, tss]) => ({ date, tss }))
    const pmc = calculatePMC(pmcInput)

    // Project forward to race day (March 8)
    const today = new Date()
    const raceDay = new Date('2026-03-08')
    const futureDays = []

    // Estimate TSS for future days based on camp plan
    for (let d = new Date(today); d <= raceDay; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd')
      const isCalpeTraining = dateStr >= '2026-02-21' && dateStr <= '2026-03-02'
      const isTravelDay = dateStr === '2026-02-20' || dateStr === '2026-03-03'
      const isSharpening = dateStr >= '2026-03-04' && dateStr <= '2026-03-07'

      let projectedTSS = 0
      if (isCalpeTraining) projectedTSS = 100  // solid camp day
      else if (isTravelDay) projectedTSS = 20  // light/rest on travel days
      else if (isSharpening) projectedTSS = 50  // sharpening — moderate

      futureDays.push({ date: dateStr, tss: projectedTSS })
    }

    const projected = projectPMC(pmc, futureDays)
    const weekly = weeklyTSS(activities)

    // Find today's PMC values
    const todayStr = format(today, 'yyyy-MM-dd')
    const todayPMC = pmc.find(p => p.date === todayStr) || pmc[pmc.length - 1] || { ctl: 0, atl: 0, tsb: 0 }

    // Build adherence: compare events (planned) vs activities (actual)
    const adherence = buildAdherence(events, activities)

    res.status(200).json({
      pmc,
      projected,
      weekly,
      activities: activities.slice(0, 20), // last 20 for display
      wellness: wellness.slice(-14),         // last 14 days wellness
      events: events.slice(0, 30),          // next 30 events
      today: todayPMC,
      adherence,
    })
  } catch (err) {
    console.error('Dashboard API error:', err)
    res.status(500).json({ error: err.message })
  }
}

function buildAdherence(events, activities) {
  // Match planned events to actual activities by date
  const actByDate = {}
  activities.forEach(a => {
    const d = (a.start_date_local || '').split('T')[0]
    if (d) actByDate[d] = a
  })

  return events
    .filter(e => e.type === 'Ride' || e.type === 'VirtualRide' || e.type === 'Workout')
    .map(event => {
      const date = event.start_date_local?.split('T')[0] || event.start_date?.split('T')[0]
      const actual = actByDate[date]
      const plannedTSS = event.icu_training_load || event.tss || 0
      const actualTSS = actual ? (actual.icu_training_load || actual.tss || 0) : 0
      const completed = !!actual

      return {
        date,
        plannedName: event.name,
        actualName: actual?.name,
        plannedTSS,
        actualTSS,
        completed,
        adherencePct: plannedTSS > 0 ? Math.round((actualTSS / plannedTSS) * 100) : null,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 14)
}
