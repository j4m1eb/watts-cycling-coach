import { ATHLETE_ID, BASE_URL, getAuthHeader } from '../../lib/intervals'

export default async function handler(req, res) {
  try {
    const headers = getAuthHeader()

    const oldest = new Date()
    oldest.setDate(oldest.getDate() - 120)
    const from = oldest.toISOString().split('T')[0]
    const to = new Date()
    to.setDate(to.getDate() + 20)
    const toStr = to.toISOString().split('T')[0]

    const [wellnessRes, activitiesRes, athleteRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/athlete/${ATHLETE_ID}/wellness?oldest=${from}&newest=${toStr}`, { headers }),
      fetch(`${BASE_URL}/athlete/${ATHLETE_ID}/activities?oldest=${from}&newest=${toStr}`, { headers }),
      fetch(`${BASE_URL}/athlete/${ATHLETE_ID}`, { headers }),
    ])

    // CTL/ATL/TSB lives in the wellness endpoint as icu_ctl, icu_atl
    let pmc = []
    if (wellnessRes.status === 'fulfilled' && wellnessRes.value.ok) {
      const raw = await wellnessRes.value.json()
      pmc = (Array.isArray(raw) ? raw : []).map(d => ({
        date: d.id,
        ctl: Math.round(d.icu_ctl || 0),
        atl: Math.round(d.icu_atl || 0),
        tsb: Math.round((d.icu_ctl || 0) - (d.icu_atl || 0)),
        tss: Math.round(d.icu_training_load || 0),
      })).filter(d => d.ctl > 0 || d.atl > 0)
    }

    // Activities for weekly TSS
    let activities = []
    if (activitiesRes.status === 'fulfilled' && activitiesRes.value.ok) {
      activities = await activitiesRes.value.json()
    }

    // Group by week
    const weekMap = {}
    ;(Array.isArray(activities) ? activities : []).forEach(act => {
      if (!act.start_date_local) return
      const d = new Date(act.start_date_local)
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const weekKey = monday.toISOString().split('T')[0]
      if (!weekMap[weekKey]) weekMap[weekKey] = { week: weekKey, tss: 0, rides: 0, hours: 0 }
      weekMap[weekKey].tss += Math.round(act.icu_training_load || act.tss || 0)
      weekMap[weekKey].rides += 1
      weekMap[weekKey].hours = Math.round(((weekMap[weekKey].hours * 3600) + (act.elapsed_time || act.moving_time || 0)) / 3600 * 10) / 10
    })
    const weeks = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week))

    // Athlete profile
    let athlete = { ftp: 250 }
    if (athleteRes.status === 'fulfilled' && athleteRes.value.ok) {
      const a = await athleteRes.value.json()
      athlete = {
        name: a.name || 'Jamie',
        ftp: a.ftp || 250,
        weight: a.weight,
      }
    }

    // Latest values
    const today = new Date().toISOString().split('T')[0]
    const latest = pmc.filter(d => d.date <= today).slice(-1)[0] || {}

    res.status(200).json({ pmc, weeks, athlete, latest })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
