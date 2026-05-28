import {
  sortNotifications,
  type NotificationDto,
} from '../api/notificationsApi'
import { cx } from '../styles'

type NotificationIconName = 'bell' | 'comment' | 'list' | 'check' | 'checkDouble'

function NotificationIcon({ name }: { name: NotificationIconName }) {
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

  if (name === 'comment') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
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

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M9.8 21a2.4 2.4 0 0 0 4.4 0" />
    </svg>
  )
}

function getNotificationIcon(message: string): NotificationIconName {
  if (/mentioned/i.test(message) && /comment/i.test(message)) {
    return 'comment'
  }

  if (/assigned/i.test(message)) {
    return 'list'
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
        notification.isRead ? 'border-[#e5e7eb]' : 'border-[#93c5fd]',
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
        <NotificationIcon name={iconName} />
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
          <NotificationIcon name="check" />
        </button>
      ) : null}
    </article>
  )
}

export type NotificationsPanelProps = {
  notifications: NotificationDto[]
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
  title: string
  emptyMessage: string
  markAllLabel: string
  unreadLabel: (count: number) => string
  readLabel: (count: number) => string
  isLoading?: boolean
  loadingMessage?: string
  titleId?: string
}

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  title,
  emptyMessage,
  markAllLabel,
  unreadLabel,
  readLabel,
  isLoading = false,
  loadingMessage = 'Loading...',
  titleId = 'notifications-page-title',
}: NotificationsPanelProps) {
  const sorted = sortNotifications(notifications)
  const unread = sorted.filter((notification) => !notification.isRead)
  const read = sorted.filter((notification) => notification.isRead)

  if (isLoading) {
    return (
      <section aria-labelledby={titleId}>
        <div className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-10 text-center text-[16px] font-medium text-[#6b7280] shadow-[0_2px_5px_rgba(17,24,39,0.04)]">
          {loadingMessage}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          className="text-[25px] leading-none font-extrabold text-[#050505]"
          id={titleId}
        >
          {title}
        </h2>
        {unread.length > 0 ? (
          <button
            className="inline-flex items-center gap-2 text-[15px] font-bold text-[#315af2] hover:underline [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.5] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]"
            type="button"
            onClick={onMarkAllAsRead}
          >
            <NotificationIcon name="checkDouble" />
            <span>{markAllLabel}</span>
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-10 text-center text-[16px] font-medium text-[#6b7280] shadow-[0_2px_5px_rgba(17,24,39,0.04)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-8">
          {unread.length > 0 ? (
            <section>
              <h3 className="mb-4 text-[13px] font-extrabold tracking-[0.08em] text-[#98a2b3] uppercase">
                {unreadLabel(unread.length)}
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
                {readLabel(read.length)}
              </h3>
              <div className="grid gap-4">
                {read.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  )
}
