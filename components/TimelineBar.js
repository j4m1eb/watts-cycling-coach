export default function TimelineBar() {
  const today = new Date('2026-02-17')
  const events = [
    { date: new Date('2026-02-17'), label: 'Today', color: '#9898a8', icon: '●' },
    { date: new Date('2026-02-20'), label: 'Depart Calpe', color: '#4a9eff', icon: '✈' },
    { date: new Date('2026-02-21'), label: 'Camp Start', color: '#c8f000', icon: '🚴' },
    { date: new Date('2026-03-02'), label: 'Camp End', color: '#c8f000', icon: '🏔' },
    { date: new Date('2026-03-04'), label: 'Home', color: '#4a9eff', icon: '🏠' },
    { date: new Date('2026-03-08'), label: 'Crit Race #1', color: '#ff3b3b', icon: '🏁' },
  ]

  const start = events[0].date
  const end = events[events.length - 1].date
  const totalDays = (end - start) / (1000 * 60 * 60 * 24)

  const getPos = (date) => {
    const days = (date - start) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.min(100, (days / totalDays) * 100))
  }

  const todayPos = getPos(new Date())

  return (
    <div style={styles.wrap}>
      <div style={styles.label}>TIMELINE</div>
      <div style={styles.track}>
        {/* Calpe block */}
        <div style={{
          ...styles.block,
          left: getPos(new Date('2026-02-21')) + '%',
          width: (getPos(new Date('2026-03-02')) - getPos(new Date('2026-02-21'))) + '%',
        }}>
          <span style={styles.blockLabel}>CALPE 10 DAYS</span>
        </div>

        {/* Progress line */}
        <div style={{ ...styles.progress, width: todayPos + '%' }} />
        <div style={styles.rail} />

        {/* Today marker */}
        <div style={{ ...styles.todayMarker, left: todayPos + '%' }} />

        {/* Event markers */}
        {events.map((ev, i) => (
          <div key={i} style={{ ...styles.eventDot, left: getPos(ev.date) + '%' }}>
            <div style={{ ...styles.dot, background: ev.color, boxShadow: `0 0 8px ${ev.color}60` }} />
            <div style={{ ...styles.eventLabel, color: ev.color }}>
              <div>{ev.icon} {ev.label}</div>
              <div style={styles.eventDate}>{ev.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    padding: '12px 24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0,
    background: '#111113',
  },
  label: {
    fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 2,
    color: '#6b6b7a', marginBottom: 16,
  },
  track: {
    position: 'relative',
    height: 40,
    marginTop: 8,
  },
  rail: {
    position: 'absolute',
    top: 8, left: 0, right: 0, height: 2,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 1,
  },
  progress: {
    position: 'absolute',
    top: 8, left: 0, height: 2,
    background: 'rgba(200,240,0,0.4)',
    borderRadius: 1,
    zIndex: 1,
  },
  block: {
    position: 'absolute',
    top: 2, height: 12,
    background: 'rgba(200,240,0,0.12)',
    border: '1px solid rgba(200,240,0,0.3)',
    borderRadius: 3,
    display: 'flex', alignItems: 'center',
    zIndex: 0,
  },
  blockLabel: {
    fontFamily: 'DM Mono', fontSize: 8, letterSpacing: 1,
    color: '#c8f000', padding: '0 4px', whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  todayMarker: {
    position: 'absolute',
    top: 2, width: 2, height: 12,
    background: '#c8f000',
    boxShadow: '0 0 8px #c8f000',
    borderRadius: 1,
    transform: 'translateX(-50%)',
    zIndex: 3,
  },
  eventDot: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    zIndex: 2,
  },
  dot: {
    width: 10, height: 10, borderRadius: '50%',
    marginTop: 3, flexShrink: 0,
    border: '1.5px solid #09090b',
  },
  eventLabel: {
    marginTop: 8, fontSize: 10, fontFamily: 'DM Mono',
    whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.3,
  },
  eventDate: { fontSize: 9, color: '#6b6b7a', marginTop: 1 },
}
