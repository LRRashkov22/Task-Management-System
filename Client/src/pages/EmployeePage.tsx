import { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { commonStyles, managerStyles } from '../styles'
import { getToken, getUsername } from '../utils/auth'

type NotificationDto = {
  id: number
  message: string
  createdAt: string
}

function EmployeePage({
  onLogout,
}: {
  onLogout: () => void
}) {
  const [notifications, setNotifications] = useState<
    NotificationDto[]
  >([])

  const [connectionStatus, setConnectionStatus] =
    useState('Connecting...')

  const username = getUsername()

  useEffect(() => {
    const token = getToken()

const connection = new signalR.HubConnectionBuilder()
  .withUrl(
    `${import.meta.env.VITE_API_BASE_URL}/hubs/notifications`,
    {
      accessTokenFactory: () =>
        localStorage.getItem("token") || "",
    }
  )
  .withAutomaticReconnect()
  .build();

    connection.on(
      'ReceiveNotification',
      (notification: NotificationDto) => {
        setNotifications((current) => [
          notification,
          ...current,
        ])
      },
    )

    connection
      .start()
      .then(() => {
        setConnectionStatus('Connected')
      })
      .catch(() => {
        setConnectionStatus('Connection failed')
      })

    return () => {
      connection.stop()
    }
  }, [])

  return (
    <main className={managerStyles.shell(true)}>
      <section className={managerStyles.main}>
        <header className={managerStyles.topbar(true)}>
          <div>
            <h2 className="text-[24px] font-bold">
              Employee Panel
            </h2>

            <p className="text-sm text-[#6b7280]">
              Welcome {username}
            </p>
          </div>

          <button
            className={managerStyles.languageButton}
            onClick={onLogout}
          >
            Logout
          </button>
        </header>

        <div className={managerStyles.content}>
          <div className="mb-6">
            <div
              className={`${commonStyles.message(
                connectionStatus === 'Connected'
                  ? 'success'
                  : 'error',
              )}`}
            >
              SignalR: {connectionStatus}
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[22px] font-bold">
                Notifications
              </h3>

              <span className="rounded-full bg-[#315af2] px-3 py-1 text-sm font-bold text-white">
                {notifications.length}
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-10 text-center text-[#6b7280]">
                No notifications yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4"
                  >
                    <div className="mb-2 text-[15px] font-semibold text-[#111827]">
                      {notification.message}
                    </div>

                    <div className="text-sm text-[#6b7280]">
                      {new Date(
                        notification.createdAt,
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default EmployeePage