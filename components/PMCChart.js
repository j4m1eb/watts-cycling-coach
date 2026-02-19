import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import styles from '../styles/Dashboard.module.css'

function getFormStatus(tsb) {
  if (tsb > 25) return { label: 'Very Fresh', color: '#4a9eff' }
  if (tsb > 5)  return { label: 'Race Fresh', color: '#00d4a1' }
  if (tsb > -10) return { label: 'Optimal', color: '#c8f000' }
  if (tsb > -25) return { label: 'Heavy Load', color: '#ff8c42' }
  return { label: 'Overreaching', color: '#ff4545' }
}

const tooltipStyle = {
  background: '#18181d',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 13,
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const form = getFormStatus(d.tsb)
  return (
    <div style={tooltipStyle}>
      <div style={{ color: '#5a5a6e', marginBottom: 8, fontSize: 11 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4, color: '#f0f0f4' }}>
        <span style={{ color: '#4a9eff' }}>CTL</span><span>{Math.round(d.ctl)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4, color: '#f0f0f4' }}>
        <span style={{ color: '#ff8c42' }}>ATL</span><span>{Math.round(d.atl)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, color: form.color }}>
        <span>TSB</span>
        <span>{d.tsb > 0 ? '+' : ''}{Math.round(d.tsb)} <span style={{ fontSize: 10, opacity: 0.7 }}>({form.label})</span></span>
      </div>
    </div>
  )
}

export default function PMCChart({ data = [] }) {
  const last90 = data.slice(-90)

  const formatDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const tickStyle = { fontFamily: 'DM Sans, sans-serif', fontSize: 11, fill: '#5a5a6e' }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardHeader}>
        <div>
          <div className={styles.chartCardTitle}>Performance Management Chart</div>
          <div className={styles.chartCardValue}>CTL · ATL · TSB</div>
        </div>
        <div className={styles.chartLegend}>
          {[
            { color: '#4a9eff', label: 'Fitness (CTL)' },
            { color: '#ff8c42', label: 'Fatigue (ATL)' },
            { color: '#c8f000', label: 'Form (TSB)' },
          ].map(l => (
            <div key={l.label} className={styles.legendItem}>
              <div className={styles.legendDash} style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={last90} margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(last90.length / 6) || 1}
          />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <ReferenceLine x="2026-02-20" stroke="rgba(74,158,255,0.5)" strokeDasharray="4 4"
            label={{ value: 'Calpe', fill: '#4a9eff', fontSize: 12, fontFamily: 'DM Sans', position: 'insideTopLeft' }} />
          <ReferenceLine x="2026-03-08" stroke="rgba(255,69,69,0.5)" strokeDasharray="4 4"
            label={{ value: 'Race', fill: '#ff4545', fontSize: 12, fontFamily: 'DM Sans', position: 'insideTopLeft' }} />
          <Line dataKey="ctl" stroke="#4a9eff" strokeWidth={2} dot={false} />
          <Line dataKey="atl" stroke="#ff8c42" strokeWidth={2} dot={false} />
          <Line dataKey="tsb" stroke="#c8f000" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
