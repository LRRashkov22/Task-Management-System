import { useEffect, useMemo, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { fetchNotifications, type NotificationDto } from '../api/notificationsApi'
import { cx, managerStyles } from '../styles'
import { getToken, getUsername } from '../utils/auth'

type EmployeeView =
  | 'dashboard'
  | 'notifications'
  | 'myTasks'
  | 'teamTasks'
  | 'calendar'

type IconName =
  | 'bell'
  | 'calendar'
  | 'check'
  | 'checkDouble'
  | 'checkCircle'
  | 'chevron'
  | 'chevronLeft'
  | 'clock'
  | 'comment'
  | 'dashboard'
  | 'globe'
  | 'list'
  | 'logout'
  | 'menu'
  | 'settings'
  | 'team'
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

const teamTasks = [
  {
    id: 1,
    title: 'Implement user authentication flow',
    status: 'TODO',
    assignees: 'Alex Wilson, Maria Garcia',
    deadline: '6/4/2026',
  },
  {
    id: 2,
    title: 'Redesign dashboard layout',
    status: 'IN_PROGRESS',
    assignees: 'James Brown, Kevin Allen',
    deadline: '6/10/2026',
  },
  {
    id: 3,
    title: 'Fix navigation menu bug',
    status: 'REVIEW',
    assignees: 'Alex Wilson',
    deadline: '-',
  },
  {
    id: 4,
    title: 'Optimize search functionality',
    status: 'DONE',
    assignees: 'Maria Garcia, Lisa Hill',
    deadline: '6/9/2026',
  },
  {
    id: 5,
    title: 'Add dark mode support',
    status: 'TODO',
    assignees: 'James Brown',
    deadline: '6/14/2026',
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

  if (name === 'check') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 13 4.5 4.5L19 7" />
      </svg>
    )
  }

  if (name === 'checkDouble') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 12 3.5 3.5L14 8" />
        <path d="m9 12 3.5 3.5L19 7" />
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

  if (name === 'chevronLeft') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18 9 12 15 6" />
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

  if (name === 'comment') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
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

  if (name === 'team') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="3" />
        <path d="M20 20v-2.2a4 4 0 0 0-3-3.8" />
        <path d="M16 4.2a3 3 0 0 1 0 5.6" />
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfWeek(date: Date) {
  const day = date.getDay()
  const result = new Date(date)
  result.setDate(date.getDate() - day)
  return result
}

function endOfWeek(date: Date) {
  const day = date.getDay()
  const result = new Date(date)
  result.setDate(date.getDate() + (6 - day))
  return result
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(date.getDate() + days)
  return result
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function formatCalendarMonth(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

function statusTone(status: string) {
  if (status === 'IN_PROGRESS') return 'inprogress'
  if (status === 'REVIEW') return 'review'
  if (status === 'DONE') return 'done'
  return 'todo'
}

function TaskBadge({
  children,
  tone,
}: {
  children: string
  tone: 'done' | 'high' | 'inprogress' | 'review' | 'todo' | 'urgent'
}) {
  return (
    <span
      className={cx(
        'inline-flex min-h-[26px] items-center rounded-md px-2 text-[13px] leading-none font-bold',
        tone === 'todo' && 'bg-[#f2f4f7] text-[#475467]',
        tone === 'inprogress' && 'bg-[#dbe9ff] text-[#315af2]',
        tone === 'review' && 'bg-[#fef7c3] text-[#b7791f]',
        tone === 'done' && 'bg-[#dcfce7] text-[#15803d]',
        tone === 'high' && 'bg-[#ffedd5] text-[#c2410c]',
        tone === 'urgent' && 'bg-[#fee2e2] text-[#dc2626]',
      )}
    >
      {children}
    </span>
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
    <article className="flex min-h-[112px] items-center justify-between gap-4 rounded-xl border border-[#e5e7eb] bg-white px-6 py-5 shadow-[0_3px_7px_rgba(17,24,39,0.1)]">
      <div>
        <p className="mb-3 text-[15px] leading-none font-bold text-[#667085]">
          {label}
        </p>
        <strong className="block text-[32px] leading-none font-medium text-black">
          {value}
        </strong>
      </div>
      <span
        className={cx(
          'grid h-[50px] w-[50px] shrink-0 place-items-center rounded-xl [&_svg]:h-[27px] [&_svg]:w-[27px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]',
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
      <span className="text-[17px] leading-none font-medium text-[#667085]">
        {label}
      </span>
      <strong className="text-[27px] leading-none font-medium text-black">
        {value}
      </strong>
    </div>
  )
}

function TeamTasksView() {
  return (
    <section aria-labelledby="employee-page-title">
      <h2
        className="mb-7 text-[25px] leading-none font-extrabold text-[#050505]"
        id="employee-page-title"
      >
        Team Tasks
      </h2>

      <div className="mb-5 flex items-center gap-3 text-[#344054] [&_svg]:h-6 [&_svg]:w-6 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
        <Icon name="team" />
        <h3 className="text-[22px] leading-none font-extrabold text-[#050505]">
          Frontend Development
        </h3>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_3px_7px_rgba(17,24,39,0.08)]">
        <div className="grid min-h-[44px] grid-cols-[1.45fr_0.45fr_1fr_0.45fr] items-center bg-white px-6 text-[13px] font-extrabold tracking-[0.02em] text-[#667085] max-[1000px]:min-w-[880px]">
          <span>TITLE</span>
          <span>STATUS</span>
          <span>ASSIGN TO</span>
          <span>DEADLINE</span>
        </div>

        {teamTasks.map((task) => (
          <article
            className="grid min-h-[62px] grid-cols-[1.45fr_0.45fr_1fr_0.45fr] items-center border-t border-[#e5e7eb] px-6 text-[16px] font-medium text-[#050505] max-[1000px]:min-w-[880px]"
            key={task.id}
          >
            <span>{task.title}</span>
            <span>
              <TaskBadge tone={statusTone(task.status)}>{task.status}</TaskBadge>
            </span>
            <span className="text-[#475467]">{task.assignees}</span>
            <span className="text-[#475467]">{task.deadline}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

type CalendarTask = { id: string; title: string }

function CalendarView() {
  const [calendarView, setCalendarView] = useState<'weekly' | 'monthly'>('monthly')
  const [calendarDate, setCalendarDate] = useState(new Date())

  const calendarTasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>()

    const addTask = (id: string, title: string, dateValue: string) => {
      if (!dateValue || dateValue === '-') return

      const parsed = new Date(dateValue)
      if (Number.isNaN(parsed.getTime())) return

      const key = getDayKey(parsed)
      const current = map.get(key) ?? []
      current.push({ id, title })
      map.set(key, current)
    }

    tasks.forEach((task) => addTask(`my-${task.id}`, task.title, task.dueDate))
    teamTasks.forEach((task) =>
      addTask(`team-${task.id}`, task.title, task.deadline),
    )

    return map
  }, [])

  const calendarDays = useMemo(() => {
    const focalDate = new Date(calendarDate)

    const start =
      calendarView === 'monthly'
        ? startOfWeek(startOfMonth(focalDate))
        : startOfWeek(focalDate)

    const end =
      calendarView === 'monthly'
        ? endOfWeek(endOfMonth(focalDate))
        : endOfWeek(focalDate)

    const days: Date[] = []
    let current = new Date(start)

    while (current <= end) {
      days.push(new Date(current))
      current = addDays(current, 1)
    }

    return days
  }, [calendarDate, calendarView])

  return (
    <section className={managerStyles.calendarPanel} aria-label="Calendar">
      <div className={managerStyles.calendarHeader}>
        <div>
          <p className={managerStyles.calendarLabel}>Calendar</p>
          <h3 id="employee-page-title">{formatCalendarMonth(calendarDate)}</h3>
        </div>
        <div className={managerStyles.calendarActions}>
          <button
            type="button"
            className={managerStyles.calendarNav}
            onClick={() => setCalendarDate(addMonths(calendarDate, -1))}
          >
            ‹
          </button>
          <button
            type="button"
            className={managerStyles.calendarNav}
            onClick={() => setCalendarDate(new Date())}
          >
            Today
          </button>
          <button
            type="button"
            className={managerStyles.calendarNav}
            onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
          >
            ›
          </button>
          <button
            type="button"
            className={managerStyles.calendarToggle(calendarView === 'weekly')}
            onClick={() => setCalendarView('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className={managerStyles.calendarToggle(calendarView === 'monthly')}
            onClick={() => setCalendarView('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      <div className={managerStyles.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className={managerStyles.calendarWeekday}>
            {day}
          </div>
        ))}
        {calendarDays.map((day) => {
          const dayKey = getDayKey(day)
          const dayTasks = calendarTasksByDay.get(dayKey) ?? []

          return (
            <article
              key={dayKey}
              className={managerStyles.calendarDay(
                day.getMonth() !== calendarDate.getMonth(),
                isSameDay(day, new Date()),
              )}
            >
              <div className={managerStyles.calendarDayNumber}>
                {day.getDate()}
              </div>
              <div className={managerStyles.calendarDayTasks}>
                {dayTasks.slice(0, 2).map((task) => (
                  <span key={task.id} className={managerStyles.calendarTaskPill()}>
                    {task.title}
                  </span>
                ))}
                {dayTasks.length > 2 ? (
                  <span className={managerStyles.calendarTaskPill(true)}>
                    +{dayTasks.length - 2} more
                  </span>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function normalizeNotification(
  payload: Partial<NotificationDto> & Record<string, unknown>,
): NotificationDto {
  return {
    id: Number(payload.id ?? payload.Id),
    message: String(payload.message ?? payload.Message ?? ''),
    createdAt: String(payload.createdAt ?? payload.CreatedAt ?? ''),
    isRead: Boolean(payload.isRead ?? payload.IsRead ?? false),
  }
}

function getNotificationIcon(message: string): IconName {
  if (/mentioned/i.test(message) && /comment/i.test(message)) {
    return 'comment'
  }

  if (/assigned/i.test(message)) {
    return 'team'
  }

  return 'bell'
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: NotificationDto
  onMarkAsRead?: (id: number) => void
}) {
  const iconName = getNotificationIcon(notification.message)

  return (
    <article
      className={cx(
        'flex min-h-[76px] items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-[0_2px_5px_rgba(17,24,39,0.04)]',
        notification.isRead
          ? 'border-[#e5e7eb]'
          : 'border-[#93c5fd]',
      )}
    >
      <span
        className={cx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-lg [&_svg]:h-6 [&_svg]:w-6 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]',
          notification.isRead
            ? 'bg-[#f2f4f7] text-[#98a2b3]'
            : 'bg-[#eff6ff] text-[#315af2]',
        )}
      >
        <Icon name={iconName} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-[15px] leading-snug font-bold text-[#111827]">
          {notification.message}
        </p>
        <time className="text-[13px] leading-none font-bold text-[#667085]">
          {new Date(notification.createdAt).toLocaleString()}
        </time>
      </div>
      {!notification.isRead && onMarkAsRead ? (
        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-[#315af2] hover:bg-[#eff6ff] [&_svg]:h-6 [&_svg]:w-6 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.5] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]"
          type="button"
          aria-label="Mark as read"
          onClick={() => onMarkAsRead(notification.id)}
        >
          <Icon name="check" />
        </button>
      ) : null}
    </article>
  )
}

function NotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: NotificationDto[]
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
}) {
  const unread = notifications.filter((notification) => !notification.isRead)
  const read = notifications.filter((notification) => notification.isRead)

  return (
    <section aria-labelledby="employee-page-title">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          className="text-[25px] leading-none font-extrabold text-[#050505]"
          id="employee-page-title"
        >
          Notifications
        </h2>
        {unread.length > 0 ? (
          <button
            className="inline-flex items-center gap-2 text-[15px] font-bold text-[#315af2] hover:underline [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.5] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]"
            type="button"
            onClick={onMarkAllAsRead}
          >
            <Icon name="checkDouble" />
            <span>Mark as Read all</span>
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-10 text-center text-[16px] font-medium text-[#6b7280] shadow-[0_2px_5px_rgba(17,24,39,0.04)]">
          No notifications yet.
        </div>
      ) : (
        <div className="grid gap-8">
          {unread.length > 0 ? (
            <section>
              <h3 className="mb-4 text-[13px] font-extrabold tracking-[0.08em] text-[#98a2b3] uppercase">
                Unread ({unread.length})
              </h3>
              <div className="grid gap-4">
                {unread.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {read.length > 0 ? (
            <section>
              <h3 className="mb-4 text-[13px] font-extrabold tracking-[0.08em] text-[#98a2b3] uppercase">
                Read ({read.length})
              </h3>
              <div className="grid gap-4">
                {read.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  )
}

function MyTasksView() {
  return (
    <section aria-labelledby="employee-page-title">
      <div className="mb-7 flex items-center justify-between gap-6">
        <h2
          className="text-[25px] leading-none font-extrabold text-[#050505]"
          id="employee-page-title"
        >
          My Tasks
        </h2>

        <select
          className="h-8 w-[130px] rounded-md border border-[#d0d5dd] bg-white px-3 text-[15px] leading-none font-medium text-[#111827]"
          defaultValue="all"
          aria-label="Task status filter"
        >
          <option value="all">All</option>
          <option value="todo">TODO</option>
          <option value="review">REVIEW</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_3px_7px_rgba(17,24,39,0.08)]">
        <div className="grid min-h-[44px] grid-cols-[1.6fr_0.45fr_0.45fr_0.45fr_0.3fr] items-center bg-white px-6 text-[13px] font-extrabold tracking-[0.02em] text-[#667085] max-[1000px]:min-w-[820px]">
          <span>TITLE</span>
          <span>STATUS</span>
          <span>PRIORITY</span>
          <span>DEADLINE</span>
          <span>TIME</span>
        </div>

        {tasks.map((task) => (
          <article
            className="grid min-h-[62px] grid-cols-[1.6fr_0.45fr_0.45fr_0.45fr_0.3fr] items-center border-t border-[#e5e7eb] px-6 text-[16px] font-medium text-[#050505] max-[1000px]:min-w-[820px]"
            key={task.id}
          >
            <span>{task.title}</span>
            <span>
              <TaskBadge tone={task.status === 'TODO' ? 'todo' : 'review'}>
                {task.status}
              </TaskBadge>
            </span>
            <span>
              <TaskBadge tone={task.priority === 'High' ? 'high' : 'urgent'}>
                {task.priority.toUpperCase()}
              </TaskBadge>
            </span>
            <span className="text-[#475467]">{task.dueDate || '-'}</span>
            <span className="text-[#475467]">
              {task.id === 1 ? '11h' : '2h'}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

function EmployeePage({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<EmployeeView>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
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

  useEffect(() => {
    let cancelled = false
    let connection: signalR.HubConnection | null = null

    async function initNotifications() {
      try {
        const history = await fetchNotifications()
        if (!cancelled) {
          setNotifications(history)
        }
      } catch {
        if (!cancelled) {
          setNotifications([])
        }
      }

      const configuredHubBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(
        /\/$/,
        '',
      )
      const notificationsHubUrl = configuredHubBaseUrl
        ? `${configuredHubBaseUrl}/hubs/notifications`
        : '/hubs/notifications'

      connection = new signalR.HubConnectionBuilder()
        .withUrl(notificationsHubUrl, {
          accessTokenFactory: () => getToken() || '',
        })
        .withAutomaticReconnect()
        .build()

      connection.on(
        'ReceiveNotification',
        (payload: Partial<NotificationDto> & Record<string, unknown>) => {
          const incoming = normalizeNotification(payload)
          setNotifications((current) => {
            if (current.some((item) => item.id === incoming.id)) {
              return current
            }

            return [incoming, ...current]
          })
        },
      )

      try {
        await connection.start()
      } catch {
        // History still works if the live connection fails.
      }
    }

    void initNotifications()

    return () => {
      cancelled = true
      void connection?.stop()
    }
  }, [])

  function handleMarkAsRead(notificationId: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    )
  }

  function handleMarkAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    )
  }

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

          <button className={managerStyles.languageButton} type="button">
            <Icon name="globe" />
            <span>EN</span>
          </button>
        </header>

        <div className="px-6 pt-7 pb-8 max-[820px]:px-5">
          {activeView === 'dashboard' ? (
            <>
              <h2
                className="mb-6 text-[25px] leading-none font-extrabold text-[#050505]"
                id="employee-page-title"
              >
                Dashboard
              </h2>

              <section
                className="mb-6 grid grid-cols-4 gap-[22px] max-[1250px]:grid-cols-2 max-[700px]:grid-cols-1"
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

              <div className="grid grid-cols-2 gap-[22px] max-[1050px]:grid-cols-1">
                <section className="min-h-[240px] rounded-xl border border-[#e5e7eb] bg-white px-6 pt-6 pb-6 shadow-[0_3px_7px_rgba(17,24,39,0.1)]">
                  <h3 className="mb-5 text-[21px] leading-none font-extrabold text-[#050505]">
                    Recent Tasks
                  </h3>

                  <div className="grid gap-3">
                    {tasks.map((task) => (
                      <article
                        className="grid min-h-[68px] grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-[#d9dde5] bg-white px-4 py-3"
                        key={task.id}
                      >
                        <div className="min-w-0">
                          <h4 className="mb-2 truncate text-[16px] leading-none font-extrabold text-[#111827]">
                            {task.title}
                          </h4>
                          <p className="text-[14px] leading-none font-bold text-[#667085]">
                            {task.priority}
                          </p>
                        </div>
                        <div className="grid justify-items-end gap-2">
                          <span className="rounded-md bg-[#f2f4f7] px-2 py-1 text-[12px] leading-none font-extrabold text-[#475467]">
                            {task.status}
                          </span>
                          {task.dueDate ? (
                            <time className="text-[13px] leading-none font-bold text-[#667085]">
                              {task.dueDate}
                            </time>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="min-h-[240px] rounded-xl border border-[#e5e7eb] bg-white px-6 pt-6 pb-6 shadow-[0_3px_7px_rgba(17,24,39,0.1)]">
                  <h3 className="mb-7 text-[21px] leading-none font-extrabold text-[#050505]">
                    Time Summary
                  </h3>

                  <div className="grid gap-6">
                    <SummaryRow label="Total Hours Logged" value="5h" />
                    <SummaryRow label="Tasks Completed" value="0" />
                    <SummaryRow label="Avg Time/Task" value="0h" />
                  </div>
                </section>
              </div>
            </>
          ) : activeView === 'notifications' ? (
            <NotificationsView
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          ) : activeView === 'myTasks' ? (
            <MyTasksView />
          ) : activeView === 'teamTasks' ? (
            <TeamTasksView />
          ) : activeView === 'calendar' ? (
            <CalendarView />
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default EmployeePage
