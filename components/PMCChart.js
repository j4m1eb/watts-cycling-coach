import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { getFormStatus } from '../lib/pmc'

export default function PMCChart({ pmc = [], projected = [] }) {
  // Combine historical + projected, last 60 days + full projection
  const historical = pmc.slice(-60).map(d => ({ ...d, projected: false }))
  const combined = [...historical, ...projected]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    const form = getFormStatus(d.tsb)
    return (
      <div style={ttStyles.box}>
        <div style={ttStyles.date}>{label}{d.projected ? ' (proj)' : ''}</div>
        <div style={ttStyles.row}>
          <span style={{ color: '#4a9eff' }}>CTL</span>
          <span>{d.ctl}</span>
        </div>
        <div style={ttStyles.row}>
          <span style={{ color: '#ff7a00' }}>ATL</span>
          <span>{d.atl}</span>
        </div>
        <div style={ttStyles.row}>
          <span style={{ color: form.color }}>TSB</span>
          <span style={{ color: form.color }}>{d.tsb > 0 ? '+' : ''}{d.tsb} ({form.label})</span>
        </div>
        {d.tss > 0 && (
          <div style={ttStyles.row}>
            <span style={{ color: '#9898a8' }}>TSS</span>
            <span>{d.tss}</span>
          </div>
        )}
      </div>
    )
  }

  const formatDate = (str) => {
    if (!str) return ''
    const d = new Date(str)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  // Key dates for reference lines
  const refs = [
    { date: '2026-02-20', label: 'Calpe', color: '#4a9eff' },
    { date: '2026-03-08', label: 'Race', color: '#ff3b3b' },
  ]

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.title}>FITNESS / FATIGUE / FORM</div>
        <div style={styles.legend}>
          <LegItem color="#4a9eff" label="CTL — Fitness (42d)" />
          <LegItem color="#ff7a00" label="ATL — Fatigue (7d)" />
          <LegItem color="#c8f000" label="TSB — Form" />
          <LegItem color="#6b6b7a" label="Projected" dashed />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={combined} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#6b6b7a' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            interval={Math.floor(combined.length / 8)}
          />
          <YAxis
            tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#6b6b7a' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />

          {refs.map(r => (
            <ReferenceLine
              key={r.date}
              x={r.date}
              stroke={r.color}
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{ value: r.label, fill: r.color, fontSize: 10, fontFamily: 'DM Mono', position: 'insideTopLeft' }}
            />
          ))}

          <Line
            dataKey="ctl"
            stroke="#4a9eff"
            strokeWidth={2}
            dot={false}
            strokeDasharray={(d) => d.projected ? '4 4' : '0'}
          />
          <Line
            dataKey="atl"
            stroke="#ff7a00"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="tsb"
            stroke="#c8f000"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Form zones legend */}
      <div style={styles.formZones}>
        {[
          { label: 'Race Fresh', range: '+5 to +25', color: '#00c896' },
          { label: 'Optimal Training', range: '-10 to +5', color: '#c8f000' },
          { label: 'Heavy Load', range: '-25 to -10', color: '#ff7a00' },
          { label: 'Overreaching', range: 'below -25', color: '#ff3b3b' },
        ].map(z => (
          <div key={z.label} style={styles.formZone}>
            <div style={{ ...styles.formDot, background: z.color }} />
            <div>
              <div style={{ fontSize: 12, color: '#e6e6ea' }}>{z.label}</div>
              <div style={{ fontSize: 10, fontFamily: 'DM Mono', color: '#6b6b7a' }}>TSB {z.range}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LegItem({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 20, height: 2,
        background: dashed ? 'none' : color,
        borderTop: dashed ? `2px dashed ${color}` : 'none',
      }} />
      <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#9898a8' }}>{label}</span>
    </div>
  )
}

const ttStyles = {
  box: {
    background: '#1e1e24',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: 'DM Mono',
    fontSize: 12,
  },
  date: { color: '#9898a8', marginBottom: 8, fontSize: 11 },
  row: { display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4, color: '#e6e6ea' },
}

const styles = {
  wrap: {
    background: '#111113',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '20px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 2, color: '#6b6b7a' },
  legend: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  formZones: { display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' },
  formZone: { display: 'flex', alignItems: 'center', gap: 8 },
  formDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
}
