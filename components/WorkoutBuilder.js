import { useState } from 'react'
import { ATHLETE } from '../lib/athlete'

const WORKOUT_TEMPLATES = [
  {
    name: 'Sweet Spot 2x20',
    type: 'Ride',
    tss: 85,
    duration: 75 * 60,
    description: 'Warm up 15min Z2\n2x20min @ 215-225w (SS) / 5min recovery Z2\nCool down 10min Z1',
    intervals: [
      { name: 'Warm Up', duration: 15, watts: 170, zone: 'z2' },
      { name: 'Sweet Spot', duration: 20, watts: 220, zone: 'z4', repeats: 2, recovery: { duration: 5, watts: 150 } },
      { name: 'Cool Down', duration: 10, watts: 130, zone: 'z1' },
    ]
  },
  {
    name: 'VO2max 5x4',
    type: 'Ride',
    tss: 95,
    duration: 70 * 60,
    description: 'Warm up 15min Z2\n5x4min @ 255-265w (VO2) / 4min recovery Z1-2\nCool down 10min Z1',
    intervals: [
      { name: 'Warm Up', duration: 15, watts: 170, zone: 'z2' },
      { name: 'VO2max', duration: 4, watts: 260, zone: 'z5', repeats: 5, recovery: { duration: 4, watts: 130 } },
      { name: 'Cool Down', duration: 10, watts: 130, zone: 'z1' },
    ]
  },
  {
    name: 'Threshold 4x8',
    type: 'Ride',
    tss: 90,
    duration: 75 * 60,
    description: 'Warm up 15min Z2\n4x8min @ 235-245w (CP) / 4min Z2\nCool down 10min Z1',
    intervals: [
      { name: 'Warm Up', duration: 15, watts: 170, zone: 'z2' },
      { name: 'Threshold', duration: 8, watts: 240, zone: 'z5', repeats: 4, recovery: { duration: 4, watts: 165 } },
      { name: 'Cool Down', duration: 10, watts: 130, zone: 'z1' },
    ]
  },
  {
    name: 'Calpe Endurance',
    type: 'Ride',
    tss: 110,
    duration: 180 * 60,
    description: 'Long aerobic ride — Calpe climbing\n3h Z2 / Z3 mix, stay below threshold on climbs\nTarget: 140-175w average',
    intervals: [
      { name: 'Endurance Block', duration: 180, watts: 165, zone: 'z2' },
    ]
  },
  {
    name: 'Crit Openers',
    type: 'Ride',
    tss: 55,
    duration: 60 * 60,
    description: 'Pre-race activation — day before crit\n45min Z2 with 4x15sec max sprints\nStay fresh, wake up the legs',
    intervals: [
      { name: 'Warm Up', duration: 20, watts: 165, zone: 'z2' },
      { name: 'Sprints', duration: 1, watts: 480, zone: 'z6', repeats: 4, recovery: { duration: 5, watts: 140 } },
      { name: 'Spin Down', duration: 15, watts: 140, zone: 'z1' },
    ]
  },
]

