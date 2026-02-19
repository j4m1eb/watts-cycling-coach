import { ATHLETE_ID, BASE_URL, getAuthHeader } from '../../lib/intervals'

export default async function handler(req, res) {
  const headers = getAuthHeader()
  const results = {}

  // Test 1: Athlete endpoint
  try {
    const r = await fetch(`${BASE_URL}/athlete/${ATHLETE_ID}`, { headers })
    results.athlete = { status: r.status, ok: r.ok, body: await r.text() }
  } catch (e) {
    results.athlete = { error: e.message }
  }

  // Test 2: Wellness endpoint (last 7 days only)
  try {
    const from = new Date(); from.setDate(from.getDate() - 7)
    const to = new Date()
    const url = `${BASE_URL}/athlete/${ATHLETE_ID}/wellness?oldest=${from.toISOString().split('T')[0]}&newest=${to.toISOString().split('T')[0]}`
    results.wellnessUrl = url
    const r = await fetch(url, { headers })
    results.wellness = { status: r.status, ok: r.ok, body: await r.text() }
  } catch (e) {
    results.wellness = { error: e.message }
  }

  // Test 3: Activities endpoint (last 7 days)
  try {
    const from = new Date(); from.setDate(from.getDate() - 7)
    const to = new Date()
    const url = `${BASE_URL}/athlete/${ATHLETE_ID}/activities?oldest=${from.toISOString().split('T')[0]}&newest=${to.toISOString().split('T')[0]}`
    results.activitiesUrl = url
    const r = await fetch(url, { headers })
    results.activities = { status: r.status, ok: r.ok, body: await r.text() }
  } catch (e) {
    results.activities = { error: e.message }
  }

  results.athleteId = ATHLETE_ID
  results.baseUrl = BASE_URL

  res.status(200).json(results)
}
