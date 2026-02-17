import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ATHLETE } from '../lib/athlete'
import { calculateZoneDistribution } from '../lib/pmc'

export default function ZoneDonut({ activities = [] }) {
  const dist = calculateZoneDistribution(activities, ATHLETE.zones)
  const hasData = dist.some(d => d.minutes > 0)

  // If no zone_times data, show static zones based on CP
  const displayData = hasData ? dist : Object.entries(ATHLETE.zones).map(([key, zone]) => ({
    zone: key,
    minutes: 0,
    percent: 0,
    ...zone,
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
      <div style={ttStyle}>
        <div style={{ color: d.color, marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: '#e6e6ea' }}>{d.minutes} min · {d.percent}%</div>
        <div style={{ color: '#9898a8', fontSize: 10, marginTop: 2 }}>
          {d.min}–{d.max === 999 ? d.min + '+' : d.max}w
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="minutes"
              >
                {displayData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={entry.minutes > 0 ? 1 : 0.2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div style={styles.legend}>
            {displayData.map((d, i) => (
              <div key={i} style={styles.legendItem}>
                <div style={{ ...styles.dot, background: d.color, opacity: d.minutes > 0 ? 1 : 0.3 }} />
                <div>
                  <span style={{ fontSize: 11, color: '#e6e6ea' }}>{d.name}</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#6b6b7a', marginLeft: 6 }}>
                    {d.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={styles.noData}>
          <div style={styles.zoneTable}>
            {Object.entries(ATHLETE.zones).map(([key, zone]) => (
              <div key={key} style={styles.zoneRow}>
                <div style={{ ...styles.zoneBar, background: zone.color }} />
                <span style={{ fontSize: 12, color: '#e6e6ea', width: 120 }}>{zone.name}</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#6b6b7a' }}>
                  {zone.min}–{zone.max === 999 ? zone.min + '+' : zone.max}w
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#6b6b7a', fontFamily: 'DM Mono', marginTop: 12 }}>
            Zone data available once activities sync
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { width: '100%' },
  legend: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  noData: {},
  zoneTable: { display: 'flex', flexDirection: 'column', gap: 8 },
  zoneRow: { display: 'flex', alignItems: 'center', gap: 10 },
  zoneBar: { width: 4, height: 16, borderRadius: 2, flexShrink: 0 },
}

const ttStyle = {
  background: '#1e1e24',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'DM Mono',
  fontSize: 12,
}
