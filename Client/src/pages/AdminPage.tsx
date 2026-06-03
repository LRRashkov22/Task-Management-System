  import * as signalR from '@microsoft/signalr'
  import { useCallback, useEffect, useState } from 'react'
  import type { FormEvent } from 'react'
  import {
    createUserApi,
    deleteEmployeeApi,
    deleteArchivedTaskApi,
    deleteArchivedTeamApi,
    editUserApi,
    forceDeleteManagerApi,
    getAdminDashboardApi,
    getAdminDeleteManagerPreviewApi,
    getAdminLogsApi,
    getArchivedTasksApi,
    getArchivedTeamsApi,
    getEmployeesApi,
    getManagersApi,
    recoverArchivedTaskApi,
    recoverArchivedTeamApi,
    searchEmployeesApi,
    transferManagerOwnershipApi,
  } from '../api/adminApi'
  import type {
    AdminDashboardDto,
    AdminDeleteManagerPreviewDto,
    AdminLogDto,
    AdminUserDto,
    ArchivedTaskDto,
    ArchivedTeamDto,
  } from '../api/adminApi'
  import {
    markAllNotificationsAsReadApi,
    markNotificationAsReadApi,
  } from '../api/notificationApi'
  import {
    fetchNotifications,
    normalizeNotification,
    sortNotifications,
    type NotificationDto,
  } from '../api/notificationsApi'
  import { NotificationsPanel } from '../components/NotificationsPanel'
  import { adminStyles, commonStyles } from '../styles'
  import { ChangePasswordModal } from '../components/ChangePasswordModal'
  import { getToken } from '../utils/auth'
  import {
    buildPaginationItems,
    getPaginationRangeLabel,
  } from '../utils/pagination'

  type IconName =
    | 'dashboard'
    | 'bell'
    | 'users'
    | 'manager'
    | 'logs'
    | 'settings'
    | 'logout'
    | 'close'
    | 'menu'
    | 'globe'
    | 'activity'
    | 'search'
    | 'restore'
    | 'trash'
    | 'edit'

  type NavItem = {
    id: AdminView
    label: string
    icon: IconName
  }

  type StatCard = {
    label: string
    value: string
    icon: IconName
    tone: 'blue' | 'purple' | 'green' | 'orange'
  }

  type Language = 'en' | 'bg'
  type AdminView =
    | 'dashboard'
    | 'notifications'
    | 'users'
    | 'managers'
    | 'archivedTasks'
    | 'archivedTeams'
    | 'logs'
  type CreateModal = 'user' | 'manager' | null
  type DeleteManagerMode = 'transfer' | 'cascade'
  type LogFilterValue = 'all' | '1' | '2' | '3' | '4'

  type CreateForm = {
    username: string
    password: string
    managerId: string
  }

  type StatusMessage = {
    text: string
    type: 'error' | 'success'
  }

  const logModuleOptions = [
    { value: 'all', label: 'All modules' },
    { value: '1', label: 'Identity' },
    { value: '2', label: 'Tasks' },
    { value: '3', label: 'Teams' },
  ] as const

  const logActionOptions = [
    { value: 'all', label: 'All actions' },
    { value: '1', label: 'Create' },
    { value: '2', label: 'Replace' },
    { value: '3', label: 'Modify' },
    { value: '4', label: 'Remove' },
  ] as const

  function getLogModuleLabel(module: AdminLogDto['module']) {
    const value = String(module).toLowerCase()

    if (value === '1' || value === 'identity') return 'Identity'
    if (value === '2' || value === 'tasks') return 'Tasks'
    if (value === '3' || value === 'teams') return 'Teams'

    return 'Unknown'
  }

  function getLogActionLabel(actionType: AdminLogDto['actionType']) {
    const value = String(actionType).toLowerCase()

    if (value === '1' || value === 'create') return 'Create'
    if (value === '2' || value === 'replace') return 'Replace'
    if (value === '3' || value === 'modify') return 'Modify'
    if (value === '4' || value === 'remove') return 'Remove'

    return 'Activity'
  }

  function getLogActionBadge(actionType: AdminLogDto['actionType']) {
    const label = getLogActionLabel(actionType)
    const base =
      'inline-flex min-h-7 items-center justify-center rounded-full px-3 text-[12px] font-extrabold'

    if (label === 'Create') return `${base} bg-[#dcfce7] text-[#15803d]`
    if (label === 'Replace') return `${base} bg-[#e0f2fe] text-[#0369a1]`
    if (label === 'Modify') return `${base} bg-[#fef3c7] text-[#b45309]`
    if (label === 'Remove') return `${base} bg-[#fee2e2] text-[#dc2626]`

    return `${base} bg-[#f3f4f6] text-[#4b5563]`
  }

  function getLogModuleBadge(module: AdminLogDto['module']) {
    const label = getLogModuleLabel(module)
    const base =
      'inline-flex min-h-7 items-center justify-center rounded-full px-3 text-[12px] font-extrabold'

    if (label === 'Identity') return `${base} bg-[#eef5ff] text-[#315af2]`
    if (label === 'Tasks') return `${base} bg-[#ecfdf5] text-[#047857]`
    if (label === 'Teams') return `${base} bg-[#fff7ed] text-[#c2410c]`

    return `${base} bg-[#f3f4f6] text-[#4b5563]`
  }

  function getLogActionText(log: AdminLogDto) {
    if (log.action?.trim()) {
      return log.action.trim()
    }

    return `${getLogActionLabel(log.actionType)} event in ${getLogModuleLabel(
      log.module,
    )}`
  }

  function formatLogDate(value?: string | null) {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const translations = {
    en: {
      brand: 'TaskMan',
      systemAdmin: 'System Admin',
      admin: 'Admin',
      dashboard: 'Dashboard',
      notifications: 'Notifications',
      users: 'Employees',
      managers: 'Managers',
      archivedTasks: 'Archived Tasks',
      archivedTeams: 'Archived Teams',
      logs: 'Logs',
      settings: 'Settings',
      tasks: 'Tasks',
      teams: 'Teams',
      title: 'Title',
      team: 'Team',
      assigned: 'Assigned',
      members: 'Members',
      taskCount: 'Tasks',
      actions: 'Actions',
      recover: 'Recover',
      deleteForever: 'Delete permanently',
      closeMenu: 'Close menu',
      openMenu: 'Open menu',
      noNotifications: 'No notifications yet',
      markAllAsRead: 'Mark as Read all',
      unread: (count: number) => `Unread (${count})`,
      read: (count: number) => `Read (${count})`,
      createUser: 'Create Employee',
      createManager: 'Create Manager',
      password: 'Password',
      selectManager: 'Select manager',
      cancel: 'Cancel',
      save: 'Save',
      search: 'Search',
      name: 'Name',
      email: 'Email',
      manager: 'Manager',
      edit: 'Edit',
      loading: 'Loading...',
      empty: 'No data yet',
      username: 'Username',
      apiError: 'Could not load data from the server.',
      created: 'Created successfully.',
      updated: 'Updated successfully.',
      archiveRecovered: 'Recovered successfully.',
      archiveDeleted: 'Deleted permanently.',
      changePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      passwordChanged: 'Password changed successfully.',
      passwordMismatch: 'New passwords do not match.',
      passwordRequired: 'All password fields are required.',
      passwordInvalid:
        'Password must contain uppercase, lowercase, number and special symbol.',
    },
    bg: {
      brand: 'TaskMan',
      systemAdmin: 'System Admin',
      archivedTasks: 'Archived Tasks',
      archivedTeams: 'Archived Teams',
      title: 'Title',
      team: 'Team',
      assigned: 'Assigned',
      members: 'Members',
      taskCount: 'Tasks',
      actions: 'Actions',
      recover: 'Recover',
      deleteForever: 'Delete permanently',
      archiveRecovered: 'Recovered successfully.',
      archiveDeleted: 'Deleted permanently.',
      admin: 'Администратор',
      dashboard: 'Табло',
      notifications: 'Известия',
      users: 'Служители',
      managers: 'Мениджъри',
      logs: 'Логове',
      settings: 'Настройки',
      tasks: 'Задачи',
      teams: 'Екипи',
      closeMenu: 'Затвори менюто',
      openMenu: 'Отвори менюто',
      noNotifications: 'Все още няма известия',
      markAllAsRead: 'Маркирай всички като прочетени',
      unread: (count: number) => `Непрочетени (${count})`,
      read: (count: number) => `Прочетени (${count})`,
      createUser: 'Създай служител',
      createManager: 'Създай мениджър',
      password: 'Парола',
      selectManager: 'Избери мениджър',
      cancel: 'Отказ',
      save: 'Запази',
      search: 'Търсене',
      name: 'Име',
      email: 'Имейл',
      manager: 'Мениджър',
      edit: 'Редакция',
      loading: 'Зареждане...',
      empty: 'Все още няма данни',
      username: 'Потребителско име',
      apiError: 'Данните не могат да бъдат заредени от сървъра.',
      created: 'Създадено успешно.',
      updated: 'Обновено успешно.',
      changePassword: 'Смяна на парола',
      currentPassword: 'Текуща парола',
      newPassword: 'Нова парола',
      confirmPassword: 'Потвърди новата парола',
      passwordChanged: 'Паролата е сменена успешно.',
      passwordMismatch: 'Новите пароли не съвпадат.',
      passwordRequired: 'Попълни всички полета за парола.',
      passwordInvalid:
        'Паролата трябва да съдържа главна, малка буква, цифра и специален символ.',
    },
  }

  const emptyDashboard: AdminDashboardDto = {
    firstEntity: 0,
    secondEntitu: 0,
    thirdEntity: 0,
    fourthEntity: 0,
  }

  const emptyCreateForm: CreateForm = {
    username: '',
    password: '',
    managerId: '',
  }

  const usernameRegex = /^[A-Za-z]{4,}$/

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

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

    if (name === 'search') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )
    }

    if (name === 'restore') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v6h6" />
        </svg>
      )
    }

    if (name === 'trash') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6 18 20H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      )
    }

    if (name === 'edit') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      )
    }

    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    )
  }

  

  function AdminPage({ onLogout }: { onLogout: () => void }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [language, setLanguage] = useState<Language>('en')
    const [activeView, setActiveView] = useState<AdminView>('dashboard')
    const [createModal, setCreateModal] = useState<CreateModal>(null)
    const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null)
    const [deleteManager, setDeleteManager] = useState<AdminUserDto | null>(null)
    const [deleteManagerPreview, setDeleteManagerPreview] =
      useState<AdminDeleteManagerPreviewDto | null>(null)
    const [deleteManagerMode, setDeleteManagerMode] =
      useState<DeleteManagerMode>('transfer')
    const [deleteTransferManagerId, setDeleteTransferManagerId] = useState('')
    const [isDeletePreviewLoading, setIsDeletePreviewLoading] = useState(false)
    const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [logModuleFilter, setLogModuleFilter] =
      useState<LogFilterValue>('all')
    const [logActionFilter, setLogActionFilter] =
      useState<LogFilterValue>('all')
    const [logPage, setLogPage] = useState(1)
    const [logPageSize, setLogPageSize] = useState(20)
    const [dashboard, setDashboard] =
      useState<AdminDashboardDto>(emptyDashboard)
    const [employees, setEmployees] = useState<AdminUserDto[]>([])
    const [displayedEmployees, setDisplayedEmployees] = useState<AdminUserDto[]>([])
    const [employeePage, setEmployeePage] = useState(1)
    const [employeePageSize] = useState(10)
    const [employeeTotalCount, setEmployeeTotalCount] = useState(0)
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false)
    const [deleteEmployee, setDeleteEmployee] = useState<AdminUserDto | null>(null)
    const [managers, setManagers] = useState<AdminUserDto[]>([])
    const [archivedTasks, setArchivedTasks] = useState<ArchivedTaskDto[]>([])
    const [archivedTeams, setArchivedTeams] = useState<ArchivedTeamDto[]>([])
    const [logs, setLogs] = useState<AdminLogDto[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)
    const [isLogsLoading, setIsLogsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [pendingArchiveAction, setPendingArchiveAction] = useState<
      string | null
    >(null)
    const [message, setMessage] = useState<StatusMessage | null>(null)
    const [notifications, setNotifications] = useState<NotificationDto[]>([])
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
    const t = translations[language]

    const loadAdminData = useCallback(async () => {
      try {
        const [dashboardData, employeeData, managerData] = await Promise.all([
          getAdminDashboardApi(),
          getEmployeesApi(),
          getManagersApi(),
        ])

        setDashboard(dashboardData)
        setEmployees(employeeData)
        setEmployeeTotalCount(
          dashboardData.firstEntity || employeeData.length,
        )
        setManagers(managerData)
      } catch (error) {
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    }, [t.apiError])

    const loadArchivedTasks = useCallback(async () => {
      setIsArchiveLoading(true)

      try {
        setArchivedTasks(await getArchivedTasksApi())
      } catch (error) {
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      } finally {
        setIsArchiveLoading(false)
      }
    }, [t.apiError])

    const loadArchivedTeams = useCallback(async () => {
      setIsArchiveLoading(true)

      try {
        setArchivedTeams(await getArchivedTeamsApi())
      } catch (error) {
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      } finally {
        setIsArchiveLoading(false)
      }
    }, [t.apiError])

    const loadLogs = useCallback(async () => {
      setIsLogsLoading(true)

      try {
        setLogs(
          await getAdminLogsApi({
            sortBy: 'createdAt',
            sortDirection: 'desc',
            page: logPage,
            pageSize: logPageSize,
            module:
              logModuleFilter === 'all' ? undefined : Number(logModuleFilter),
            actionType:
              logActionFilter === 'all' ? undefined : Number(logActionFilter),
          }),
        )
      } catch (error) {
        setLogs([])
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      } finally {
        setIsLogsLoading(false)
      }
    }, [
      logActionFilter,
      logModuleFilter,
      logPage,
      logPageSize,
      t.apiError,
    ])

    const loadEmployeesPage = useCallback(async () => {
      setIsEmployeesLoading(true)

      try {
        const pageData = await searchEmployeesApi(
          searchQuery.trim(),
          employeePage,
          employeePageSize,
        )
        setDisplayedEmployees(pageData)

        if (searchQuery.trim()) {
          if (pageData.length < employeePageSize) {
            setEmployeeTotalCount(
              (employeePage - 1) * employeePageSize + pageData.length,
            )
          } else if (employeePage === 1) {
            setEmployeeTotalCount((current) =>
              current > employeePageSize ? current : employeePageSize + 1,
            )
          }
        }
      } catch (error) {
        setDisplayedEmployees([])
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      } finally {
        setIsEmployeesLoading(false)
      }
    }, [employeePage, employeePageSize, searchQuery, t.apiError])

    const handleMarkAsRead = useCallback(
      async (notificationId: number) => {
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
        } catch (error) {
          setNotifications(previous)
          setMessage({
            text: error instanceof Error ? error.message : t.apiError,
            type: 'error',
          })
        }
      },
      [notifications, t.apiError],
    )

    const handleMarkAllAsRead = useCallback(async () => {
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
      } catch (error) {
        setNotifications(previous)
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      }
    }, [notifications, t.apiError])
    
useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadAdminData()
  }, 0)

  return () => window.clearTimeout(timeoutId)
}, [loadAdminData])

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    if (activeView === 'archivedTasks') {
      void loadArchivedTasks()
    }

    if (activeView === 'archivedTeams') {
      void loadArchivedTeams()
    }
  }, 0)

  return () => window.clearTimeout(timeoutId)
}, [activeView, loadArchivedTasks, loadArchivedTeams])

useEffect(() => {
  if (activeView !== 'logs') {
    return
  }

  const timeoutId = window.setTimeout(() => {
    void loadLogs()
  }, 0)

  return () => window.clearTimeout(timeoutId)
}, [activeView, loadLogs])

useEffect(() => {
  if (activeView !== 'users') {
    return
  }

  const timeoutId = window.setTimeout(() => {
    void loadEmployeesPage()
  }, 0)

  return () => window.clearTimeout(timeoutId)
}, [activeView, loadEmployeesPage])

useEffect(() => {
  let cancelled = false
  let connection: signalR.HubConnection | null = null

  async function initNotifications() {
    setIsNotificationsLoading(true)

    try {
      const history = await fetchNotifications()
      if (!cancelled) {
        setNotifications(history)
      }
    } catch (error) {
      if (!cancelled) {
        setNotifications([])
        setMessage({
          text: error instanceof Error ? error.message : t.apiError,
          type: 'error',
        })
      }
    } finally {
      if (!cancelled) {
        setIsNotificationsLoading(false)
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
}, [t.apiError])

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    setMessage(null)
  }, 0)

  return () => window.clearTimeout(timeoutId)
}, [activeView])

    // useEffect(() => {
    //   const timeoutId = window.setTimeout(() => {
    //     void loadAdminData()
    //   }, 0)

    //   return () => window.clearTimeout(timeoutId)
    // }, [loadAdminData])

    // useEffect(() => {
    //   let isCurrent = true

    //   async function loadEmployeesBySearch() {
    //     if (!searchQuery.trim()) {
    //       try {
    //         const employeeData = await getEmployeesApi()
    //         if (isCurrent) setEmployees(employeeData)
    //       } catch (error) {
    //         if (isCurrent) {
    //           setMessage({
    //             text: error instanceof Error ? error.message : t.apiError,
    //             type: 'error',
    //           })
    //         }
    //       }
    //       return
    //     }

    //     try {
    //       const employeeData = await searchEmployeesApi(searchQuery.trim())
    //       if (isCurrent) setEmployees(employeeData)
    //     } catch (error) {
    //       if (isCurrent) {
    //         setMessage({
    //           text: error instanceof Error ? error.message : t.apiError,
    //           type: 'error',
    //         })
    //       }
    //     }
    //   }

    //   const timeoutId = window.setTimeout(() => {
    //     void loadEmployeesBySearch()
    //   }, 300)

    //   return () => {
    //     isCurrent = false
    //     window.clearTimeout(timeoutId)
    //   }
    // }, [searchQuery, t.apiError])

    function openCreateModal(modal: Exclude<CreateModal, null>) {
      setEditingUser(null)
      setCreateForm(emptyCreateForm)
      setMessage(null)
      setCreateModal(modal)
    }

    function openEditModal(user: AdminUserDto, modal: Exclude<CreateModal, null>) {
      const manager = managers.find(
        (currentManager) => currentManager.username === user.managerName,
      )

      setEditingUser(user)
      setCreateForm({
        username: user.username,
        password: '',
        managerId: manager ? String(manager.id) : '',
      })
      setMessage(null)
      setCreateModal(modal)
    }

    async function openDeleteManagerModal(manager: AdminUserDto) {
      setDeleteManager(manager)
      setDeleteManagerPreview(null)
      setDeleteManagerMode('transfer')
      setDeleteTransferManagerId('')
      setMessage(null)
      setIsDeletePreviewLoading(true)

      try {
        setDeleteManagerPreview(await getAdminDeleteManagerPreviewApi(manager.id))
      } catch (error) {
        setMessage({
          text:
            error instanceof Error
              ? error.message
              : 'Could not load manager delete preview.',
          type: 'error',
        })
      } finally {
        setIsDeletePreviewLoading(false)
      }
    }

    function closeDeleteManagerModal() {
      setDeleteManager(null)
      setDeleteManagerPreview(null)
      setDeleteTransferManagerId('')
      setDeleteManagerMode('transfer')
    }

    
