import styles from '../styles/Dashboard.module.css'

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 10 L4 6 L7 8 L10 3 L13 5 L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 13.5C8 13.5 2 10 2 5.5C2 3.5 3.7 2 5.5 2C6.6 2 7.5 2.5 8 3.3C8.5 2.5 9.4 2 10.5 2C12.3 2 14 3.5 14 5.5C14 10 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 1.5V3.5M11 1.5V3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M1.5 6.5H14.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'workouts',
    label: 'Workouts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8H4M12 8H14M4 8V5.5A1.5 1.5 0 016 4H10A1.5 1.5 0 0112 5.5V10.5A1.5 1.5 0 0110 12H6A1.5 1.5 0 014 10.5V8Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggle, athlete }) {
  const ftpDisplay = athlete?.ftp ? `FTP ${athlete.ftp}w` : 'Loading...'

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarLogo}>
        <div className={styles.sidebarLogoMark}>W</div>
        <span className={styles.sidebarLogoText}>WATTS</span>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarAthlete}>
        <div className={styles.athleteAvatar}>J</div>
        <div className={styles.athleteInfo}>
          <div className={styles.athleteName}>Jamie</div>
          <div className={styles.athleteSubtitle}>{ftpDisplay} · VO₂ 57</div>
        </div>
      </div>

      <div className={styles.sidebarToggle}>
        <button className={styles.toggleBtn} onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {collapsed ? (
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
      </div>
    </aside>
  )
}
