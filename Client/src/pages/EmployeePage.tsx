import { useMemo, useState } from 'react'
import { cx, managerStyles } from '../styles'
import { getUsername } from '../utils/auth'

type EmployeeView =
  | 'dashboard'
  | 'notifications'
  | 'myTasks'
  | 'teamTasks'
  | 'calendar'

type IconName =
  | 'bell'
  | 'calendar'
  | 'checkCircle'
  | 'chevron'
  | 'clock'
  | 'dashboard'
  | 'globe'
  | 'list'
  | 'logout'
  | 'menu'
  | 'settings'
  | 'warning'
  | 'x'

const tasks = [
  {
    id: 1,
    title: 'Implement user authentication flow',
    priority: 'High',
    status: 'TODO',
    dueDate: '6/4/2026',
  },
  {
    id: 2,
    title: 'Fix navigation menu bug',
    priority: 'Urgent',
    status: 'REVIEW',
    dueDate: '',
  },
]

function Icon({ name }: { name: IconName }) {
  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M9.8 21a2.4 2.4 0 0 0 4.4 0" />
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

  if (name === 'checkCircle') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.7 2.7L16.5 9" />
      </svg>
    )
  }

  if (name === 'chevron') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18 15 12 9 6" />
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    )
  }

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

  if (name === 'list') {
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

  if (name === 'logout') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17 15 12 10 7" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
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

  if (name === 'settings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.4" />
        <path d="M19 15a1.8 1.8 0 0 0 .4 2l.1.1-2.4 2.4-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21h-4v-.4a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2.4-2.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H3v-4h.4A1.8 1.8 0 0 0 5 9a1.8 1.8 0 0 0-.4-2l-.1-.1 2.4-2.4.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1-1.6V3h4v.4A1.8 1.8 0 0 0 15 5a1.8 1.8 0 0 0 2-.4l.1-.1 2.4 2.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1h.4v4h-.4A1.8 1.8 0 0 0 19 15Z" />
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function EmployeePage({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<EmployeeView>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const employeeName = getUsername() || 'Alex Wilson'

  const navItems = useMemo(
    () =>
      [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'myTasks', label: 'My Tasks', icon: 'list' },
        { id: 'teamTasks', label: 'Team Tasks', icon: 'list' },
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
        <div
          className={`${managerStyles.sidebarInner(isSidebarOpen)} ${managerStyles.brand}`}
        >
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
          <button
            className={`${managerStyles.footerButton} text-[#ef1d32]`}
            type="button"
            onClick={onLogout}
          >
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
            <Icon name={isSidebarOpen ? 'x' : 'menu'} />
          </button>

          <button
            className={managerStyles.languageButton}
            type="button"
          >
            <Icon name="globe" />
            <span>EN</span>
          </button>
        </header>

        <div className="px-[30px] pt-[40px] pb-10 max-[820px]:px-5">
          {activeView === 'dashboard' ? (
            <>
              <h2
                className="mb-[38px] text-[31px] leading-none font-extrabold text-[#050505]"
                id="employee-page-title"
              >
                Dashboard
              </h2>

              <section
                className="mb-[31px] grid grid-cols-4 gap-[30px] max-[1250px]:grid-cols-2 max-[700px]:grid-cols-1"
                aria-label="Task summary"
              >
                <StatCard
                  icon="checkCircle"
                  iconTone="blue"
                  label="My Tasks"
                  value="2"
                />
                <StatCard
                  icon="clock"
                  iconTone="yellow"
                  label="In Progress"
                  value="0"
                />
                <StatCard
                  icon="checkCircle"
                  iconTone="green"
                  label="Completed"
                  value="0"
                />
                <StatCard
                  icon="warning"
                  iconTone="red"
                  label="Overdue"
                  value="0"
                />
              </section>

              <div className="grid grid-cols-2 gap-[30px] max-[1050px]:grid-cols-1">
                <section className="min-h-[310px] rounded-xl border border-[#e5e7eb] bg-white px-[32px] pt-[36px] pb-[30px] shadow-[0_3px_7px_rgba(17,24,39,0.1)]">
                  <h3 className="mb-[30px] text-[26px] leading-none font-extrabold text-[#050505]">
                    Recent Tasks
                  </h3>

                  <div className="grid gap-4">
                    {tasks.map((task) => (
                      <article
                        className="grid min-h-[86px] grid-cols-[1fr_auto] items-center gap-5 rounded-xl border border-[#d9dde5] bg-white px-[17px] py-[15px]"
                        key={task.id}
                      >
                        <div className="min-w-0">
                          <h4 className="mb-3 truncate text-[19px] leading-none font-extrabold text-[#111827]">
                            {task.title}
                          </h4>
                          <p className="text-[17px] leading-none font-bold text-[#667085]">
                            {task.priority}
                          </p>
                        </div>
                        <div className="grid justify-items-end gap-2">
                          <span className="rounded-md bg-[#f2f4f7] px-[10px] py-[5px] text-[15px] leading-none font-extrabold text-[#475467]">
                            {task.status}
                          </span>
                          {task.dueDate ? (
                            <time className="text-[16px] leading-none font-bold text-[#667085]">
                              {task.dueDate}
                            </time>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="min-h-[310px] rounded-xl border border-[#e5e7eb] bg-white px-[32px] pt-[36px] pb-[30px] shadow-[0_3px_7px_rgba(17,24,39,0.1)]">
                  <h3 className="mb-[40px] text-[26px] leading-none font-extrabold text-[#050505]">
                    Time Summary
                  </h3>

                  <div className="grid gap-[32px]">
                    <SummaryRow label="Total Hours Logged" value="5h" />
                    <SummaryRow label="Tasks Completed" value="0" />
                    <SummaryRow label="Avg Time/Task" value="0h" />
                  </div>
                </section>
              </div>
            </>
          ) : (
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_3px_7px_rgba(17,24,39,0.08)]">
              <h2
                className="mb-4 text-[31px] leading-none font-extrabold text-[#050505]"
                id="employee-page-title"
              >
                {pageTitle}
              </h2>
              <p className="text-[16px] font-bold text-[#667085]">
                This screen will be matched from the next screenshot.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

function StatCard({
  icon,
  iconTone,
  label,
  value,
}: {
  icon: IconName
  iconTone: 'blue' | 'green' | 'red' | 'yellow'
  label: string
  value: string
}) {
  return (
    <article className="flex min-h-[150px] items-center justify-between gap-5 rounded-xl border border-[#e5e7eb] bg-white px-[32px] py-[28px] shadow-[0_3px_7px_rgba(17,24,39,0.1)]">
      <div>
        <p className="mb-[18px] text-[19px] leading-none font-bold text-[#667085]">
          {label}
        </p>
        <strong className="block text-[42px] leading-none font-medium text-black">
          {value}
        </strong>
      </div>
      <span
        className={cx(
          'grid h-16 w-16 shrink-0 place-items-center rounded-xl [&_svg]:h-[34px] [&_svg]:w-[34px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]',
          iconTone === 'blue' && 'bg-[#dbe9ff] text-[#315af2]',
          iconTone === 'green' && 'bg-[#dcfce7] text-[#2ea95a]',
          iconTone === 'red' && 'bg-[#fee2e2] text-[#ef1d32]',
          iconTone === 'yellow' && 'bg-[#fef7c3] text-[#111827]',
        )}
      >
        <Icon name={icon} />
      </span>
    </article>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-8">
      <span className="text-[21px] leading-none font-medium text-[#667085]">
        {label}
      </span>
      <strong className="text-[34px] leading-none font-medium text-black">
        {value}
      </strong>
    </div>
  )
}

export default EmployeePage