async function refreshAdminData() {
  const [updatedEmployees, updatedManagers, updatedDashboard] =
    await Promise.all([
      getEmployeesApi(),
      getManagersApi(),
      getAdminDashboardApi(),
    ])

  setEmployees(updatedEmployees)
  setEmployeeTotalCount(
    updatedDashboard.firstEntity || updatedEmployees.length,
  )
  setManagers(updatedManagers)
  setDashboard(updatedDashboard)
}

async function handleSearch(value: string) {
  setSearchQuery(value)
  setEmployeePage(1)

  if (!value.trim()) {
    setEmployeeTotalCount(dashboard.firstEntity || employees.length)
  }
}

async function handleDeleteEmployeeSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  if (!deleteEmployee) return

  setIsSaving(true)
  setMessage(null)

  try {
    await deleteEmployeeApi(deleteEmployee.id)
    await refreshAdminData()
    if (activeView === 'users') {
      await loadEmployeesPage()
    }
    setEmployeePage(1)
    setDeleteEmployee(null)
    setMessage({ text: 'Employee deleted successfully.', type: 'success' })
  } catch (error) {
    setMessage({
      text: error instanceof Error ? error.message : t.apiError,
      type: 'error',
    })
  } finally {
    setIsSaving(false)
  }
}

function closeDeleteEmployeeModal() {
  setDeleteEmployee(null)
}

