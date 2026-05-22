import { useMemo, useState } from 'react'
import { commonStyles, managerStyles } from '../styles'
import { getUsername } from '../utils/auth'

type EmployeeView =
  | 'dashboard'
  | 'notifications'
  | 'myTasks'
  | 'teamTasks'
  | 'calendar'

type IconName =
  | 'dashboard'
  | 'bell'
  | 'tasks'
  | 'calendar'
  | 'settings'
  | 'logout'
  | 'close'
  | 'menu'
  | 'globe'
  | 'check'
  | 'clock'
  | 'warning'

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

  if (name === 'tasks') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6h11" />
        <path d="M9 12h11" />
        <path d="M9 18h11" />
        <path d="m4 6 .7.7L6.5 5" />
        <path d="m4 12 .7.7 1.8-1.8" />
        <path d="m4 18 .7.7 1.8-1.8" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M4 10h16" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.4" />
        <path d="M19 15a1.8 1.8 0 0 0 .4 2l.1.1-2.4 2.4-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21h-4v-.4a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2.4-2.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H3v-4h.4A1.8 1.8 0 0 0 5 9a1.8 1.8 0 0 0-.4-2l-.1-.1 2.4-2.4.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1-1.6V3h4v.4A1.8 1.8 0 0 0 15 5a1.8 1.8 0 0 0 2-.4l.1-.1 2.4 2.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1h.4v4h-.4A1.8 1.8 0 0 0 19 15Z" />
      </svg>
    )
  }

  if (name === 'logout') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17 15 12 10 7" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
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

  if (name === 'check') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }

  if (name === 'warning') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function EmployeePage({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<EmployeeView>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const employeeName = getUsername() || 'Employee'

  const navItems = useMemo(
    () =>
      [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'myTasks', label: 'My Tasks', icon: 'tasks' },
        { id: 'teamTasks', label: 'Team Tasks', icon: 'tasks' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar' },
      ] satisfies Array<{ id: EmployeeView; label: string; icon: IconName }>,
    [],
  )

  const pageTitle =
    navItems.find((item) => item.id === activeView)?.label ?? 'Dashboard'

  return (
    <main className={managerStyles.shell(isSidebarOpen)}>
      <aside
        className={managerStyles.sidebar(isSidebarOpen)}
        aria-label="Employee navigation"
        aria-hidden={!isSidebarOpen}
      >
        <div className={`${managerStyles.sidebarInner(isSidebarOpen)} ${managerStyles.brand}`}>
          <h1>TaskMan</h1>
          <p>{employeeName}</p>
          <span>User</span>
        </div>

        <nav className={managerStyles.nav(isSidebarOpen)}>
          {navItems.map((item) => (
            <button
              className={managerStyles.navButton(activeView === item.id)}
              type="button"
              key={item.id}
              onClick={() => setActiveView(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={managerStyles.sidebarFooter(isSidebarOpen)}>
          <button className={managerStyles.footerButton} type="button">
            <Icon name="settings" />
            <span>Settings</span>
          </button>
          <button className={`${managerStyles.footerButton} text-[#ef1d32]`} type="button" onClick={onLogout}>
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className={managerStyles.main} aria-labelledby="employee-page-title">
        <header className={managerStyles.topbar(isSidebarOpen)}>
          <button
            className={managerStyles.iconButton}
            type="button"
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            <Icon name={isSidebarOpen ? 'close' : 'menu'} />
          </button>

          <button className={managerStyles.languageButton} type="button">
            <Icon name="globe" />
            <span>EN</span>
          </button>
        </header>

        <div className={managerStyles.content}>
          <div className={managerStyles.heading}>
            <h2 id="employee-page-title">{pageTitle}</h2>
          </div>

          {activeView === 'dashboard' ? (
            <>
              <section className={managerStyles.statsGrid} aria-label="Task summary">
                <article className={managerStyles.statCard}>
                  <p>My Tasks</p>
                  <strong>0</strong>
                </article>
                <article className={managerStyles.statCard}>
                  <p>In Progress</p>
                  <strong>0</strong>
                </article>
                <article className={managerStyles.statCard}>
                  <p>Completed</p>
                  <strong>0</strong>
                </article>
                <article className={managerStyles.statCard}>
                  <p>Overdue</p>
                  <strong>0</strong>
                </article>
              </section>

              <div className="grid grid-cols-[1fr_1fr] gap-[22px] max-[900px]:grid-cols-1">
                <section className={`${managerStyles.dashboardPanel} min-h-[230px]`}>
                  <h3>Recent Tasks</h3>
                  <div className="grid min-h-[132px] place-items-center text-[16px] font-bold text-[#6b7280]">
                    No tasks assigned yet
                  </div>
                </section>

                <section className={managerStyles.dashboardPanel}>
                  <h3>Time Summary</h3>
                  <div className="grid gap-5 text-[16px] font-medium text-[#4f5b72]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Total Hours Logged</span>
                      <strong className="text-[28px] font-medium text-black">0h</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Tasks Completed</span>
                      <strong className="text-[28px] font-medium text-black">0</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Avg Time/Task</span>
                      <strong className="text-[28px] font-medium text-black">0h</strong>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <section className={managerStyles.emptyText}>
              <div className={`${commonStyles.iconSvg} grid min-h-[240px] place-items-center rounded-[10px] border border-[#edf0f4] bg-white text-center text-[#6b7280] shadow-[0_3px_7px_rgba(17,24,39,0.08)]`}>
                <div className="grid justify-items-center gap-3">
                  <Icon name={activeView === 'calendar' ? 'calendar' : 'tasks'} />
                  <span>{pageTitle} content will be added here.</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

export default EmployeePage
