import { useState } from 'react'

type IconName =
  | 'dashboard'
  | 'bell'
  | 'users'
  | 'manager'
  | 'logs'
  | 'settings'
  | 'close'
  | 'menu'
  | 'globe'
  | 'activity'

type NavItem = {
  label: string
  icon: IconName
  active?: boolean
}

type StatCard = {
  label: string
  value: string
  icon: IconName
  tone: 'blue' | 'purple' | 'green' | 'orange'
}

type Language = 'en' | 'bg'

const translations = {
  en: {
    brand: 'TaskMan',
    systemAdmin: 'System Admin',
    admin: 'Admin',
    dashboard: 'Dashboard',
    notifications: 'Notifications',
    users: 'Users',
    managers: 'Managers',
    logs: 'Logs',
    settings: 'Settings',
    tasks: 'Tasks',
    teams: 'Teams',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
  },
  bg: {
    brand: 'TaskMan',
    systemAdmin: 'System Admin',
    admin: 'Администратор',
    dashboard: 'Табло',
    notifications: 'Известия',
    users: 'Потребители',
    managers: 'Мениджъри',
    logs: 'Логове',
    settings: 'Настройки',
    tasks: 'Задачи',
    teams: 'Екипи',
    closeMenu: 'Затвори менюто',
    openMenu: 'Отвори менюто',
  },
} satisfies Record<Language, Record<string, string>>

function Icon({ name }: { name: IconName }) {
  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <rect x="14" y="14" width="6" height="6" rx="1.4" />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M9.8 21a2.4 2.4 0 0 0 4.4 0" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="3" />
        <path d="M20 20v-2.2a4 4 0 0 0-3-3.8" />
        <path d="M16 4.2a3 3 0 0 1 0 5.6" />
      </svg>
    )
  }

  if (name === 'manager') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path d="M9.7 8h4.6" />
      </svg>
    )
  }

  if (name === 'logs') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M9 19V9" />
        <path d="M14 19V7" />
        <path d="M19 19v-5" />
        <path d="M3 19h18" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2.1 2.1 0 0 1-3 3l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21a2.1 2.1 0 0 1-4.2 0v-.2a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1a2.1 2.1 0 0 1-3-3l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H2a2.1 2.1 0 0 1 0-4.2h.2a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1a2.1 2.1 0 0 1 3-3l.1.1a1.8 1.8 0 0 0 2 .4h.1a1.8 1.8 0 0 0 1-1.6V2a2.1 2.1 0 0 1 4.2 0v.2a1.8 1.8 0 0 0 1 1.6h.1a1.8 1.8 0 0 0 2-.4l.1-.1a2.1 2.1 0 0 1 3 3l-.1.1a1.8 1.8 0 0 0-.4 2v.1a1.8 1.8 0 0 0 1.6 1h.2a2.1 2.1 0 0 1 0 4.2H21a1.8 1.8 0 0 0-1.6 1.3Z" />
      </svg>
    )
  }

  if (name === 'close') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    )
  }

  if (name === 'menu') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    )
  }

  if (name === 'globe') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  )
}

function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const t = translations[language]

  const navItems: NavItem[] = [
    { label: t.dashboard, icon: 'dashboard', active: true },
    { label: t.notifications, icon: 'bell' },
    { label: t.users, icon: 'users' },
    { label: t.managers, icon: 'manager' },
    { label: t.logs, icon: 'logs' },
  ]

  const statCards: StatCard[] = [
    { label: t.users, value: '0', icon: 'users', tone: 'blue' },
    { label: t.managers, value: '0', icon: 'manager', tone: 'purple' },
    { label: t.tasks, value: '0', icon: 'activity', tone: 'green' },
    { label: t.teams, value: '0', icon: 'users', tone: 'orange' },
  ]

  return (
    <main className={`admin-shell ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <aside className="admin-sidebar" aria-label="Admin navigation" aria-hidden={!isSidebarOpen}>
          <div className="admin-brand">
            <h1>{t.brand}</h1>
            <p>{t.systemAdmin}</p>
            <span>{t.admin}</span>
          </div>

          <nav className="admin-nav">
            {navItems.map((item) => (
              <button
                className={item.active ? 'active' : ''}
                type="button"
                key={item.label}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <button type="button">
              <Icon name="settings" />
              <span>{t.settings}</span>
            </button>
          </div>
      </aside>

      <section className="admin-main" aria-labelledby="admin-dashboard-title">
        <header className="admin-topbar">
          <button
            className="admin-icon-button"
            type="button"
            aria-label={isSidebarOpen ? t.closeMenu : t.openMenu}
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            <Icon name={isSidebarOpen ? 'close' : 'menu'} />
          </button>
          <button
            className="language-button"
            type="button"
            onClick={() =>
              setLanguage((current) => (current === 'en' ? 'bg' : 'en'))
            }
          >
            <Icon name="globe" />
            <span>{language.toUpperCase()}</span>
          </button>
        </header>

        <div className="admin-content">
          <h2 id="admin-dashboard-title">{t.dashboard}</h2>

          <div className="stats-grid">
            {statCards.map((card) => (
              <article className="stat-card" key={card.label}>
                <div>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                </div>
                <span className={`stat-icon ${card.tone}`}>
                  <Icon name={card.icon} />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default AdminPage
