import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import PMCChart from '../components/PMCChart'
import WeeklyTSSChart from '../components/WeeklyTSSChart'
import WellnessSection from '../components/WellnessSection'
import TimelineBanner from '../components/TimelineBanner'
import styles from '../styles/Dashboard.module.css'

const PERIODS = ['4W', '8W', '12W', '6M']

function getFormStatus(tsb) {
  if (tsb === undefined || tsb === null) return { label: '—', color: '#5a5a6e' }
  if (tsb > 25) return { label: 'Very Fresh', color: '#4a9eff' }
  if (tsb > 5)  return { label: 'Race Fresh', color: '#00d4a1' }
  if (tsb > -10) return { label: 'Optimal', color: '#c8f000' }
  if (tsb > -25) return { label: 'Heavy Load', color: '#ff8c42' }
  return { label: 'Overreaching', color: '#ff4545' }
}

// ── Tab Views ──────────────────────────────────────────────────────────────

function OverviewTab({ data, wellness, period }) {
  if (!data) return null
  const { latest = {}, pmc = [], weeks = [], athlete = {} } = data
  const form = getFormStatus(latest.tsb)

  // Filter PMC by period
  const days = { '4W': 28, '8W': 56, '12W': 84, '6M': 180 }[period] || 84
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  const filteredPMC = pmc.filter(d => d.date >= cutoffStr)

  return (
    <>
      <TimelineBanner />

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Today&apos;s Numbers</span>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard
          label="Fitness (CTL)"
          value={latest.ctl ?? '—'}
          sub="42-day avg load"
          color="blue"
        />
        <MetricCard
          label="Fatigue (ATL)"
          value={latest.atl ?? '—'}
          sub="7-day avg load"
          color="orange"
        />
        <MetricCard
          label="Form (TSB)"
          value={latest.tsb !== undefined ? (latest.tsb > 0 ? `+${latest.tsb}` : latest.tsb) : '—'}
          sub={form.label}
          color={latest.tsb > 5 ? 'green' : latest.tsb < -10 ? 'red' : 'lime'}
        />
        <MetricCard
          label="FTP"
          value={athlete.ftp ?? 250}
          sub="watts"
          color="lime"
        />
        <MetricCard
          label="CP"
          value={240}
          sub="critical power"
        />
        <MetricCard
          label="VO₂ Max"
          value={57}
          sub="ml/kg/min"
          color="green"
        />
      </div>

      <PMCChart data={filteredPMC} />

      <div className={styles.twoCol}>
        <WeeklyTSSChart weeks={weeks} />
        <WellnessSection wellness={wellness} />
      </div>
    </>
  )
}

function FitnessTab({ data, period }) {
  if (!data) return null
  const { pmc = [], weeks = [] } = data

  const days = { '4W': 28, '8W': 56, '12W': 84, '6M': 180 }[period] || 84
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const filteredPMC = pmc.filter(d => d.date >= cutoff.toISOString().split('T')[0])

  return (
    <>
      <PMCChart data={filteredPMC} />
      <WeeklyTSSChart weeks={weeks} />
    </>
  )
}

function WellnessTab({ wellness }) {
  return <WellnessSection wellness={wellness} />
}

function PlaceholderTab({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 240,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-muted)',
    }}>
      {label} — coming in Phase 2
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [period, setPeriod] = useState('12W')
  const [data, setData] = useState(null)
  const [wellness, setWellness] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, wellRes] = await Promise.allSettled([
        fetch('/api/dashboard'),
        fetch('/api/wellness'),
      ])

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        setData(await dashRes.value.json())
      } else {
        setError('Failed to load dashboard data')
      }

      if (wellRes.status === 'fulfilled' && wellRes.value.ok) {
        const w = await wellRes.value.json()
        setWellness(w.wellness || [])
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingLogo}>WATTS<span>.</span></div>
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} />
        </div>
        <div className={styles.loadingText}>Syncing from Intervals.icu…</div>
      </div>
    )
  }

  const tabTitles = {
    overview: { title: 'Overview', sub: 'Today · ' + new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) },
    fitness: { title: 'Fitness', sub: 'CTL · ATL · TSB · Performance Management' },
    wellness: { title: 'Wellness', sub: 'RHR · HRV · Body Weight' },
    calendar: { title: 'Calendar', sub: 'Training schedule' },
    workouts: { title: 'Workouts', sub: 'Structured sessions' },
  }

  const current = tabTitles[activeTab] || tabTitles.overview

  return (
    <>
      <Head>
        <title>WATTS — Cycling Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.layout}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          athlete={data?.athlete}
        />

        <div className={styles.main}>
          <div className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <div className={styles.pageTitle}>{current.title}</div>
              <div className={styles.pageSubtitle}>{current.sub}</div>
            </div>
            <div className={styles.topBarRight}>
              {(activeTab === 'overview' || activeTab === 'fitness') && (
                <div className={styles.periodFilters}>
                  {PERIODS.map(p => (
                    <button
                      key={p}
                      className={`${styles.periodBtn} ${period === p ? styles.active : ''}`}
                      onClick={() => setPeriod(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={fetchData}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'color var(--transition)',
                }}
              >
                ↻ Sync
              </button>
            </div>
          </div>

          <div className={styles.content}>
            {error && <div className={styles.errorBox}>⚠ {error}</div>}

            {activeTab === 'overview' && <OverviewTab data={data} wellness={wellness} period={period} />}
            {activeTab === 'fitness' && <FitnessTab data={data} period={period} />}
            {activeTab === 'wellness' && <WellnessTab wellness={wellness} />}
            {activeTab === 'calendar' && <PlaceholderTab label="Training Calendar" />}
            {activeTab === 'workouts' && <PlaceholderTab label="Workout Builder" />}
          </div>
        </div>
      </div>
    </>
  )
}
