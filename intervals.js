const ATHLETE_ID = '98700'
const API_KEY = '3p6nu8zruicyer3lgvkufvpti'
const BASE_URL = 'https://intervals.icu/api/v1'

export function getAuthHeader() {
  const token = Buffer.from(`API_KEY:${API_KEY}`).toString('base64')
  return {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

export { ATHLETE_ID, BASE_URL }
