import { ATHLETE_ID, BASE_URL, getAuthHeader } from '../../lib/intervals'

export default async function handler(req, res) {
  try {
    const headers = getAuthHeader()

    // Fetch fitness data (CTL/ATL/TSB)
    const oldest = new Date()
    oldest.setDate(oldest.getDate() - 120)
    const from = oldest.toISOString().split('T')[0]
    const to = new Date()
    to.setDate(to.getDate() + 20)
    const toStr = to.toISOString().split('T')[0]

    const [fitnessRes, activitiesRes, athleteRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/athlete/${ATHLETE_ID}/fitness-data?oldest=${from}&newest=${toStr}`, { headers }),
      fetch(`${BASE_URL}/athlete/${ATHLETE_ID}/activities?oldest=${from}&newest=${toStr}`, { headers }),
      fetch(`${BASE_URL}/athlete/${ATHLETE_ID}`, { headers }),
    ])

    // Parse fitness/PMC data
    let pmc = []
    if (fitnessRes.status === 'fulfilled' && fitnessRes.value.ok) {
      const raw = await fitnessRes.value.json()
      pmc = (Array.isArray(raw) ? raw : []).map(d => ({
        date: d.id || d.date,
        ctl: Math.round(d.ctl || 0),
        atl: Math.round(d.atl || 0),
        tsb: Math.round((d.ctl || 0) - (d.atl || 0)),
        tss: Math.round(d.tss || 0),
      }))
    }

    // Parse activities for weekly TSS
    let activities = []
    if (activitiesRes.status === 'fulfilled' && activitiesRes.value.ok) {
      activities = await activitiesRes.value.json()
    }

    // Group by week
    const weekMap = {}
    ;(Array.isArray(activities) ? activities : []).forEach(act => {
      if (!act.start_date_local) return
      const d = new Date(act.start_date_local)
      const dayOfWeek = d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
      const weekKey = monday.toISOString().split('T')[0]
      if (!weekMap[weekKey]) weekMap[weekKey] = { week: weekKey, tss: 0, rides: 0, hours: 0 }
      weekMap[weekKey].tss += Math.round(act.icu_training_load || act.tss || 0)
      weekMap[weekKey].rides += 1
      weekMap[weekKey].hours = Math.round((weekMap[weekKey].hours * 3600 + (act.elapsed_time || act.moving_time || 0)) / 3600 * 10) / 10
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

    // Latest PMC values
    const latest = pmc.filter(d => d.date <= new Date().toISOString().split('T')[0]).slice(-1)[0] || {}

    res.status(200).json({
      pmc,
      weeks,
      athlete,
      latest: {
        ctl: latest.ctl,
        atl: latest.atl,
        tsb: latest.tsb,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
