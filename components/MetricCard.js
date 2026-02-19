import styles from '../styles/Dashboard.module.css'

export default function MetricCard({ label, value, sub, color, trend, trendDir }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={`${styles.metricValue} ${color ? styles[color] : ''}`}>
        {value ?? '—'}
      </div>
      {sub && <div className={styles.metricSub}>{sub}</div>}
      {trend && (
        <div className={`${styles.metricTrend} ${styles[trendDir || 'neutral']}`}>
          {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
        </div>
      )}
    </div>
  )
}
