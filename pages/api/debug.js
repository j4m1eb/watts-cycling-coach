import { ATHLETE_ID, BASE_URL, getAuthHeader } from '../../lib/intervals'

export default async function handler(req, res) {
  const headers = getAuthHeader()
  const results = {}

  // Show raw wellness response - just last 3 days to see field names
  try {
    const from = new Date(); from.setDate(from.getDate() - 3)
    const to = new Date()
    const url = `${BASE_URL}/athlete/${ATHLETE_ID}/wellness?oldest=${from.toISOString().split('T')[0]}&newest=${to.toISOString().split('T')[0]}`
    const r = await fetch(url, { headers })
    const body = await r.text()
    results.wellness = { status: r.status, raw: body }
  } catch (e) {
    results.wellness = { error: e.message }
  }

  // Show raw activities - just last 3 days
  try {
    const from = new Date(); from.setDate(from.getDate() - 3)
    const to = new Date()
    const url = `${BASE_URL}/athlete/${ATHLETE_ID}/activities?oldest=${from.toISOString().split('T')[0]}&newest=${to.toISOString().split('T')[0]}`
    const r = await fetch(url, { headers })
    const body = await r.text()
    results.activities = { status: r.status, raw: body }
  } catch (e) {
    results.activities = { error: e.message }
  }

  res.status(200).json(results)
}
