import { useEffect, useMemo, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { requestTaskReviewApi } from '../api/employeeApi'
import {
  fetchNotifications,
  normalizeNotification,
  sortNotifications,
  type NotificationDto,
} from '../api/notificationsApi'
import {
  markAllNotificationsAsReadApi,
  markNotificationAsReadApi,
} from '../api/notificationApi'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { commonStyles, cx, managerStyles } from '../styles'
import { getToken, getUsername } from '../utils/auth'

type EmployeeView = 'dashboard' | 'notifications' | 'myTasks' | 'calendar'

type TaskTab = 'comments' | 'time' | 'history'

type IconName =
  | 'bell'
  | 'calendar'
  | 'check'
  | 'checkDouble'
  | 'checkCircle'
  | 'chevron'
  | 'chevronLeft'
  | 'clock'
  | 'close'
  | 'comment'
  | 'dashboard'
  | 'globe'
  | 'list'
  | 'logout'
  | 'menu'
  | 'settings'
  | 'warning'
  | 'x'

type TaskAssignee = {
  id: number
  username: string
}

type TaskComment = {
  id: number
  username: string
  content: string
  createdAt: string
}

type TaskWorkSession = {
  id: number
  username: string
  hours: number
  date: string
}

type TaskHistoryItem = {
  id: number
  action: string
  changedByUsername: string
  createdAt: string
}

type MyTask = {
  id: number
  title: string
  description: string
  priority: string
  status: string
  teamName: string
  dueDate: string
  timeLogged: string
  workHours: number
  assignees: TaskAssignee[]
  comments: TaskComment[]
  workSessions: TaskWorkSession[]
  history: TaskHistoryItem[]
}

const initialMyTasks: MyTask[] = [
  {
    id: 1,
    title: 'Implement user authentication flow',
    description:
      'Add OAuth2 integration with Google and GitHub providers. Include proper error handling and token refresh logic.',
    priority: 'High',
    status: 'ToDo',
    teamName: 'Frontend Development',
    dueDate: '6/4/2026',
    timeLogged: '14h',
    workHours: 14,
    assignees: [
      { id: 1, username: 'Alex Wilson' },
      { id: 2, username: 'Maria Garcia' },
    ],
    comments: [
      {
        id: 1,
        username: 'Alex Wilson',
        content:
          "@MariaGarcia can you review the implementation? I've completed the initial version and it's ready for testing.",
        createdAt: '2026-05-23T17:49:33',
      },
      {
        id: 2,
        username: 'Maria Garcia',
        content: 'Made good progress today. Will finish this by end of week.',
        createdAt: '2026-05-22T17:49:33',
      },
    ],
    workSessions: [
      { id: 1, username: 'Alex Wilson', hours: 8, date: '2026-05-21' },
      { id: 2, username: 'Maria Garcia', hours: 6, date: '2026-05-22' },
    ],
    history: [
      {
        id: 1,
        action: 'Task created',
        changedByUsername: 'Manager',
        createdAt: '2026-05-20T10:00:00',
      },
    ],
  },
  {
    id: 2,
    title: 'Fix navigation menu bug',
    description: 'Resolve mobile navigation overlap and broken submenu links.',
    priority: 'Urgent',
    status: 'InProgress',
    teamName: 'Frontend Development',
    dueDate: '',
    timeLogged: '2h',
    workHours: 2,
    assignees: [{ id: 1, username: 'Alex Wilson' }],
    comments: [],
    workSessions: [{ id: 3, username: 'Alex Wilson', hours: 2, date: '2026-05-24' }],
    history: [],
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

  if (name === 'close' || name === 'x') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
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

function normalizeTaskStatus(status: string) {
  return status.replace(/[\s_-]/g, '').toLowerCase()
}

function statusTone(status: string) {
  const normalized = normalizeTaskStatus(status)
  if (normalized === 'inprogress') return 'inprogress'
  if (normalized === 'review') return 'review'
  if (normalized === 'done') return 'done'
  return 'todo'
}

function statusLabel(status: string) {
  const normalized = normalizeTaskStatus(status)
  if (normalized === 'inprogress') return 'In Progress'
  if (normalized === 'review') return 'Review'
  if (normalized === 'done') return 'Done'
  return 'To Do'
}

function canRequestReview(status: string) {
  return normalizeTaskStatus(status) === 'inprogress'
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

function priorityTone(priority: string) {
  const normalized = priority.toLowerCase()
  if (normalized === 'high' || normalized === 'urgent') return 'high'
  if (normalized === 'low') return 'low'
  return 'medium'
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US')
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

type CalendarTask = { id: string; title: string }

function EmployeeTaskDetailModal({
  task,
  activeTab,
  isRequesting,
  onClose,
  onTabChange,
  onRequestComplete,
}: {
  task: MyTask
  activeTab: TaskTab
  isRequesting: boolean
  onClose: () => void
  onTabChange: (tab: TaskTab) => void
  onRequestComplete: () => void
}) {
  return (
    <div className={managerStyles.modalBackdrop} role="presentation">
      <section
        className={`${managerStyles.modal} ${managerStyles.taskDetailModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-task-detail-title"
      >
        <header className={managerStyles.taskDetailHead}>
          <div>
            <div className={managerStyles.taskDetailTitleRow}>
              <h2 id="employee-task-detail-title">{task.title}</h2>
              <span className={commonStyles.priority(priorityTone(task.priority))}>
                {task.priority}
              </span>
              <span className={commonStyles.status(statusTone(task.status))}>
                {statusLabel(task.status)}
              </span>
            </div>
            <p>{task.teamName}</p>
          </div>
          <button
            className={managerStyles.taskDetailClose}
            type="button"
            aria-label="Close task details"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>

        <div className={managerStyles.taskDetailBody}>
          <section className={managerStyles.taskSummary}>
            <h3>Description</h3>
            <p>{task.description}</p>
            <div className={managerStyles.taskFacts}>
              <span>
                <Icon name="calendar" />
                Deadline: {task.dueDate || '-'}
              </span>
              <span>
                <Icon name="clock" />
                Total Time: {task.workHours}h
              </span>
            </div>
          </section>

          <section className={managerStyles.taskAssignees}>
            <div>
              <h3>Assign To</h3>
            </div>
            <div className={managerStyles.taskAssigneeChips}>
              {task.assignees.map((member) => (
                <span key={member.id}>
                  <span className={commonStyles.avatar}>{initials(member.username)}</span>
                  {member.username}
                </span>
              ))}
            </div>
          </section>

          <div className={managerStyles.taskTabs}>
            <button
              className={managerStyles.taskTab(activeTab === 'comments')}
              type="button"
              onClick={() => onTabChange('comments')}
            >
              Comments
            </button>
            <button
              className={managerStyles.taskTab(activeTab === 'time')}
              type="button"
              onClick={() => onTabChange('time')}
            >
              Time Tracking
            </button>
            <button
              className={managerStyles.taskTab(activeTab === 'history')}
              type="button"
              onClick={() => onTabChange('history')}
            >
              History
            </button>
          </div>

          {activeTab === 'comments' ? (
            <section className={managerStyles.taskTabPanel}>
              <textarea placeholder="Add Comment... Use @username to mention someone" />
              <div className={managerStyles.commentActions}>
                <span>
                  Available:{' '}
                  {task.assignees.length
                    ? task.assignees.map((member) => `@${member.username.replace(/\s/g, '')}`).join(', ')
                    : 'No assignees'}
                </span>
                <button type="button">Add Comment</button>
              </div>
              {task.comments.length ? (
                <div className={managerStyles.commentList}>
                  {task.comments.map((comment) => (
                    <article key={comment.id}>
                      <span className={commonStyles.avatar}>
                        {initials(comment.username)}
                      </span>
                      <div>
                        <strong>{comment.username}</strong>
                        <time>{new Date(comment.createdAt).toLocaleString()}</time>
                        <p>{comment.content}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-[#6b7280]">No comments yet.</p>
              )}
            </section>
          ) : null}

          {activeTab === 'time' ? (
            <section className={managerStyles.taskTabPanel}>
              {task.workSessions.length ? (
                task.workSessions.map((session) => (
                  <article className={managerStyles.taskRecord} key={session.id}>
                    <strong>{session.username}</strong>
                    <span>{session.hours}h</span>
                    <time>{formatDate(session.date)}</time>
                  </article>
                ))
              ) : (
                <p className="text-[14px] text-[#6b7280]">No time sessions yet.</p>
              )}
            </section>
          ) : null}

          {activeTab === 'history' ? (
            <section className={managerStyles.taskTabPanel}>
              {task.history.length ? (
                task.history.map((item) => (
                  <article className={managerStyles.taskRecord} key={item.id}>
                    <strong>{item.action}</strong>
                    <span>{item.changedByUsername}</span>
                    <time>{new Date(item.createdAt).toLocaleString()}</time>
                  </article>
                ))
              ) : (
                <p className="text-[14px] text-[#6b7280]">No history yet.</p>
              )}
            </section>
          ) : null}
        </div>

        <footer className={managerStyles.taskDetailFooter}>
          {canRequestReview(task.status) ? (
            <button
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-[#14b86a] px-5 text-[16px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2"
              type="button"
              disabled={isRequesting}
              onClick={onRequestComplete}
            >
              <Icon name="check" />
              {isRequesting ? 'Sending...' : 'Request Complete'}
            </button>
          ) : (
            <span className="text-[14px] font-semibold text-[#6b7280]">
              {normalizeTaskStatus(task.status) === 'review'
                ? 'Waiting for manager review'
                : 'No actions available'}
            </span>
          )}
        </footer>
      </section>
    </div>
  )
}

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

    initialMyTasks.forEach((task) => addTask(`my-${task.id}`, task.title, task.dueDate))

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

function MyTasksView({
  tasks,
  taskMessage,
  onSelectTask,
}: {
  tasks: MyTask[]
  taskMessage: string | null
  onSelectTask: (task: MyTask) => void
}) {
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
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="review">Review</option>
        </select>
      </div>

      {taskMessage ? (
        <p className="mb-4 text-[15px] font-medium text-[#315af2]">{taskMessage}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_3px_7px_rgba(17,24,39,0.08)]">
        <div className="grid min-h-[44px] grid-cols-[1.6fr_0.45fr_0.45fr_0.45fr_0.35fr] items-center bg-white px-6 text-[13px] font-extrabold tracking-[0.02em] text-[#667085] max-[1000px]:min-w-[820px]">
          <span>TITLE</span>
          <span>STATUS</span>
          <span>PRIORITY</span>
          <span>DEADLINE</span>
          <span>TIME</span>
        </div>

        {tasks.map((task) => (
          <article
            className="grid min-h-[62px] cursor-pointer grid-cols-[1.6fr_0.45fr_0.45fr_0.45fr_0.35fr] items-center border-t border-[#e5e7eb] px-6 text-[16px] font-medium text-[#050505] transition hover:bg-[#f8fafc] max-[1000px]:min-w-[820px]"
            key={task.id}
            onClick={() => onSelectTask(task)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectTask(task)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span>{task.title}</span>
            <span>
              <TaskBadge tone={statusTone(task.status)}>
                {statusLabel(task.status)}
              </TaskBadge>
            </span>
            <span>
              <TaskBadge tone={priorityTone(task.priority) === 'high' ? 'high' : 'urgent'}>
                {task.priority.toUpperCase()}
              </TaskBadge>
            </span>
            <span className="text-[#475467]">{task.dueDate || '-'}</span>
            <span className="text-[#475467]">{task.timeLogged}</span>
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
  const [myTasks, setMyTasks] = useState<MyTask[]>(initialMyTasks)
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null)
  const [activeTaskTab, setActiveTaskTab] = useState<TaskTab>('comments')
  const [requestingTaskId, setRequestingTaskId] = useState<number | null>(null)
  const [taskMessage, setTaskMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<{
    text: string
    type: 'error' | 'success'
  } | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const employeeName = getUsername() || 'Alex Wilson'

  const navItems = useMemo(
    () =>
      [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'myTasks', label: 'My Tasks', icon: 'list' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar' },
      ] satisfies Array<{ id: EmployeeView; label: string; icon: IconName }>,
    [],
  )

  function openTask(task: MyTask) {
    setSelectedTask(task)
    setActiveTaskTab('comments')
  }

  function closeTask() {
    setSelectedTask(null)
  }

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

            return sortNotifications([incoming, ...current])
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

  async function handleMarkAsRead(notificationId: number) {
    const target = notifications.find(
      (notification) => notification.id === notificationId,
    )

    if (!target || target.isRead) {
      return
    }

    const previous = notifications

    setNotifications((current) =>
      sortNotifications(
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      ),
    )

    try {
      await markNotificationAsReadApi(notificationId)
    } catch {
      setNotifications(previous)
    }
  }

  async function handleMarkAllAsRead() {
    if (!notifications.some((notification) => !notification.isRead)) {
      return
    }

    const previous = notifications

    setNotifications((current) =>
      sortNotifications(
        current.map((notification) => ({ ...notification, isRead: true })),
      ),
    )

    try {
      await markAllNotificationsAsReadApi()
    } catch {
      setNotifications(previous)
    }
  }

  async function handleRequestReview(taskId: number) {
    const previousTasks = myTasks
    const updatedTasks = myTasks.map((task) =>
      task.id === taskId ? { ...task, status: 'Review' } : task,
    )
    const updatedTask = updatedTasks.find((task) => task.id === taskId) ?? null

    setMyTasks(updatedTasks)
    if (selectedTask?.id === taskId && updatedTask) {
      setSelectedTask(updatedTask)
    }
    setRequestingTaskId(taskId)
    setTaskMessage(null)

    try {
      await requestTaskReviewApi(taskId)
      setTaskMessage('Task moved to Review.')
    } catch (error) {
      setMyTasks(previousTasks)
      if (selectedTask?.id === taskId) {
        setSelectedTask(previousTasks.find((task) => task.id === taskId) ?? null)
      }
      setTaskMessage(
        error instanceof Error ? error.message : 'Could not request review.',
      )
    } finally {
      setRequestingTaskId(null)
    }
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
          <button
            className={managerStyles.footerButton}
            type="button"
            onClick={() => setIsSettingsOpen(true)}
          >
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
          {pageMessage ? (
            <p
              className={`${managerStyles.message} ${commonStyles.message(pageMessage.type)}`}
              role="status"
            >
              {pageMessage.text}
            </p>
          ) : null}

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
                    {myTasks.map((task) => (
                      <article
                        className="grid min-h-[68px] cursor-pointer grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-[#d9dde5] bg-white px-4 py-3 transition hover:border-[#93c5fd] hover:bg-[#f8fbff]"
                        key={task.id}
                        onClick={() => openTask(task)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openTask(task)
                          }
                        }}
                        role="button"
                        tabIndex={0}
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
                            {statusLabel(task.status)}
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
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={(notificationId) => {
                void handleMarkAsRead(notificationId)
              }}
              onMarkAllAsRead={() => {
                void handleMarkAllAsRead()
              }}
              title="Notifications"
              emptyMessage="No notifications yet."
              markAllLabel="Mark as Read all"
              unreadLabel={(count) => `Unread (${count})`}
              readLabel={(count) => `Read (${count})`}
              titleId="employee-page-title"
            />
          ) : activeView === 'myTasks' ? (
            <MyTasksView
              tasks={myTasks}
              taskMessage={taskMessage}
              onSelectTask={openTask}
            />
          ) : activeView === 'calendar' ? (
            <CalendarView />
          ) : null}
        </div>
      </section>

      {selectedTask ? (
        <EmployeeTaskDetailModal
          task={selectedTask}
          activeTab={activeTaskTab}
          isRequesting={requestingTaskId === selectedTask.id}
          onClose={closeTask}
          onTabChange={setActiveTaskTab}
          onRequestComplete={() => {
            void handleRequestReview(selectedTask.id)
          }}
        />
      ) : null}

      <ChangePasswordModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={(text) => {
          setIsSettingsOpen(false)
          setPageMessage({ text, type: 'success' })
        }}
        onError={(text) => setPageMessage({ text, type: 'error' })}
        variant="manager"
      />
    </main>
  )
}

export default EmployeePage
