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
      const body = await response.text()
      console.error('[wellness] Failed:', response.status, body)
      // Return empty array rather than crashing the whole page
      return res.status(200).json({ wellness: [], debug: { status: response.status, url, body } })
    }

    const raw = await response.json()

    const wellness = (Array.isArray(raw) ? raw : []).map(w => ({
      date: w.id,
      rhr: w.restingHR || null,
      hrv: w.hrv || null,
      weight: w.weight || null,
    })).filter(w => w.rhr || w.hrv || w.weight)

    res.status(200).json({ wellness })
  } catch (err) {
    console.error('[wellness] Exception:', err.message)
    res.status(200).json({ wellness: [], debug: { error: err.message } })
  }
}