export default function WorkoutBuilder({ onPost }) {
  const [selected, setSelected] = useState(null)
  const [date, setDate] = useState('2026-02-21')
  const [custom, setCustom] = useState({ name: '', description: '', tss: 80, duration: 60, type: 'Ride' })
  const [mode, setMode] = useState('template') // 'template' | 'custom'

  const workout = mode === 'template' ? WORKOUT_TEMPLATES[selected] : null

  const handlePost = () => {
    if (mode === 'template' && selected !== null) {
      onPost({
        date,
        name: workout.name,
        description: workout.description,
        tss: workout.tss,
        duration: workout.duration,
        type: workout.type,
      })
    } else if (mode === 'custom' && custom.name) {
      onPost({
        date,
        ...custom,
        duration: custom.duration * 60,
      })
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.title}>WORKOUT BUILDER</div>
        <div style={styles.sub}>Design workouts and push directly to your Intervals.icu calendar</div>
      </div>

      {/* Mode toggle */}
      <div style={styles.modeRow}>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'template' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('template')}
        >Templates</button>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'custom' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('custom')}
        >Custom</button>
      </div>

      <div style={styles.grid}>
        {/* Left: selector */}
        <div style={styles.left}>
          {mode === 'template' ? (
            <>
              <div style={styles.sectionLabel}>SELECT TEMPLATE</div>
              {WORKOUT_TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  style={{ ...styles.templateCard, ...(selected === i ? styles.templateSelected : {}) }}
                  onClick={() => setSelected(i)}
                >
                  <div style={styles.templateName}>{t.name}</div>
                  <div style={styles.templateMeta}>
                    <span style={styles.tag}>{Math.round(t.duration / 60)}min</span>
                    <span style={styles.tag}>TSS {t.tss}</span>
                    <span style={{ ...styles.tag, background: 'rgba(200,240,0,0.15)', color: '#c8f000' }}>{t.type}</span>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <>
              <div style={styles.sectionLabel}>CUSTOM WORKOUT</div>
              <input style={styles.input} placeholder="Workout name" value={custom.name} onChange={e => setCustom(c => ({ ...c, name: e.target.value }))} />
              <textarea style={{ ...styles.input, height: 100, resize: 'vertical' }} placeholder="Description / intervals..." value={custom.description} onChange={e => setCustom(c => ({ ...c, description: e.target.value }))} />
              <div style={styles.row}>
                <Field label="TSS">
                  <input style={styles.input} type="number" value={custom.tss} onChange={e => setCustom(c => ({ ...c, tss: +e.target.value }))} />
                </Field>
                <Field label="Duration (min)">
                  <input style={styles.input} type="number" value={custom.duration} onChange={e => setCustom(c => ({ ...c, duration: +e.target.value }))} />
                </Field>
                <Field label="Type">
                  <select style={styles.input} value={custom.type} onChange={e => setCustom(c => ({ ...c, type: e.target.value }))}>
                    <option>Ride</option>
                    <option>VirtualRide</option>
                    <option>Run</option>
                  </select>
                </Field>
              </div>
            </>
          )}
        </div>

        {/* Right: detail + post */}
        <div style={styles.right}>
          {mode === 'template' && selected !== null && workout && (
            <>
              <div style={styles.sectionLabel}>WORKOUT DETAIL</div>
              <div style={styles.detailCard}>
                <div style={styles.detailName}>{workout.name}</div>
                <div style={styles.detailStats}>
                  <Stat label="Duration" value={Math.round(workout.duration / 60) + ' min'} />
                  <Stat label="TSS" value={workout.tss} />
                  <Stat label="IF" value={(Math.sqrt(workout.tss / (workout.duration / 3600) / 100)).toFixed(2)} />
                </div>

                {/* Interval visualisation */}
                <div style={styles.sectionLabel}>INTERVAL DIAGRAM</div>
                <IntervalViz intervals={workout.intervals} />

                <div style={styles.sectionLabel}>DESCRIPTION</div>
                <div style={styles.descText}>{workout.description}</div>
              </div>
            </>
          )}

          {mode === 'custom' && (
            <div style={styles.powerZones}>
              <div style={styles.sectionLabel}>YOUR POWER ZONES (CP 240w)</div>
              {Object.entries(ATHLETE.zones).map(([key, zone]) => (
                <div key={key} style={styles.zoneRow}>
                  <div style={{ width: 3, height: 24, background: zone.color, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#e6e6ea' }}>{zone.name}</div>
                  </div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#9898a8' }}>
                    {zone.min}–{zone.max === 999 ? '∞' : zone.max}w
                  </div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#6b6b7a', width: 60, textAlign: 'right' }}>
                    {Math.round(zone.min / ATHLETE.cp * 100)}–{zone.max === 999 ? '120+' : Math.round(zone.max / ATHLETE.cp * 100)}% CP
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Post to calendar */}
          <div style={styles.postBox}>
            <div style={styles.sectionLabel}>POST TO CALENDAR</div>
            <div style={styles.row}>
              <Field label="Date">
                <input
                  style={styles.input}
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </Field>
            </div>
            <button
              style={{
                ...styles.postBtn,
                opacity: (mode === 'template' ? selected !== null : custom.name) ? 1 : 0.4,
              }}
              onClick={handlePost}
              disabled={mode === 'template' ? selected === null : !custom.name}
            >
              → POST TO INTERVALS.ICU
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntervalViz({ intervals }) {
  // Expand repeats for visualisation
  const expanded = []
  intervals.forEach(interval => {
    const count = interval.repeats || 1
    for (let i = 0; i < count; i++) {
      expanded.push(interval)
      if (interval.recovery && i < count - 1) {
        expanded.push({ name: 'Recovery', duration: interval.recovery.duration, watts: interval.recovery.watts, zone: 'z1', isRecovery: true })
      }
    }
  })

  const maxWatts = Math.max(...expanded.map(i => i.watts), 300)
  const totalDuration = expanded.reduce((s, i) => s + i.duration, 0)

  return (
    <div style={viz.wrap}>
      <div style={viz.bars}>
        {expanded.map((interval, i) => {
          const widthPct = (interval.duration / totalDuration) * 100
          const heightPct = (interval.watts / maxWatts) * 100
          const zone = ATHLETE.zones[interval.zone] || ATHLETE.zones.z1
          return (
            <div key={i} style={{ ...viz.barWrap, width: widthPct + '%' }}>
              <div style={{ ...viz.bar, height: heightPct + '%', background: zone.color, opacity: interval.isRecovery ? 0.4 : 0.85 }}>
                {widthPct > 8 && (
                  <span style={viz.barLabel}>{interval.watts}w</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div style={viz.baseline} />
      <div style={viz.totalLabel}>{totalDuration} min total</div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', background: '#1e1e24', borderRadius: 8, padding: '10px 16px' }}>
      <div style={{ fontFamily: 'DM Mono', fontSize: 20, color: '#c8f000' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#6b6b7a', marginTop: 2, letterSpacing: 1 }}>{label}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 1, color: '#6b6b7a', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  header: {},
  title: { fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 3, color: '#e6e6ea', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6b6b7a' },
  modeRow: { display: 'flex', gap: 8 },
  modeBtn: { padding: '6px 16px', background: '#1e1e24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, color: '#6b6b7a', fontFamily: 'DM Mono', fontSize: 12, cursor: 'pointer' },
  modeBtnActive: { background: 'rgba(200,240,0,0.15)', borderColor: 'rgba(200,240,0,0.4)', color: '#c8f000' },
  grid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 },
  left: { display: 'flex', flexDirection: 'column', gap: 8 },
  right: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionLabel: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 2, color: '#6b6b7a', marginBottom: 8, textTransform: 'uppercase' },
  templateCard: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.1s' },
  templateSelected: { border: '1px solid rgba(200,240,0,0.5)', background: 'rgba(200,240,0,0.05)' },
  templateName: { fontSize: 13, color: '#e6e6ea', marginBottom: 6, fontWeight: 500 },
  templateMeta: { display: 'flex', gap: 6 },
  tag: { fontFamily: 'DM Mono', fontSize: 10, background: '#1e1e24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '2px 6px', color: '#9898a8' },
  detailCard: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px' },
  detailName: { fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 2, color: '#e6e6ea', marginBottom: 12 },
  detailStats: { display: 'flex', gap: 10, marginBottom: 16 },
  descText: { fontFamily: 'DM Mono', fontSize: 11, color: '#9898a8', lineHeight: 1.8, whiteSpace: 'pre-line' },
  postBox: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px', marginTop: 'auto' },
  postBtn: { width: '100%', background: '#c8f000', color: '#09090b', border: 'none', borderRadius: 8, padding: '12px 0', fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, cursor: 'pointer', transition: 'opacity 0.2s' },
  input: { width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 10px', color: '#e6e6ea', fontSize: 13, fontFamily: 'DM Mono', marginBottom: 8, outline: 'none' },
  row: { display: 'flex', gap: 8 },
  powerZones: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16 },
  zoneRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
}

const viz = {
  wrap: { background: '#111113', borderRadius: 8, padding: '12px', marginBottom: 16 },
  bars: { display: 'flex', alignItems: 'flex-end', height: 100, gap: 2 },
  barWrap: { height: '100%', display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: '3px 3px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3, minHeight: 4, position: 'relative', transition: 'height 0.3s' },
  barLabel: { fontFamily: 'DM Mono', fontSize: 8, color: 'rgba(0,0,0,0.7)', fontWeight: 600 },
  baseline: { height: 1, background: 'rgba(255,255,255,0.1)', marginTop: 2 },
  totalLabel: { fontFamily: 'DM Mono', fontSize: 9, color: '#6b6b7a', marginTop: 6, textAlign: 'right' },
}
