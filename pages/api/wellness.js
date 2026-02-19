import { ATHLETE_ID, BASE_URL, getAuthHeader } from '../../lib/intervals'

export default async function handler(req, res) {
  try {
    const oldest = new Date()
    oldest.setDate(oldest.getDate() - 60)
    const from = oldest.toISOString().split('T')[0]
    const to = new Date().toISOString().split('T')[0]

    const url = `${BASE_URL}/athlete/${ATHLETE_ID}/wellness?oldest=${from}&newest=${to}`
    const response = await fetch(url, { headers: getAuthHeader() })

    if (!response.ok) {
      return res.status(response.status).json({ error: `Intervals API error: ${response.status}` })
    }

    const data = await response.json()

    // Normalise to { date, rhr, hrv, weight } array
    const wellness = (Array.isArray(data) ? data : []).map(w => ({
      date: w.id || w.date,
      rhr: w.restingHR || w.rhr || null,
      hrv: w.hrv || null,
      weight: w.weight || null,
    })).filter(w => w.rhr || w.hrv || w.weight)

    res.status(200).json({ wellness })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
