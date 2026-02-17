import { postWorkout } from '../../lib/intervals'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { date, name, description, type, duration, tss } = req.body

    if (!date || !name) {
      return res.status(400).json({ error: 'date and name required' })
    }

    const workout = {
      start_date_local: `${date}T07:00:00`,
      name,
      description: description || '',
      type: type || 'Ride',
      moving_time: duration || 3600,
      icu_training_load: tss || 0,
    }

    const result = await postWorkout(workout)
    res.status(200).json({ success: true, event: result })
  } catch (err) {
    console.error('Post workout error:', err)
    res.status(500).json({ error: err.message })
  }
}
