// Server-side Intervals.icu API calls
// API key never exposed to browser

const BASE = 'https://intervals.icu/api/v1'
const ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID || '98700'
const API_KEY = process.env.INTERVALS_API_KEY || '3p6nu8zruicyer3lgvkufvpti'

// Debug: log what we're actually using (sanitized)
if (typeof console !== 'undefined') {
  console.log('[intervals.js] Using athlete ID:', ATHLETE_ID)
  console.log('[intervals.js] API key present:', !!API_KEY, 'length:', API_KEY?.length)
}

function authHeader() {
  const encoded = Buffer.from(`API_KEY:${API_KEY}`).toString('base64')
  return { 'Authorization': `Basic ${encoded}`, 'Content-Type': 'application/json' }
}

async function fetchICU(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeader() })
  if (!res.ok) {
    const body = await res.text().catch(() => 'no body')
    console.error(`Intervals.icu API error ${res.status} on ${path}: ${body}`)
    throw new Error(`Intervals.icu API error: ${res.status} ${path}`)
  }
  return res.json()
}

async function postICU(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Intervals.icu POST error: ${res.status} ${path}`)
  return res.json()
}

async function putICU(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Intervals.icu PUT error: ${res.status} ${path}`)
  return res.json()
}

// ─── ATHLETE ───────────────────────────────────────────────────────────────

export async function getAthlete() {
  return fetchICU(`/athlete/${ATHLETE_ID}`)
}

// ─── ACTIVITIES ────────────────────────────────────────────────────────────

export async function getActivities({ oldest, newest } = {}) {
  const params = new URLSearchParams()
  if (oldest) params.set('oldest', oldest)
  if (newest) params.set('newest', newest)
  // Request key fields
  params.set('fields', 'id,start_date_local,name,type,moving_time,distance,icu_training_load,icu_atl,icu_ctl,average_watts,max_watts,normalized_power,intensity_factor,tss,hrss,zone_times,description')
  return fetchICU(`/athlete/${ATHLETE_ID}/activities?${params}`)
}

export async function getActivity(activityId) {
  return fetchICU(`/activity/${activityId}`)
}

// Get last 90 days of activities for PMC calculation
export async function getRecentActivities() {
  const newest = new Date().toISOString().split('T')[0]
  const oldest = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return getActivities({ oldest, newest })
}

// ─── WELLNESS ──────────────────────────────────────────────────────────────

export async function getWellness({ oldest, newest } = {}) {
  const params = new URLSearchParams()
  if (oldest) params.set('oldest', oldest)
  if (newest) params.set('newest', newest)
  return fetchICU(`/athlete/${ATHLETE_ID}/wellness?${params}`)
}

export async function getRecentWellness() {
  const newest = new Date().toISOString().split('T')[0]
  const oldest = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return getWellness({ oldest, newest })
}

// ─── EVENTS / CALENDAR ─────────────────────────────────────────────────────

export async function getEvents({ oldest, newest } = {}) {
  const params = new URLSearchParams()
  if (oldest) params.set('oldest', oldest)
  if (newest) params.set('newest', newest)
  return fetchICU(`/athlete/${ATHLETE_ID}/events?${params}`)
}

export async function getUpcomingEvents() {
  const oldest = new Date().toISOString().split('T')[0]
  const newest = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return getEvents({ oldest, newest })
}

// Post a new workout to calendar
export async function postWorkout(workout) {
  // workout shape: { start_date_local, name, description, type, moving_time, icu_training_load }
  return postICU(`/athlete/${ATHLETE_ID}/events`, workout)
}

// Update an existing event
export async function updateEvent(eventId, data) {
  return putICU(`/athlete/${ATHLETE_ID}/events/${eventId}`, data)
}

// ─── SUMMARY DATA FOR DASHBOARD ────────────────────────────────────────────

export async function getDashboardData() {
  const [activities, wellness, events] = await Promise.all([
    getRecentActivities().catch(() => []),
    getRecentWellness().catch(() => []),
    getUpcomingEvents().catch(() => []),
  ])
  return { activities, wellness, events }
}