async function refreshDashboardSummary() {
  setDashboard(await getAdminDashboardApi())
}

async function handleRecoverArchivedTask(id: number) {
  setPendingArchiveAction(`task-recover-${id}`)
  setMessage(null)

  try {
    await recoverArchivedTaskApi(id)
    await Promise.all([loadArchivedTasks(), refreshDashboardSummary()])
    setMessage({ text: t.archiveRecovered, type: 'success' })
  } catch (error) {
    setMessage({
      text: error instanceof Error ? error.message : t.apiError,
      type: 'error',
    })
  } finally {
    setPendingArchiveAction(null)
  }
}

async function handleDeleteArchivedTask(id: number) {
  if (!window.confirm('Delete this archived task permanently?')) return

  setPendingArchiveAction(`task-delete-${id}`)
  setMessage(null)

  try {
    await deleteArchivedTaskApi(id)
    await loadArchivedTasks()
    setMessage({ text: t.archiveDeleted, type: 'success' })
  } catch (error) {
    setMessage({
      text: error instanceof Error ? error.message : t.apiError,
      type: 'error',
    })
  } finally {
    setPendingArchiveAction(null)
  }
}

async function handleRecoverArchivedTeam(id: number) {
  setPendingArchiveAction(`team-recover-${id}`)
  setMessage(null)

  try {
    await recoverArchivedTeamApi(id)
    await Promise.all([loadArchivedTeams(), refreshDashboardSummary()])
    setMessage({ text: t.archiveRecovered, type: 'success' })
  } catch (error) {
    setMessage({
      text: error instanceof Error ? error.message : t.apiError,
      type: 'error',
    })
  } finally {
    setPendingArchiveAction(null)
  }
}

async function handleDeleteArchivedTeam(id: number) {
  if (!window.confirm('Delete this archived team permanently?')) return

  setPendingArchiveAction(`team-delete-${id}`)
  setMessage(null)

  try {
    await deleteArchivedTeamApi(id)
    await loadArchivedTeams()
    setMessage({ text: t.archiveDeleted, type: 'success' })
  } catch (error) {
    setMessage({
      text: error instanceof Error ? error.message : t.apiError,
      type: 'error',
    })
  } finally {
    setPendingArchiveAction(null)
  }
}

async function handleDeleteManagerSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  if (!deleteManager) return

  if (deleteManagerMode === 'transfer' && !deleteTransferManagerId) {
    setMessage({
      text: 'Select manager for transfer.',
      type: 'error',
    })
    return
  }

  setIsSaving(true)
  setMessage(null)

  try {
    if (deleteManagerMode === 'transfer') {
      await transferManagerOwnershipApi({
        currentManagerId: deleteManager.id,
        newManagerId: Number(deleteTransferManagerId),
      })
    }

    await forceDeleteManagerApi(deleteManager.id)
    await refreshAdminData()
    closeDeleteManagerModal()
    setMessage({ text: 'Manager deleted successfully.', type: 'success' })
  } catch (error) {
    setMessage({
      text: error instanceof Error ? error.message : t.apiError,
      type: 'error',
    })
  } finally {
    setIsSaving(false)
  }
}

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!createModal) return

    const username = createForm.username.trim()

    // USERNAME VALIDATION
    if (!usernameRegex.test(username)) {
      setMessage({
        text:
          'Username must be at least 4 letters and cannot contain numbers or special symbols.',
        type: 'error',
      })
      return
    }

    // PASSWORD VALIDATION
    if (!editingUser && !passwordRegex.test(createForm.password)) {
      setMessage({
        text:
          'Password must contain uppercase, lowercase, number and special symbol.',
        type: 'error',
      })
      return
    }

    // EMPTY FIELDS VALIDATION
    if (!username || (!editingUser && !createForm.password)) {
      setMessage({
        text: 'Username and password are required.',
        type: 'error',
      })
      return
    }

    // USER MUST HAVE MANAGER
    if (createModal === 'user' && !createForm.managerId) {
      setMessage({
        text: 'Select manager for the employee.',
        type: 'error',
      })
      return
    }

    setIsSaving(true)
    setMessage(null)

