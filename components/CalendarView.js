import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

export default function CalendarView({ events = [], activities = [], onPost }) {
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-02-17'))
  const [selected, setSelected] = useState(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  // Index events and activities by date
  const eventsByDate = {}
  events.forEach(e => {
    const d = (e.start_date_local || e.start_date || '').split('T')[0]
    if (d) {
      if (!eventsByDate[d]) eventsByDate[d] = []
      eventsByDate[d].push({ ...e, kind: 'planned' })
    }
  })

  const actByDate = {}
  activities.forEach(a => {
    const d = (a.start_date_local || '').split('T')[0]
    if (d) {
      if (!actByDate[d]) actByDate[d] = []
      actByDate[d].push({ ...a, kind: 'actual' })
    }
  })

  // Camp days
  const isCalpeDay = (date) => {
    const d = format(date, 'yyyy-MM-dd')
    return d >= '2026-02-21' && d <= '2026-03-02'
  }

  const isTravelDay = (date) => {
    const d = format(date, 'yyyy-MM-dd')
    return d === '2026-02-20' || d === '2026-03-03'
  }

  const isRaceDay = (date) => format(date, 'yyyy-MM-dd') === '2026-03-08'
  const isToday = (date) => isSameDay(date, new Date())

  const dayKey = (date) => format(date, 'yyyy-MM-dd')

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.navBtn} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</button>
        <div style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy').toUpperCase()}</div>
        <button style={styles.navBtn} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
      </div>

      {/* Legend */}
      <div style={styles.legendRow}>
        <LegDot color="#c8f000" label="Planned workout" />
        <LegDot color="#00c896" label="Completed" />
        <LegDot color="rgba(200,240,0,0.2)" label="Calpe camp" solid />
        <LegDot color="#ff3b3b" label="Race" />
      </div>

      {/* Day headers */}
      <div style={styles.grid}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={styles.dayHeader}>{d}</div>
        ))}

        {days.map((day, i) => {
          const key = dayKey(day)
          const planned = eventsByDate[key] || []
          const actual = actByDate[key] || []
          const inMonth = isSameMonth(day, currentMonth)
          const camp = isCalpeDay(day)
          const travel = isTravelDay(day)
          const race = isRaceDay(day)
          const today = isToday(day)
          const isSelected = selected === key

          return (
            <div
              key={i}
              style={{
                ...styles.dayCell,
                ...(!inMonth ? styles.otherMonth : {}),
                ...(camp ? styles.campDay : {}),
                ...(travel ? styles.travelDay : {}),
                ...(race ? styles.raceDay : {}),
                ...(today ? styles.todayCell : {}),
                ...(isSelected ? styles.selectedCell : {}),
              }}
              onClick={() => setSelected(isSelected ? null : key)}
            >
              <div style={{ ...styles.dayNum, ...(today ? styles.todayNum : {}) }}>
                {format(day, 'd')}
                {camp && <span style={styles.campTag}>CALPE</span>}
                {travel && <span style={styles.travelTag}>✈</span>}
                {race && <span style={styles.raceTag}>🏁</span>}
              </div>

              {/* Planned */}
              {planned.slice(0, 2).map((e, j) => (
                <div key={j} style={styles.eventChip}>
                  <span style={styles.eventDot} />
                  <span style={styles.eventText}>{e.name || 'Workout'}</span>
                  {e.icu_training_load && <span style={styles.tssTag}>{Math.round(e.icu_training_load)}</span>}
                </div>
              ))}

              {/* Actual */}
              {actual.slice(0, 2).map((a, j) => (
                <div key={j} style={{ ...styles.eventChip, ...styles.actualChip }}>
                  <span style={{ ...styles.eventDot, background: '#00c896' }} />
                  <span style={styles.eventText}>{a.name || 'Ride'}</span>
                  {a.icu_training_load && <span style={{ ...styles.tssTag, color: '#00c896' }}>{Math.round(a.icu_training_load)}</span>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selected && (
        <DayDetail
          date={selected}
          planned={eventsByDate[selected] || []}
          actual={actByDate[selected] || []}
          onPost={onPost}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function DayDetail({ date, planned, actual, onPost, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', duration: 3600, tss: 80, type: 'Ride' })

  const handlePost = () => {
    if (!form.name) return
    onPost({ date, ...form })
    onClose()
  }

  return (
    <div style={detail.overlay}>
      <div style={detail.panel}>
        <div style={detail.header}>
          <div style={detail.title}>{new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <button style={detail.close} onClick={onClose}>✕</button>
        </div>

        {planned.length > 0 && (
          <div style={detail.section}>
            <div style={detail.sectionLabel}>PLANNED</div>
            {planned.map((e, i) => (
              <div key={i} style={detail.item}>
                <div style={{ color: '#c8f000', fontSize: 13 }}>{e.name}</div>
                {e.description && <div style={{ color: '#9898a8', fontSize: 12, marginTop: 4 }}>{e.description}</div>}
                {e.icu_training_load && <div style={detail.meta}>TSS: {Math.round(e.icu_training_load)}</div>}
              </div>
            ))}
          </div>
        )}

        {actual.length > 0 && (
          <div style={detail.section}>
            <div style={detail.sectionLabel}>COMPLETED</div>
            {actual.map((a, i) => (
              <div key={i} style={{ ...detail.item, borderColor: 'rgba(0,200,150,0.2)' }}>
                <div style={{ color: '#00c896', fontSize: 13 }}>{a.name}</div>
                <div style={detail.meta}>
                  TSS: {Math.round(a.icu_training_load || 0)} · 
                  {Math.round(a.average_watts || 0)}w avg · 
                  {Math.round((a.moving_time || 0) / 60)}min
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add workout */}
        <div style={detail.section}>
          <div style={detail.sectionLabel}>ADD WORKOUT TO CALENDAR</div>
          <input
            style={detail.input}
            placeholder="Workout name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <textarea
            style={{ ...detail.input, height: 60, resize: 'vertical' }}
            placeholder="Description / intervals..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div style={detail.row}>
            <div style={detail.field}>
              <label style={detail.fieldLabel}>TSS</label>
              <input
                style={detail.input}
                type="number"
                value={form.tss}
                onChange={e => setForm(f => ({ ...f, tss: +e.target.value }))}
              />
            </div>
            <div style={detail.field}>
              <label style={detail.fieldLabel}>Duration (min)</label>
              <input
                style={detail.input}
                type="number"
                value={Math.round(form.duration / 60)}
                onChange={e => setForm(f => ({ ...f, duration: +e.target.value * 60 }))}
              />
            </div>
            <div style={detail.field}>
              <label style={detail.fieldLabel}>Type</label>
              <select style={detail.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>Ride</option>
                <option>VirtualRide</option>
                <option>Run</option>
              </select>
            </div>
          </div>
          <button style={detail.btn} onClick={handlePost}>+ Add to Intervals.icu</button>
        </div>
      </div>
    </div>
  )
}

function LegDot({ color, label, solid }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: solid ? 3 : '50%', background: color, border: solid ? 'none' : `2px solid ${color}` }} />
      <span style={{ fontSize: 11, color: '#9898a8', fontFamily: 'DM Mono' }}>{label}</span>
    </div>
  )
}

const styles = {
  wrap: { background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, position: 'relative' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthTitle: { fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 3, color: '#e6e6ea' },
  navBtn: { fontFamily: 'DM Mono', fontSize: 20, color: '#6b6b7a', padding: '4px 12px', background: '#1e1e24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, cursor: 'pointer' },
  legendRow: { display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 },
  dayHeader: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 1.5, color: '#6b6b7a', textAlign: 'center', padding: '4px 0 8px' },
  dayCell: {
    minHeight: 80, padding: '6px 8px',
    background: '#18181c', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer', transition: 'all 0.1s',
    overflow: 'hidden',
  },
  otherMonth: { opacity: 0.3 },
  campDay: { background: 'rgba(200,240,0,0.07)', border: '1px solid rgba(200,240,0,0.15)' },
  travelDay: { background: 'rgba(74,158,255,0.07)', border: '1px solid rgba(74,158,255,0.15)' },
  raceDay: { background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)' },
  todayCell: { border: '1px solid rgba(200,240,0,0.5)' },
  selectedCell: { border: '1px solid rgba(200,240,0,0.8)', background: 'rgba(200,240,0,0.05)' },
  dayNum: { fontFamily: 'DM Mono', fontSize: 11, color: '#6b6b7a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 },
  todayNum: { color: '#c8f000' },
  campTag: { fontSize: 7, background: 'rgba(200,240,0,0.2)', color: '#c8f000', padding: '1px 3px', borderRadius: 2, letterSpacing: 0.5 },
  travelTag: { fontSize: 10 },
  raceTag: { fontSize: 10 },
  eventChip: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 },
  actualChip: {},
  eventDot: { width: 5, height: 5, borderRadius: '50%', background: '#c8f000', flexShrink: 0 },
  eventText: { fontSize: 10, color: '#9898a8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  tssTag: { fontFamily: 'DM Mono', fontSize: 9, color: '#6b6b7a' },
}

const detail = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  panel: { background: '#18181c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 480, maxHeight: '80vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: '#e6e6ea' },
  close: { color: '#6b6b7a', fontSize: 18, cursor: 'pointer', padding: '4px 8px', background: '#1e1e24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 2, color: '#6b6b7a', marginBottom: 10 },
  item: { background: '#1e1e24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  meta: { fontFamily: 'DM Mono', fontSize: 11, color: '#6b6b7a', marginTop: 4 },
  input: { width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 10px', color: '#e6e6ea', fontSize: 13, fontFamily: 'DM Mono', marginBottom: 8, outline: 'none' },
  row: { display: 'flex', gap: 8 },
  field: { flex: 1 },
  fieldLabel: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 1, color: '#6b6b7a', display: 'block', marginBottom: 4 },
  btn: { width: '100%', background: '#c8f000', color: '#09090b', border: 'none', borderRadius: 8, padding: '10px 0', fontFamily: 'DM Mono', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 },
}
