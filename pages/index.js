import { useState, useEffect } from 'react'
import Head from 'next/head'
import { ATHLETE } from '../lib/athlete'
import { getFormStatus } from '../lib/pmc'
import PMCChart from '../components/PMCChart'
import WeeklyTSSChart from '../components/WeeklyTSSChart'
import ZoneDonut from '../components/ZoneDonut'
import CalendarView from '../components/CalendarView'
import AdherenceTable from '../components/AdherenceTable'
import WorkoutBuilder from '../components/WorkoutBuilder'
import TimelineBar from '../components/TimelineBar'

const NAV = [
  { id: 'overview',  icon: '⬡', label: 'Overview' },
  { id: 'fitness',   icon: '◈', label: 'Fitness' },
  { id: 'calendar',  icon: '▦', label: 'Calendar' },
  { id: 'workouts',  icon: '◉', label: 'Workouts' },
  { id: 'adherence', icon: '◎', label: 'Adherence' },
]

export default function Dashboard() {
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [postMsg, setPostMsg] = useState(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const handlePostWorkout = async (workout) => {
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout),
      })
      const result = await res.json()
      if (result.success) {
        setPostMsg('✓ Workout added to Intervals.icu calendar')
        setTimeout(() => setPostMsg(null), 4000)
      } else {
        setPostMsg('✗ Error: ' + result.error)
      }
    } catch (e) {
      setPostMsg('✗ ' + e.message)
    }
  }

  const today = data?.today || { ctl: 0, atl: 0, tsb: 0 }
  const form = getFormStatus(today.tsb)
  const raceProjection = data?.projected?.find(p => p.date === '2026-03-08')

  return (
    <>
      <Head>
        <title>WATTS — AI Cycling Coach</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.app}>
        {/* ── SIDEBAR ── */}
        <aside style={styles.sidebar}>
          <div style={styles.logo}>
            <div style={styles.logoText}>WATTS</div>
            <div style={styles.logoSub}>AI CYCLING COACH</div>
          </div>

          <nav style={styles.nav}>
            {NAV.map(item => (
              <button
                key={item.id}
                style={{ ...styles.navItem, ...(tab === item.id ? styles.navActive : {}) }}
                onClick={() => setTab(item.id)}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Athlete card */}
          <div style={styles.sidebarFooter}>
            <div style={styles.athleteCard}>
              <div style={styles.avatar}>53</div>
              <div>
                <div style={styles.athleteName}>Your Profile</div>
                <div style={styles.athleteMeta}>CP {ATHLETE.cp}w · FTP {ATHLETE.ftp}w</div>
                <div style={styles.athleteMeta}>VO₂max {ATHLETE.vo2max} ml/kg/min</div>
              </div>
            </div>

            {/* Race countdown */}
            <div style={styles.raceCountdown}>
              <div style={styles.raceLabel}>NEXT RACE</div>
              <div style={styles.raceName}>{ATHLETE.timeline.race1Name}</div>
              <div style={styles.raceDate}>
                {daysUntil(ATHLETE.timeline.race1)} days · Mar 8
              </div>
              {raceProjection && (
                <div style={{ ...styles.raceTSB, color: getFormStatus(raceProjection.tsb).color }}>
                  Projected TSB: {raceProjection.tsb > 0 ? '+' : ''}{raceProjection.tsb}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={styles.main}>
          {/* Top bar */}
          <div style={styles.topbar}>
            <div style={styles.pageTitle}>{NAV.find(n => n.id === tab)?.label}</div>
            <div style={styles.topbarRight}>
              <div style={styles.statusPill}>
                <span style={{ color: form.color }}>●</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{form.label}</span>
              </div>
              <div style={styles.metricChip}>
                <span style={styles.metricLabel}>CTL</span>
                <span style={styles.metricVal}>{today.ctl}</span>
              </div>
              <div style={styles.metricChip}>
                <span style={styles.metricLabel}>ATL</span>
                <span style={styles.metricVal}>{today.atl}</span>
              </div>
              <div style={{ ...styles.metricChip, ...(today.tsb >= 0 ? styles.metricPos : styles.metricNeg) }}>
                <span style={styles.metricLabel}>TSB</span>
                <span style={styles.metricVal}>{today.tsb > 0 ? '+' : ''}{today.tsb}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <TimelineBar />

          {/* Toast */}
          {postMsg && (
            <div style={{ ...styles.toast, background: postMsg.startsWith('✓') ? '#00c89620' : '#ff3b3b20', borderColor: postMsg.startsWith('✓') ? '#00c896' : '#ff3b3b' }}>
              {postMsg}
            </div>
          )}

          {/* Content */}
          <div style={styles.content}>
            {loading && <Loader />}
            {error && <ErrorMsg msg={error} />}

            {!loading && !error && data && (
              <>
                {tab === 'overview' && <Overview data={data} form={form} today={today} />}
                {tab === 'fitness' && <PMCChart pmc={data.pmc} projected={data.projected} />}
                {tab === 'calendar' && <CalendarView events={data.events} activities={data.activities} onPost={handlePostWorkout} />}
                {tab === 'workouts' && <WorkoutBuilder onPost={handlePostWorkout} />}
                {tab === 'adherence' && <AdherenceTable adherence={data.adherence} />}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────

function Overview({ data, form, today }) {
  const lastAct = data.activities?.[0]

  return (
    <div style={styles.overviewGrid}>
      {/* Form card */}
      <div style={{ ...styles.card, ...styles.cardLarge, borderColor: form.color + '40' }}>
        <div style={styles.cardLabel}>TODAY'S FORM</div>
        <div style={{ ...styles.bigNumber, color: form.color }}>{form.label}</div>
        <div style={styles.tsbRow}>
          <Metric label="CTL (Fitness)" value={today.ctl} unit="" color="#4a9eff" />
          <Metric label="ATL (Fatigue)" value={today.atl} unit="" color="#ff7a00" />
          <Metric label="TSB (Form)" value={(today.tsb > 0 ? '+' : '') + today.tsb} unit="" color={form.color} />
        </div>
        {form.risk && <div style={styles.formRisk}>⚠ {form.risk}</div>}
      </div>

      {/* Power zones */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>POWER ZONES (CP 240w)</div>
        <ZoneDonut activities={data.activities} />
      </div>

      {/* Last activity */}
      {lastAct && (
        <div style={styles.card}>
          <div style={styles.cardLabel}>LAST ACTIVITY</div>
          <div style={styles.actName}>{lastAct.name}</div>
          <div style={styles.actMeta}>{formatDate(lastAct.start_date_local)}</div>
          <div style={styles.actStats}>
            <ActStat label="TSS" value={Math.round(lastAct.icu_training_load || lastAct.tss || 0)} />
            <ActStat label="Avg W" value={Math.round(lastAct.average_watts || 0)} />
            <ActStat label="NP" value={Math.round(lastAct.normalized_power || 0)} />
            <ActStat label="IF" value={(lastAct.intensity_factor || 0).toFixed(2)} />
            <ActStat label="Duration" value={formatDuration(lastAct.moving_time)} />
          </div>
        </div>
      )}

      {/* Weekly TSS */}
      <div style={{ ...styles.card, ...styles.cardWide }}>
        <div style={styles.cardLabel}>WEEKLY TRAINING LOAD (TSS)</div>
        <WeeklyTSSChart weeks={data.weekly} />
      </div>

      {/* Camp info */}
      <div style={{ ...styles.card, borderColor: '#00d4aa40' }}>
        <div style={styles.cardLabel}>CALPE CAMP</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, color: '#00d4aa', marginBottom: 8 }}>
          {daysUntilCalpe()} days
        </div>
        <div style={{ fontSize: 16, color: '#9898a8', lineHeight: 1.7 }}>
          <div>🛫 Depart Feb 20</div>
          <div>🚴 Train Feb 21 – Mar 2 (10 days)</div>
          <div>🛬 Return Mar 3</div>
          <div>🏁 Race Mar 8</div>
        </div>
      </div>
    </div>
  )
}

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────────

function Metric({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 26, fontWeight: 500, color: color || '#e6e6ea' }}>
        {value}{unit}
      </div>
      <div style={{ fontSize: 17, color: '#6b6b7a', letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function ActStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', background: '#1e1e24', borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, color: '#e6e6ea' }}>{value}</div>
      <div style={{ fontSize: 16, color: '#6b6b7a', marginTop: 2, letterSpacing: '0.5px' }}>{label}</div>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid #1e1e24', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#6b6b7a', letterSpacing: '2px' }}>LOADING INTERVALS.ICU DATA</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ background: '#ff3b3b15', border: '1px solid #ff3b3b40', borderRadius: 10, padding: 20, margin: 20, fontFamily: 'JetBrains Mono', fontSize: 16 }}>
      <div style={{ color: '#ff3b3b', marginBottom: 8 }}>● API CONNECTION ERROR</div>
      <div style={{ color: '#9898a8' }}>{msg}</div>
      <div style={{ marginTop: 12, color: '#6b6b7a', fontSize: 17 }}>
        Check that INTERVALS_API_KEY and INTERVALS_ATHLETE_ID are set in your Vercel environment variables.
      </div>
    </div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function daysUntilCalpe() {
  return daysUntil('2026-02-20')
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const styles = {
  app: { display: 'flex', height: '100vh', background: '#09090b' },

  sidebar: {
    width: 230, flexShrink: 0,
    background: '#111113',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column',
  },

  logo: { padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  logoText: { fontFamily: 'Inter', fontSize: 30, letterSpacing: 4, color: '#00d4aa', lineHeight: 1 },
  logoSub: { fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: 2, color: '#6b6b7a', marginTop: 3 },

  nav: { padding: '16px 0', flex: 1 },

  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 20px',
    fontSize: 16, color: '#6b6b7a',
    borderLeft: '2px solid transparent',
    transition: 'all 0.15s', textAlign: 'left',
    letterSpacing: '0.3px',
  },

  navActive: {
    color: '#00d4aa',
    borderLeftColor: '#00d4aa',
    background: 'rgba(200,240,0,0.1)',
  },

  navIcon: { fontSize: 17, width: 18, textAlign: 'center' },

  sidebarFooter: {
    padding: '16px 16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },

  athleteCard: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d4aa, #7aff00)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17, fontWeight: 600, color: '#09090b', flexShrink: 0,
    fontFamily: 'JetBrains Mono',
  },
  athleteName: { fontSize: 16, fontWeight: 500, color: '#e6e6ea' },
  athleteMeta: { fontSize: 16, color: '#6b6b7a', fontFamily: 'JetBrains Mono', marginTop: 1 },

  raceCountdown: {
    background: '#1e1e24',
    borderRadius: 8,
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  raceLabel: { fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: 2, color: '#6b6b7a', marginBottom: 4 },
  raceName: { fontSize: 16, fontWeight: 500, color: '#e6e6ea', marginBottom: 2 },
  raceDate: { fontFamily: 'JetBrains Mono', fontSize: 17, color: '#9898a8' },
  raceTSB: { fontFamily: 'JetBrains Mono', fontSize: 17, marginTop: 4 },

  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },

  topbar: {
    padding: '14px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#111113', flexShrink: 0,
  },

  pageTitle: { fontFamily: 'Inter', fontSize: 20, letterSpacing: 2, color: '#e6e6ea' },
  topbarRight: { display: 'flex', gap: 8, alignItems: 'center' },

  statusPill: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1e1e24', borderRadius: 20, padding: '5px 12px',
    border: '1px solid rgba(255,255,255,0.07)',
    fontSize: 12,
  },

  metricChip: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: '#1e1e24', borderRadius: 6, padding: '4px 10px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  metricLabel: { fontSize: 16, color: '#6b6b7a', fontFamily: 'JetBrains Mono', letterSpacing: 1 },
  metricVal: { fontSize: 16, fontFamily: 'JetBrains Mono', fontWeight: 500, color: '#e6e6ea' },
  metricPos: { borderColor: 'rgba(0,200,150,0.3)' },
  metricNeg: { borderColor: 'rgba(255,122,0,0.3)' },

  toast: {
    margin: '12px 24px 0',
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    flexShrink: 0,
  },

  content: { flex: 1, overflow: 'auto', padding: '20px 24px' },

  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 16,
  },

  card: {
    background: '#111113',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '18px 20px',
  },

  cardLarge: { gridColumn: 'span 2' },
  cardWide: { gridColumn: 'span 2' },

  cardLabel: {
    fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: 2,
    color: '#6b6b7a', marginBottom: 12, textTransform: 'uppercase',
  },

  bigNumber: { fontFamily: 'Inter', fontSize: 40, letterSpacing: 2, marginBottom: 16 },

  tsbRow: { display: 'flex', gap: 32, marginBottom: 8 },
  formRisk: { fontSize: 12, color: '#ff7a00', marginTop: 4, fontFamily: 'JetBrains Mono' },

  actName: { fontSize: 18, fontWeight: 500, color: '#e6e6ea', marginBottom: 4 },
  actMeta: { fontSize: 12, color: '#6b6b7a', marginBottom: 12, fontFamily: 'JetBrains Mono' },
  actStats: { display: 'flex', gap: 8, flexWrap: 'wrap' },
}
