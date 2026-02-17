export default function AdherenceTable({ adherence = [] }) {
  if (adherence.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>◎</div>
        <div style={styles.emptyTitle}>NO ADHERENCE DATA YET</div>
        <div style={styles.emptySub}>
          Adherence tracks your planned workouts from Intervals.icu against your completed activities.
          Add workouts to your calendar and complete rides to see your compliance here.
        </div>
      </div>
    )
  }

  const completed = adherence.filter(a => a.completed).length
  const total = adherence.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const avgAdherence = adherence
    .filter(a => a.adherencePct !== null)
    .reduce((s, a, _, arr) => s + a.adherencePct / arr.length, 0)

  return (
    <div style={styles.wrap}>
      {/* Summary */}
      <div style={styles.summary}>
        <SummaryCard
          label="COMPLETION RATE"
          value={pct + '%'}
          sub={`${completed} of ${total} sessions`}
          color={pct >= 80 ? '#00c896' : pct >= 60 ? '#ff7a00' : '#ff3b3b'}
        />
        <SummaryCard
          label="AVG TSS ADHERENCE"
          value={Math.round(avgAdherence) + '%'}
          sub="planned vs actual load"
          color={avgAdherence >= 85 ? '#00c896' : avgAdherence >= 65 ? '#ff7a00' : '#ff3b3b'}
        />
        <SummaryCard
          label="SESSIONS TRACKED"
          value={total}
          sub="last 14 days"
          color="#4a9eff"
        />
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['DATE', 'PLANNED', 'ACTUAL', 'PLAN TSS', 'ACTUAL TSS', 'ADHERENCE', 'STATUS'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adherence.map((row, i) => {
              const adh = row.adherencePct
              const adhColor = adh === null ? '#6b6b7a' : adh >= 85 ? '#00c896' : adh >= 65 ? '#ff7a00' : '#ff3b3b'

              return (
                <tr key={i} style={{ ...styles.tr, ...(i % 2 === 0 ? styles.trEven : {}) }}>
                  <td style={styles.td}>
                    <span style={styles.mono}>{formatDate(row.date)}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: '#9898a8', fontSize: 12 }}>{row.plannedName || '—'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: row.completed ? '#e6e6ea' : '#6b6b7a', fontSize: 12 }}>
                      {row.actualName || '—'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.mono}>{row.plannedTSS || '—'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.mono}>{row.actualTSS || '—'}</span>
                  </td>
                  <td style={styles.td}>
                    {adh !== null ? (
                      <div style={styles.adhBar}>
                        <div style={{ ...styles.adhFill, width: Math.min(adh, 100) + '%', background: adhColor }} />
                        <span style={{ ...styles.mono, color: adhColor, marginLeft: 6, fontSize: 11 }}>{adh}%</span>
                      </div>
                    ) : (
                      <span style={{ color: '#6b6b7a', fontFamily: 'DM Mono', fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {row.completed ? (
                      <span style={styles.badgeGreen}>✓ Done</span>
                    ) : (
                      <span style={styles.badgeRed}>✗ Missed</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.note}>
        * Adherence = actual TSS / planned TSS × 100. Values over 100% indicate you did more than planned.
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div style={card.wrap}>
      <div style={card.label}>{label}</div>
      <div style={{ ...card.value, color }}>{value}</div>
      <div style={card.sub}>{sub}</div>
    </div>
  )
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  summary: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  tableWrap: { background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 1.5, color: '#6b6b7a', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  trEven: { background: 'rgba(255,255,255,0.015)' },
  td: { padding: '11px 16px', verticalAlign: 'middle' },
  mono: { fontFamily: 'DM Mono', fontSize: 12, color: '#9898a8' },
  adhBar: { display: 'flex', alignItems: 'center', width: 100 },
  adhFill: { height: 4, borderRadius: 2, transition: 'width 0.3s', minWidth: 2 },
  badgeGreen: { fontFamily: 'DM Mono', fontSize: 10, background: 'rgba(0,200,150,0.15)', color: '#00c896', padding: '3px 8px', borderRadius: 4 },
  badgeRed: { fontFamily: 'DM Mono', fontSize: 10, background: 'rgba(255,59,59,0.15)', color: '#ff3b3b', padding: '3px 8px', borderRadius: 4 },
  note: { fontFamily: 'DM Mono', fontSize: 10, color: '#6b6b7a' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' },
  emptyIcon: { fontSize: 40, color: '#3a3a48', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 3, color: '#6b6b7a', marginBottom: 12 },
  emptySub: { fontSize: 13, color: '#6b6b7a', maxWidth: 400, lineHeight: 1.6 },
}

const card = {
  wrap: { background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' },
  label: { fontFamily: 'DM Mono', fontSize: 9, letterSpacing: 2, color: '#6b6b7a', marginBottom: 8 },
  value: { fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2, lineHeight: 1 },
  sub: { fontSize: 11, color: '#6b6b7a', marginTop: 4 },
}
