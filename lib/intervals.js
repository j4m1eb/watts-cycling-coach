const ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID || '98700'
const API_KEY = process.env.INTERVALS_API_KEY || '3p6nu8zruicyer3lgvkufvpti'
const BASE_URL = 'https://intervals.icu/api/v1'

export function getAuthHeader() {
  const token = Buffer.from(`API_KEY:${API_KEY}`).toString('base64')
  return { Authorization: `Basic ${token}` }
}

export { ATHLETE_ID, BASE_URL }
