import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

export default function WeeklyTSSChart({ weeks = [] }) {
  const last12 = weeks.slice(-12)

  const avg = last12.length > 0
    ? Math.round(last12.reduce((s, w) => s + w.tss, 0) / last12.length)
    : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
      <div style={ttStyle}>
        <div style={{ color: '#9898a8', marginBottom: 6, fontSize: 11, fontFamily: 'DM Mono' }}>
          w/c {label}
        </div>
        <div style={{ color: '#c8f000' }}>TSS: {d.tss}</div>
        <div style={{ color: '#9898a8', marginTop: 4, fontSize: 11 }}>{d.rides} rides · {d.hours}h</div>
      </div>
    )
  }

  const formatWeek = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <BarChart data={last12} margin={{ top: 5, right: 10, bottom: 0, left: 0 }} barSize={22}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="week"
            tickFormatter={formatWeek}
            tick={{ fontFamily: 'DM Mono', fontSize: 9, fill: '#6b6b7a' }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontFamily: 'DM Mono', fontSize: 9, fill: '#6b6b7a' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine
            y={avg}
            stroke="rgba(200,240,0,0.4)"
            strokeDasharray="4 4"
            label={{ value: `avg ${avg}`, fill: '#c8f000', fontSize: 9, fontFamily: 'DM Mono', position: 'right' }}
          />
          <Bar dataKey="tss" radius={[4, 4, 0, 0]}>
            {last12.map((entry, i) => (
              <Cell
                key={i}
                fill={i === last12.length - 1 ? '#c8f000' : 'rgba(200,240,0,0.3)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const ttStyle = {
  background: '#1e1e24',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'DM Mono',
  fontSize: 12,
  color: '#e6e6ea',
}
