import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import styles from '../styles/Dashboard.module.css'

const tooltipStyle = {
  background: '#18181d',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  padding: '6px 10px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 11,
  color: '#f0f0f4',
}

function MiniTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle}>
      {payload[0]?.value}{unit}
    </div>
  )
}

function WellnessSparkCard({ label, value, unit, data, dataKey, color, trend, trendDir }) {
  return (
    <div className={styles.wellnessCard}>
      <div className={styles.wellnessCardHeader}>
        <div className={styles.wellnessLabel}>{label}</div>
        <div className={styles.wellnessTrend} style={{ color: trendDir === 'up' ? '#00d4a1' : trendDir === 'down' ? '#ff4545' : '#5a5a6e' }}>
          {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
        </div>
      </div>
      <div>
        <span className={styles.wellnessValue}>{value ?? '—'}</span>
        <span className={styles.wellnessUnit}> {unit}</span>
      </div>

      {data?.length > 1 && (
        <div style={{ marginTop: 12, height: 48 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip content={(props) => <MiniTooltip {...props} unit={unit} />} />
              <Line
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default function WellnessSection({ wellness = [] }) {
  // Latest values
  const latest = wellness[wellness.length - 1] || {}
  const prev = wellness[wellness.length - 8] || {}

  const rhrTrend = latest.rhr && prev.rhr
    ? Math.round(latest.rhr - prev.rhr)
    : null
  const hrvTrend = latest.hrv && prev.hrv
    ? Math.round(latest.hrv - prev.hrv)
    : null
  const weightTrend = latest.weight && prev.weight
    ? (latest.weight - prev.weight).toFixed(1)
    : null

  return (
    <>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Wellness Metrics</span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#5a5a6e' }}>Last 30 days</span>
      </div>
      <div className={styles.wellnessGrid}>
        <WellnessSparkCard
          label="Resting HR"
          value={latest.rhr ? Math.round(latest.rhr) : null}
          unit="bpm"
          data={wellness}
          dataKey="rhr"
          color="#ff4545"
          trend={rhrTrend !== null ? `${rhrTrend > 0 ? '+' : ''}${rhrTrend} bpm` : '—'}
          trendDir={rhrTrend < 0 ? 'up' : rhrTrend > 0 ? 'down' : 'neutral'}
        />
        <WellnessSparkCard
          label="HRV"
          value={latest.hrv ? Math.round(latest.hrv) : null}
          unit="ms"
          data={wellness}
          dataKey="hrv"
          color="#00d4a1"
          trend={hrvTrend !== null ? `${hrvTrend > 0 ? '+' : ''}${hrvTrend} ms` : '—'}
          trendDir={hrvTrend > 0 ? 'up' : hrvTrend < 0 ? 'down' : 'neutral'}
        />
        <WellnessSparkCard
          label="Body Weight"
          value={latest.weight ? latest.weight.toFixed(1) : null}
          unit="kg"
          data={wellness}
          dataKey="weight"
          color="#9f7aea"
          trend={weightTrend !== null ? `${weightTrend > 0 ? '+' : ''}${weightTrend} kg` : '—'}
          trendDir={weightTrend < 0 ? 'up' : weightTrend > 0 ? 'down' : 'neutral'}
        />
      </div>
    </>
  )
}