try {
  if (editingUser) {
    await editUserApi({
      id: editingUser.id,
      username,
      managerId:
        createModal === 'user'
          ? Number(createForm.managerId)
          : null,
    })
  } else {
    await createUserApi({
      username,
      password: createForm.password,
      role: createModal === 'manager' ? 2 : 3,
      managerId:
        createModal === 'user'
          ? Number(createForm.managerId)
          : null,
    })
  }

  await refreshAdminData()
  if (activeView === 'users') {
    await loadEmployeesPage()
  }

  // reset
  setCreateModal(null)
  setEditingUser(null)
  setCreateForm(emptyCreateForm)
  setSearchQuery('')

  setMessage({
    text: editingUser ? t.updated : t.created,
    type: 'success',
  })
} catch (error) {
  setMessage({
    text: error instanceof Error
      ? error.message
      : t.apiError,
    type: 'error',
  })
} finally {
  setIsSaving(false)
}
  }
    const navItems: NavItem[] = [
      { id: 'dashboard', label: t.dashboard, icon: 'dashboard' },
      { id: 'notifications', label: t.notifications, icon: 'bell' },
      { id: 'users', label: t.users, icon: 'users' },
      { id: 'managers', label: t.managers, icon: 'manager' },
      { id: 'archivedTasks', label: t.archivedTasks, icon: 'users' },
      { id: 'archivedTeams', label: t.archivedTeams, icon: 'users' },
      { id: 'logs', label: t.logs, icon: 'logs' },
    ]

    const statCards: StatCard[] = [
      {
        label: t.users,
        value: String(dashboard.firstEntity),
        icon: 'users',
        tone: 'blue',
      },
      {
        label: t.managers,
        value: String(dashboard.secondEntitu),
        icon: 'manager',
        tone: 'purple',
      },
      {
        label: t.tasks,
        value: String(dashboard.thirdEntity),
        icon: 'activity',
        tone: 'green',
      },
      {
        label: t.teams,
        value: String(dashboard.fourthEntity),
        icon: 'users',
        tone: 'orange',
      },
    ]

    const pageTitle =
      navItems.find((item) => item.id === activeView)?.label ?? t.dashboard
    const availableTransferManagers = deleteManager
      ? managers.filter((manager) => manager.id !== deleteManager.id)
      : managers
    const logUsersById = new Map(
      [...employees, ...managers].map((user) => [user.id, user]),
    )
    const identityLogCount = logs.filter(
      (log) => getLogModuleLabel(log.module) === 'Identity',
    ).length
    const taskLogCount = logs.filter(
      (log) => getLogModuleLabel(log.module) === 'Tasks',
    ).length
    const teamLogCount = logs.filter(
      (log) => getLogModuleLabel(log.module) === 'Teams',
    ).length
    const canGoToNextLogPage = logs.length === logPageSize
    const latestLogDate = logs[0]?.createdAt
    const employeeTotalPages = Math.max(
      1,
      Math.ceil(employeeTotalCount / employeePageSize),
    )
    const employeePaginationItems = buildPaginationItems(
      employeePage,
      employeeTotalPages,
    )
    const canGoToNextEmployeePage =
      displayedEmployees.length === employeePageSize
    const isEmployeesTableLoading = isLoading || isEmployeesLoading

    return (
      <main className={adminStyles.shell(isSidebarOpen)}>
        <aside className={adminStyles.sidebar(isSidebarOpen)} aria-label="Admin navigation" aria-hidden={!isSidebarOpen}>
            <div className={`${adminStyles.sidebarInner(isSidebarOpen)} ${adminStyles.brand}`}>
              <h1>{t.brand}</h1>
              <p>{t.systemAdmin}</p>
              <span>{t.admin}</span>
            </div>

            <nav className={adminStyles.nav(isSidebarOpen)}>
              {navItems.map((item) => (
                <button
                  className={adminStyles.navButton(activeView === item.id)}
                  type="button"
                  key={item.label}
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className={adminStyles.sidebarFooter(isSidebarOpen)}>
              <button
                className={adminStyles.footerButton}
                type="button"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Icon name="settings" />
                <span>{t.settings}</span>
              </button>
              <button className={`${adminStyles.footerButton} text-[#ef1d32] hover:text-[#ef1d32]`} type="button" onClick={onLogout}>
                <Icon name="logout" />
                <span>Logout</span>
              </button>
            </div>
        </aside>

        <section className={adminStyles.main} aria-labelledby="admin-page-title">
          <header className={adminStyles.topbar(isSidebarOpen)}>
            <button
              className={adminStyles.iconButton}
              type="button"
              aria-label={isSidebarOpen ? t.closeMenu : t.openMenu}
              onClick={() => setIsSidebarOpen((current) => !current)}
            >
              <Icon name={isSidebarOpen ? 'close' : 'menu'} />
            </button>
            <button
              className={adminStyles.languageButton}
              type="button"
              onClick={() =>
                setLanguage((current) => (current === 'en' ? 'bg' : 'en'))
              }
            >
              <Icon name="globe" />
              <span>{language.toUpperCase()}</span>
            </button>
          </header>

          <div className={adminStyles.content(isSidebarOpen)}>
            <div className={adminStyles.heading}>
              {activeView !== 'notifications' ? (
                <h2 id="admin-page-title">{pageTitle}</h2>
              ) : null}
              {activeView === 'users' ? (
                <button
                  className={adminStyles.createButton}
                  type="button"
                  onClick={() => openCreateModal('user')}
                >
                  <span aria-hidden="true">+</span>
                  {t.createUser}
                </button>
              ) : null}
              {activeView === 'managers' ? (
                <button
                  className={adminStyles.createButton}
                  type="button"
                  onClick={() => openCreateModal('manager')}
                >
                  <span aria-hidden="true">+</span>
                  {t.createManager}
                </button>
              ) : null}
            </div>

            {message ? (
              <p className={`${adminStyles.message} ${commonStyles.message(message.type)}`} role="status">
                {message.text}
              </p>
            ) : null}

            {activeView === 'notifications' ? (
              <NotificationsPanel
                notifications={notifications}
                onMarkAsRead={(notificationId) => {
                  void handleMarkAsRead(notificationId)
                }}
                onMarkAllAsRead={() => {
                  void handleMarkAllAsRead()
                }}
                title={t.notifications}
                emptyMessage={t.noNotifications}
                markAllLabel={t.markAllAsRead}
                unreadLabel={t.unread}
                readLabel={t.read}
                isLoading={isNotificationsLoading}
                loadingMessage={t.loading}
                titleId="admin-page-title"
              />
            ) : activeView === 'users' ? (
              <section className={adminStyles.tableCard} aria-label={t.users}>
                <div className={adminStyles.search}>
                  <Icon name="search" />
                  <input
                    placeholder={t.search}
                    aria-label={t.search}
                    value={searchQuery}
                    onChange={(event) => {
                      void handleSearch(event.target.value)
                    }}
                  />
                </div>
                <div className={adminStyles.table('users')} role="table">
                  <div className={adminStyles.head('users')} role="row">
                    <span role="columnheader">{t.username.toUpperCase()}</span>
                    <span role="columnheader">ID</span>
                    <span role="columnheader">{t.manager.toUpperCase()}</span>
                    <span role="columnheader">{t.actions.toUpperCase()}</span>
                  </div>
                  {isEmployeesTableLoading ? (
                    <div className={adminStyles.tableEmpty}>{t.loading}</div>
                  ) : displayedEmployees.length ? (
                    displayedEmployees.map((employee) => (
                      <div
                        className={adminStyles.bodyRow('users')}
                        role="row"
                        key={employee.id}
                      >
                        <span role="cell">{employee.username}</span>
                        <span role="cell">{employee.id}</span>
                        <span role="cell">{employee.managerName || '-'}</span>
                        <span className={adminStyles.archiveActions} role="cell">
                          <button
                            className={adminStyles.iconAction('edit')}
                            type="button"
                            aria-label={`${t.edit}: ${employee.username}`}
                            title={t.edit}
                            onClick={() => openEditModal(employee, 'user')}
                          >
                            <Icon name="edit" />
                          </button>
                          <button
                            className={adminStyles.iconAction('delete')}
                            type="button"
                            aria-label={`Delete employee: ${employee.username}`}
                            title="Delete employee"
                            onClick={() => setDeleteEmployee(employee)}
                          >
                            <Icon name="trash" />
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={adminStyles.tableEmpty}>{t.empty}</div>
                  )}
                </div>

                <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-4 border-t border-[#edf0f4] px-6 py-3 max-[760px]:flex-col max-[760px]:items-stretch">
                  <p className="text-[13px] font-bold text-[#64748b]">
                    {getPaginationRangeLabel(
                      employeePage,
                      employeePageSize,
                      employeeTotalCount,
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="min-h-9 cursor-pointer rounded-lg border border-[#cfd6e0] bg-white px-4 text-[13px] font-extrabold text-[#111827] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={isEmployeesTableLoading || employeePage === 1}
                      onClick={() =>
                        setEmployeePage((current) => Math.max(1, current - 1))
                      }
                    >
                      Previous
                    </button>
                    {employeePaginationItems.map((item, index) =>
                      item === 'ellipsis' ? (
                        <span
                          className="min-h-9 px-2 text-[13px] font-extrabold text-[#64748b]"
                          key={`ellipsis-${index}`}
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          className={
                            item === employeePage
                              ? 'min-h-9 min-w-9 cursor-pointer rounded-lg border border-[#315af2] bg-[#315af2] px-3 text-[13px] font-extrabold text-white'
                              : 'min-h-9 min-w-9 cursor-pointer rounded-lg border border-[#cfd6e0] bg-white px-3 text-[13px] font-extrabold text-[#111827] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50'
                          }
                          type="button"
                          disabled={isEmployeesTableLoading}
                          key={item}
                          onClick={() => setEmployeePage(item)}
                        >
                          {item}
                        </button>
                      ),
                    )}
                    <button
                      className="min-h-9 cursor-pointer rounded-lg border border-[#315af2] bg-[#315af2] px-4 text-[13px] font-extrabold text-white hover:bg-[#254be0] disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={
                        isEmployeesTableLoading || !canGoToNextEmployeePage
                      }
                      onClick={() =>
                        setEmployeePage((current) => current + 1)
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            ) : activeView === 'managers' ? (
              <section className={`${adminStyles.tableCard} mt-1`} aria-label={t.managers}>
                <div className={adminStyles.table('managers')} role="table">
                  <div className={`${adminStyles.head('managers')} min-h-[50px]`} role="row">
                    <span role="columnheader">NAME</span>
                    <span role="columnheader">EMAIL</span>
                    <span role="columnheader">{t.teams.toUpperCase()}</span>
                    <span role="columnheader">{t.edit.toUpperCase()}</span>
                  </div>
                  {isLoading ? (
                    <div className={adminStyles.tableEmpty}>{t.loading}</div>
                  ) : managers.length ? (
                    managers.map((manager) => (
                      <div
                        className={adminStyles.bodyRow('managers')}
                        role="row"
                        key={manager.id}
                      >
                        <span role="cell">{manager.username}</span>
                        <span role="cell">{manager.email || manager.username}</span>
                        <span role="cell">{manager.teams ?? 0}</span>
                        <span className={adminStyles.archiveActions} role="cell">
                          <button
                            className={adminStyles.iconAction('edit')}
                            type="button"
                            aria-label={`${t.edit}: ${manager.username}`}
                            title={t.edit}
                            onClick={() => openEditModal(manager, 'manager')}
                          >
                            <Icon name="edit" />
                          </button>
                          <button
                            className={adminStyles.iconAction('delete')}
                            type="button"
                            aria-label={`Delete manager: ${manager.username}`}
                            title="Delete manager"
                            onClick={() => {
                              void openDeleteManagerModal(manager)
                            }}
                          >
                            <Icon name="trash" />
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={adminStyles.tableEmpty}>{t.empty}</div>
                  )}
                </div>
              </section>
            ) : activeView === 'archivedTasks' ? (
              <section className={adminStyles.tableCard} aria-label={t.archivedTasks}>
                <div className={adminStyles.table('archivedTasks')} role="table">
                  <div className={adminStyles.head('archivedTasks')} role="row">
                    <span role="columnheader">{t.title.toUpperCase()}</span>
                    <span role="columnheader">{t.team.toUpperCase()}</span>
                    <span role="columnheader">{t.manager.toUpperCase()}</span>
                    <span role="columnheader">{t.assigned.toUpperCase()}</span>
                    <span role="columnheader">{t.actions.toUpperCase()}</span>
                  </div>
                  {isArchiveLoading ? (
                    <div className={adminStyles.tableEmpty}>{t.loading}</div>
                  ) : archivedTasks.length ? (
                    archivedTasks.map((task) => (
                      <div
                        className={adminStyles.bodyRow('archivedTasks')}
                        role="row"
                        key={task.id}
                      >
                        <span role="cell">{task.title}</span>
                        <span role="cell">{task.teamName}</span>
                        <span role="cell">{task.managerName || '-'}</span>
                        <span role="cell">{task.assignedEmployeesCount}</span>
                        <span className={adminStyles.archiveActions} role="cell">
                          <button
                            className={adminStyles.iconAction('recover')}
                            type="button"
                            aria-label={`${t.recover}: ${task.title}`}
                            title={t.recover}
                            disabled={pendingArchiveAction !== null}
                            onClick={() => {
                              void handleRecoverArchivedTask(task.id)
                            }}
                          >
                            <Icon name="restore" />
                          </button>
                          <button
                            className={adminStyles.iconAction('delete')}
                            type="button"
                            aria-label={`${t.deleteForever}: ${task.title}`}
                            title={t.deleteForever}
                            disabled={pendingArchiveAction !== null}
                            onClick={() => {
                              void handleDeleteArchivedTask(task.id)
                            }}
                          >
                            <Icon name="trash" />
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={adminStyles.tableEmpty}>{t.empty}</div>
                  )}
                </div>
              </section>
            ) : activeView === 'archivedTeams' ? (
              <section className={adminStyles.tableCard} aria-label={t.archivedTeams}>
                <div className={adminStyles.table('archivedTeams')} role="table">
                  <div className={adminStyles.head('archivedTeams')} role="row">
                    <span role="columnheader">{t.name.toUpperCase()}</span>
                    <span role="columnheader">{t.manager.toUpperCase()}</span>
                    <span role="columnheader">{t.members.toUpperCase()}</span>
                    <span role="columnheader">{t.taskCount.toUpperCase()}</span>
                    <span role="columnheader">{t.actions.toUpperCase()}</span>
                  </div>
                  {isArchiveLoading ? (
                    <div className={adminStyles.tableEmpty}>{t.loading}</div>
                  ) : archivedTeams.length ? (
                    archivedTeams.map((team) => (
                      <div
                        className={adminStyles.bodyRow('archivedTeams')}
                        role="row"
                        key={team.id}
                      >
                        <span role="cell">{team.name}</span>
                        <span role="cell">{team.managerName || '-'}</span>
                        <span role="cell">{team.membersCount}</span>
                        <span role="cell">{team.taskCount}</span>
                        <span className={adminStyles.archiveActions} role="cell">
                          <button
                            className={adminStyles.iconAction('recover')}
                            type="button"
                            aria-label={`${t.recover}: ${team.name}`}
                            title={t.recover}
                            disabled={pendingArchiveAction !== null}
                            onClick={() => {
                              void handleRecoverArchivedTeam(team.id)
                            }}
                          >
                            <Icon name="restore" />
                          </button>
                          <button
                            className={adminStyles.iconAction('delete')}
                            type="button"
                            aria-label={`${t.deleteForever}: ${team.name}`}
                            title={t.deleteForever}
                            disabled={pendingArchiveAction !== null}
                            onClick={() => {
                              void handleDeleteArchivedTeam(team.id)
                            }}
                          >
                            <Icon name="trash" />
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={adminStyles.tableEmpty}>{t.empty}</div>
                  )}
                </div>
              </section>
            ) : activeView === 'logs' ? (
              <section className="grid gap-5" aria-label={t.logs}>
                <div className="rounded-xl border border-[#dbe7ff] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
                  <div className="mb-5 flex items-start justify-between gap-5 max-[760px]:flex-col">
                    <div>
                      <p className="mb-2 text-[12px] font-extrabold tracking-[0.08em] text-[#315af2] uppercase">
                        Admin activity
                      </p>
                    </div>

                    <button
                      className="min-h-10 cursor-pointer rounded-lg border border-[#c7d2fe] bg-[#eef5ff] px-4 text-[14px] font-extrabold text-[#315af2] hover:bg-[#dfeaff] disabled:cursor-not-allowed disabled:opacity-70"
                      type="button"
                      disabled={isLogsLoading}
                      onClick={() => {
                        void loadLogs()
                      }}
                    >
                      {isLogsLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_1fr_0.7fr] gap-3 max-[900px]:grid-cols-1 [&_label]:grid [&_label]:gap-2 [&_label_span]:text-[12px] [&_label_span]:font-extrabold [&_label_span]:tracking-[0.04em] [&_label_span]:text-[#64748b] [&_label_span]:uppercase [&_select]:min-h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-[#cfd6e0] [&_select]:bg-white [&_select]:px-3.5 [&_select]:text-[15px] [&_select]:font-bold [&_select]:text-[#111827] [&_select]:focus:border-[#aeb8ce] [&_select]:focus:outline-[3px] [&_select]:focus:outline-[rgba(49,90,242,0.14)]">
                    <label>
                      <span>Module</span>
                      <select
                        value={logModuleFilter}
                        onChange={(event) => {
                          setLogPage(1)
                          setLogModuleFilter(
                            event.target.value as LogFilterValue,
                          )
                        }}
                      >
                        {logModuleOptions.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Action type</span>
                      <select
                        value={logActionFilter}
                        onChange={(event) => {
                          setLogPage(1)
                          setLogActionFilter(
                            event.target.value as LogFilterValue,
                          )
                        }}
                      >
                        {logActionOptions.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Page size</span>
                      <select
                        value={logPageSize}
                        onChange={(event) => {
                          setLogPage(1)
                          setLogPageSize(Number(event.target.value))
                        }}
                      >
                        <option value={10}>10 rows</option>
                        <option value={20}>20 rows</option>
                        <option value={50}>50 rows</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[760px]:grid-cols-1">
                  <article className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-[0_3px_7px_rgba(17,24,39,0.08)]">
                    <p className="mb-3 text-[13px] font-extrabold text-[#64748b]">
                      Loaded rows
                    </p>
                    <strong className="block text-[30px] leading-none font-extrabold text-[#0f172a]">
                      {isLogsLoading ? '-' : logs.length}
                    </strong>
                    <span className="mt-3 block text-[12px] font-bold text-[#64748b]">
                      Latest: {formatLogDate(latestLogDate)}
                    </span>
                  </article>
                  <article className="rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-5 shadow-[0_3px_7px_rgba(17,24,39,0.06)]">
                    <p className="mb-3 text-[13px] font-extrabold text-[#315af2]">
                      Identity
                    </p>
                    <strong className="block text-[30px] leading-none font-extrabold text-[#0f172a]">
                      {identityLogCount}
                    </strong>
                  </article>
                  <article className="rounded-xl border border-[#bbf7d0] bg-[#f7fef9] p-5 shadow-[0_3px_7px_rgba(17,24,39,0.06)]">
                    <p className="mb-3 text-[13px] font-extrabold text-[#047857]">
                      Tasks
                    </p>
                    <strong className="block text-[30px] leading-none font-extrabold text-[#0f172a]">
                      {taskLogCount}
                    </strong>
                  </article>
                  <article className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-5 shadow-[0_3px_7px_rgba(17,24,39,0.06)]">
                    <p className="mb-3 text-[13px] font-extrabold text-[#c2410c]">
                      Teams
                    </p>
                    <strong className="block text-[30px] leading-none font-extrabold text-[#0f172a]">
                      {teamLogCount}
                    </strong>
                  </article>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#edf0f4] bg-white shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
                  <div className="overflow-x-auto">
                    <div className="min-w-[940px]" role="table">
                      <div
                        className="grid min-h-12 grid-cols-[1.45fr_0.85fr_0.7fr_0.65fr_0.85fr] items-center gap-4 border-b border-[#edf0f4] bg-[#f8fafc] px-6 text-[12px] font-extrabold tracking-[0.06em] text-[#64748b] uppercase"
                        role="row"
                      >
                        <span role="columnheader">Event</span>
                        <span role="columnheader">User</span>
                        <span role="columnheader">Module</span>
                        <span role="columnheader">Type</span>
                        <span className="text-right" role="columnheader">
                          Time
                        </span>
                      </div>

                      {isLogsLoading ? (
                        <div className="grid gap-3 px-6 py-6">
                          {Array.from({ length: 5 }, (_, index) => (
                            <div
                              className="h-[54px] animate-pulse rounded-lg bg-[#f1f5f9]"
                              key={index}
                            />
                          ))}
                        </div>
                      ) : logs.length ? (
                        logs.map((log) => {
                          const userName =
                            log.user?.username ||
                            logUsersById.get(log.userId ?? -1)?.username ||
                            (log.userId ? `User #${log.userId}` : 'System')

                          return (
                            <div
                              className="grid min-h-[68px] grid-cols-[1.45fr_0.85fr_0.7fr_0.65fr_0.85fr] items-center gap-4 border-b border-[#edf0f4] px-6 text-[14px] font-semibold text-[#111827] last:border-b-0"
                              role="row"
                              key={log.id}
                            >
                              <span className="min-w-0" role="cell">
                                <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-extrabold text-[#0f172a]">
                                  {getLogActionText(log)}
                                </strong>
                                <span className="mt-1 block text-[12px] font-bold text-[#94a3b8]">
                                  Log #{log.id}
                                </span>
                              </span>
                              <span
                                className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                                role="cell"
                              >
                                {userName}
                              </span>
                              <span role="cell">
                                <span className={getLogModuleBadge(log.module)}>
                                  {getLogModuleLabel(log.module)}
                                </span>
                              </span>
                              <span role="cell">
                                <span
                                  className={getLogActionBadge(log.actionType)}
                                >
                                  {getLogActionLabel(log.actionType)}
                                </span>
                              </span>
                              <span className="text-right" role="cell">
                                <time dateTime={log.createdAt ?? undefined}>
                                  {formatLogDate(log.createdAt)}
                                </time>
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <div className={adminStyles.tableEmpty}>
                          {t.empty}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex min-h-[58px] items-center justify-between gap-4 border-t border-[#edf0f4] px-6 py-3 max-[760px]:flex-col max-[760px]:items-stretch">
                    <p className="text-[13px] font-bold text-[#64748b]">
                      Showing page {logPage} with {logs.length} loaded rows.
                    </p>
                    <div className="flex gap-2 max-[760px]:grid max-[760px]:grid-cols-2">
                      <button
                        className="min-h-9 cursor-pointer rounded-lg border border-[#cfd6e0] bg-white px-4 text-[13px] font-extrabold text-[#111827] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        disabled={isLogsLoading || logPage === 1}
                        onClick={() =>
                          setLogPage((current) => Math.max(1, current - 1))
                        }
                      >
                        Previous
                      </button>
                      <button
                        className="min-h-9 cursor-pointer rounded-lg border border-[#315af2] bg-[#315af2] px-4 text-[13px] font-extrabold text-white hover:bg-[#254be0] disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        disabled={isLogsLoading || !canGoToNextLogPage}
                        onClick={() => setLogPage((current) => current + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <div className={adminStyles.statsGrid(isSidebarOpen)}>
                {statCards.map((card) => (
                  <article className={adminStyles.statCard} key={card.label}>
                    <div>
                      <p>{card.label}</p>
                      <strong>{card.value}</strong>
                    </div>
                    <span className={adminStyles.statIcon(card.tone)}>
                      <Icon name={card.icon} />
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <ChangePasswordModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSuccess={(text) => {
            setIsSettingsOpen(false)
            setMessage({ text, type: 'success' })
          }}
          onError={(text) => setMessage({ text, type: 'error' })}
          variant="admin"
          labels={{
            changePassword: t.changePassword,
            currentPassword: t.currentPassword,
            newPassword: t.newPassword,
            confirmPassword: t.confirmPassword,
            cancel: t.cancel,
            save: t.save,
            loading: t.loading,
            passwordChanged: t.passwordChanged,
            passwordMismatch: t.passwordMismatch,
            passwordRequired: t.passwordRequired,
            passwordInvalid: t.passwordInvalid,
            apiError: t.apiError,
          }}
        />

        {createModal ? (
          <div className={adminStyles.modalBackdrop} role="presentation">
            <form
              className={adminStyles.modal}
              aria-label={createModal === 'user' ? t.createUser : t.createManager}
              onSubmit={handleCreateSubmit}
            >
              <h2>
                {editingUser
                  ? t.edit
                  : createModal === 'user'
                    ? t.createUser
                    : t.createManager}
              </h2>

              <label>
                <span>{t.username}</span>
                <input
                  value={createForm.username}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </label>

              {editingUser ? null : (
                <label>
                  <span>{t.password}</span>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                </label>
              )}

              {createModal === 'user' ? (
                <label>
                  <span>{t.manager}</span>
                  <select
                    value={createForm.managerId}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        managerId: event.target.value,
                      }))
                    }
                  >
                    <option value="" disabled>
                      {t.selectManager}
                    </option>
                    {managers.map((manager) => (
                      <option value={manager.id} key={manager.id}>
                        {manager.username}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className={adminStyles.modalActions}>
                <button
                  className={adminStyles.modalCancel}
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setCreateModal(null)
                    setEditingUser(null)
                  }}
                >
                  {t.cancel}
                </button>
                <button className={adminStyles.modalSave} type="submit" disabled={isSaving}>
                  {isSaving ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {deleteManager ? (
          <div className={adminStyles.modalBackdrop} role="presentation">
            <form
              className="box-border w-[min(100%,720px)] rounded-xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] max-[760px]:p-6"
              aria-label={`Delete manager ${deleteManager.username}`}
              onSubmit={handleDeleteManagerSubmit}
            >
              <h2 className="mb-6 text-[24px] leading-[1.2] font-extrabold text-[#dc2626]">
                Delete Manager: {deleteManagerPreview?.managerName || deleteManager.username}
              </h2>

              <section className="mb-6 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-5 py-4 text-[#171717]">
                <p className="mb-3 text-[16px] font-bold">This manager owns:</p>
                {isDeletePreviewLoading ? (
                  <p className="text-[16px] font-semibold">Loading...</p>
                ) : (
                  <ul className="grid gap-1.5 text-[16px] font-bold">
                    <li>• {deleteManagerPreview?.teams ?? 0} teams</li>
                    <li>• {deleteManagerPreview?.tasks ?? 0} tasks</li>
                    <li>• {deleteManagerPreview?.employees ?? 0} employees</li>
                  </ul>
                )}
              </section>

              <label className="mb-3 flex cursor-pointer items-center gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4">
                <input
                  className="h-5 w-5 accent-[#3b82f6]"
                  type="radio"
                  name="delete-manager-mode"
                  checked={deleteManagerMode === 'transfer'}
                  onChange={() => setDeleteManagerMode('transfer')}
                />
                <span>
                  <strong className="block text-[18px] leading-[1.2] text-[#111827]">
                    Transfer to another manager
                  </strong>
                  <span className="block text-[14px] font-semibold text-[#4b5563]">
                    All teams, tasks, and employees will be reassigned
                  </span>
                </span>
              </label>

              <select
                className="mb-4 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-[17px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Select manager"
                value={deleteTransferManagerId}
                disabled={deleteManagerMode !== 'transfer'}
                onChange={(event) => setDeleteTransferManagerId(event.target.value)}
              >
                <option value="">Select manager</option>
                {availableTransferManagers.map((manager) => (
                  <option value={manager.id} key={manager.id}>
                    {manager.username}
                  </option>
                ))}
              </select>

              <label className="mb-6 flex cursor-pointer items-center gap-4 rounded-xl border border-[#fca5a5] bg-white p-4">
                <input
                  className="h-5 w-5 accent-[#111827]"
                  type="radio"
                  name="delete-manager-mode"
                  checked={deleteManagerMode === 'cascade'}
                  onChange={() => setDeleteManagerMode('cascade')}
                />
                <span>
                  <strong className="block text-[18px] leading-[1.2] text-[#dc2626]">
                    Cascade delete everything
                  </strong>
                  <span className="block text-[14px] font-bold text-[#ef1d32]">
                    Permanently delete all data - CANNOT BE UNDONE
                  </span>
                </span>
              </label>

              <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
                <button
                  className="min-h-[52px] cursor-pointer rounded-xl border border-[#e5e7eb] bg-white text-[18px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={isSaving}
                  onClick={closeDeleteManagerModal}
                >
                  Cancel
                </button>
                <button
                  className="min-h-[52px] cursor-pointer rounded-xl border border-[#dc2626] bg-[#dc2626] text-[18px] font-extrabold text-white hover:not-disabled:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-70"
                  type="submit"
                  disabled={
                    isSaving ||
                    isDeletePreviewLoading ||
                    (deleteManagerMode === 'transfer' && !deleteTransferManagerId)
                  }
                >
                  {isSaving ? 'Deleting...' : 'Delete Manager'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {deleteEmployee ? (
          <div className={adminStyles.modalBackdrop} role="presentation">
            <form
              className={adminStyles.modal}
              aria-label={`Delete employee ${deleteEmployee.username}`}
              onSubmit={(event) => void handleDeleteEmployeeSubmit(event)}
            >
              <h2 className="text-[#dc2626]">
                Delete Employee: {deleteEmployee.username}
              </h2>
              <p className="text-[15px] font-semibold text-[#4b5563]">
                This action permanently removes the employee account.
              </p>
              <div className={adminStyles.modalActions}>
                <button
                  className={adminStyles.modalCancel}
                  type="button"
                  disabled={isSaving}
                  onClick={closeDeleteEmployeeModal}
                >
                  {t.cancel}
                </button>
                <button
                  className={adminStyles.modalSave}
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? t.loading : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    )
  }

  export default AdminPage
