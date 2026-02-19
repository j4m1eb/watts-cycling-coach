import styles from '../styles/Dashboard.module.css'

function daysUntil(dateStr) {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = Math.round((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

export default function TimelineBanner() {
  const phases = [
    { name: 'Pre-Camp', date: '20 Feb', days: daysUntil('2026-02-20'), suffix: 'to Calpe' },
    { name: 'Calpe Camp', date: '21 Feb – 2 Mar', days: 10, suffix: 'training days' },
    { name: 'Sharpen', date: '4 – 7 Mar', days: 4, suffix: 'days' },
    { name: 'Crit Race', date: '8 Mar', days: daysUntil('2026-03-08'), suffix: 'to race day' },
  ]

  return (
    <div className={styles.timelineBanner}>
      {phases.map((phase, i) => {
        const isRace = i === phases.length - 1
        const isCamp = i === 1

        return (
          <div key={phase.name} className={styles.timelinePhase}>
            <div className={styles.timelinePhaseName}>{phase.name}</div>
            <div className={styles.timelinePhaseDate}>{phase.date}</div>
            <div className={`${styles.timelinePhaseDays} ${isRace ? styles.race : isCamp ? styles.active : ''}`}>
              {isCamp
                ? `${phase.days} days`
                : phase.days > 0
                  ? `${phase.days}d ${phase.suffix}`
                  : phase.days === 0
                    ? 'Today!'
                    : `${Math.abs(phase.days)}d ago`}
            </div>
          </div>
        )
      })}
    </div>
  )
}
