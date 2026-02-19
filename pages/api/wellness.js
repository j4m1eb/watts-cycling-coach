import { ATHLETE_ID, BASE_URL, getAuthHeader } from '../../lib/intervals'

export default async function handler(req, res) {
  try {
    const oldest = new Date()
    oldest.setDate(oldest.getDate() - 60)
    const from = oldest.toISOString().split('T')[0]
    const to = new Date().toISOString().split('T')[0]

    const response = await fetch(
      `${BASE_URL}/athlete/${ATHLETE_ID}/wellness?oldest=${from}&newest=${to}`,
      { headers: getAuthHeader() }
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: `Intervals API error: ${response.status}` })
    }

    const raw = await response.json()

    // Field names from Intervals.icu wellness endpoint
    const wellness = (Array.isArray(raw) ? raw : []).map(w => ({
      date: w.id,
      rhr: w.restingHR || null,
      hrv: w.hrv || null,
      weight: w.weight || null,
    })).filter(w => w.rhr || w.hrv || w.weight)

    res.status(200).json({ wellness })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
