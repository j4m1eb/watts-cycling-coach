import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import styles from '../styles/Dashboard.module.css'

const tooltipStyle = {
  background: '#18181d',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={tooltipStyle}>
      <div style={{ color: '#c8f000' }}>TSS: {d.tss}</div>
      <div style={{ color: '#5a5a6e', fontSize: 11, marginTop: 4 }}>
        {d.rides} rides · {d.hours}h
      </div>
    </div>
  )
}

export default function WeeklyTSSChart({ weeks = [] }) {
  const last12 = weeks.slice(-12)
  const avg = last12.length ? Math.round(last12.reduce((s, w) => s + w.tss, 0) / last12.length) : 0

  const formatWeek = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const tickStyle = { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#5a5a6e' }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardHeader}>
        <div>
          <div className={styles.chartCardTitle}>Weekly Training Load</div>
          <div className={styles.chartCardValue}>TSS per Week — {last12.length}w view</div>
        </div>
        <div className={styles.legendItem} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5a5a6e' }}>
          avg {avg}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={last12} margin={{ top: 5, right: 8, bottom: 0, left: -10 }} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="week" tickFormatter={formatWeek} tick={tickStyle} axisLine={false} tickLine={false} interval={1} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={avg} stroke="rgba(200,240,0,0.3)" strokeDasharray="3 3" />
          <Bar dataKey="tss" radius={[4, 4, 0, 0]}>
            {last12.map((_, i) => (
              <Cell key={i} fill={i === last12.length - 1 ? '#c8f000' : 'rgba(200,240,0,0.25)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
