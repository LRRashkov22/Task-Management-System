  import { useCallback, useEffect, useState } from 'react'
  import type { FormEvent } from 'react'
  import {
    createUserApi,
    deleteArchivedTaskApi,
    deleteArchivedTeamApi,
    editUserApi,
    forceDeleteManagerApi,
    getAdminDashboardApi,
    getAdminDeleteManagerPreviewApi,
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
    AdminUserDto,
    ArchivedTaskDto,
    ArchivedTeamDto,
  } from '../api/adminApi'
  import { adminStyles, commonStyles } from '../styles'

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

  type CreateForm = {
    username: string
    password: string
    managerId: string
  }

  type StatusMessage = {
    text: string
    type: 'error' | 'success'
  }

  const translations = {
    en: {
      brand: 'TaskMan',
      systemAdmin: 'System Admin',
      admin: 'Admin',
      dashboard: 'Dashboard',
      notifications: 'Notifications',
      users: 'Users',
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
      createUser: 'Create User',
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
      users: 'Потребители',
      managers: 'Мениджъри',
      logs: 'Логове',
      settings: 'Настройки',
      tasks: 'Задачи',
      teams: 'Екипи',
      closeMenu: 'Затвори менюто',
      openMenu: 'Отвори менюто',
      noNotifications: 'Все още няма известия',
      createUser: 'Създай потребител',
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
    },
  } satisfies Record<Language, Record<string, string>>

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
    const [logFilter, setLogFilter] = useState('All')
    const [dashboard, setDashboard] =
      useState<AdminDashboardDto>(emptyDashboard)
    const [employees, setEmployees] = useState<AdminUserDto[]>([])
    const [managers, setManagers] = useState<AdminUserDto[]>([])
    const [archivedTasks, setArchivedTasks] = useState<ArchivedTaskDto[]>([])
    const [archivedTeams, setArchivedTeams] = useState<ArchivedTeamDto[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [pendingArchiveAction, setPendingArchiveAction] = useState<
      string | null
    >(null)
    const [message, setMessage] = useState<StatusMessage | null>(null)
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
  setManagers(updatedManagers)
  setDashboard(updatedDashboard)
}

async function handleSearch(value: string) {
  setSearchQuery(value)

  try {
    if (!value.trim()) {
      const employeeData = await getEmployeesApi()
      setEmployees(employeeData)
      return
    }

    const employeeData = await searchEmployeesApi(value.trim())
    setEmployees(employeeData)
  } catch (error) {
    setMessage({
      text:
        error instanceof Error
          ? error.message
          : t.apiError,
      type: 'error',
    })
  }
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
        text: 'Select manager for the user.',
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

  // ТУК refresh-ваш списъците
  await refreshAdminData()

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
              <button className={adminStyles.footerButton} type="button">
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
              <h2 id="admin-page-title">{pageTitle}</h2>
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
              <section className={adminStyles.emptyState} aria-label={t.notifications}>
                <div className={adminStyles.emptyContent}>
                  <Icon name="bell" />
                  <p>{t.noNotifications}</p>
                </div>
              </section>
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
                    <span role="columnheader">{t.edit.toUpperCase()}</span>
                  </div>
                  {isLoading ? (
                    <div className={adminStyles.tableEmpty}>{t.loading}</div>
                  ) : employees.length ? (
                    employees.map((employee) => (
                      <div
                        className={adminStyles.bodyRow('users')}
                        role="row"
                        key={employee.id}
                      >
                        <span role="cell">{employee.username}</span>
                        <span role="cell">{employee.id}</span>
                        <span role="cell">{employee.managerName || '-'}</span>
                        <span role="cell">
                          <button
                            className={adminStyles.tableAction}
                            type="button"
                            onClick={() => openEditModal(employee, 'user')}
                          >
                            {t.edit}
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={adminStyles.tableEmpty}>{t.empty}</div>
                  )}
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
              <section className={adminStyles.logsPanel} aria-label={t.logs}>
                <div className={adminStyles.tableCard}>
                  <div className={adminStyles.table('logs')} role="table">
                    <div className={`${adminStyles.head('logs')} min-h-[46px]`} role="row">
                      <span role="columnheader">ACTION</span>
                      <span role="columnheader">USER</span>
                      <span role="columnheader">TASK ID</span>
                      <span role="columnheader">TIME</span>
                    </div>
                  </div>
                </div>

                <select
                  className={adminStyles.logsFilter}
                  aria-label="Log filter"
                  value={logFilter}
                  onChange={(event) => setLogFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Created</option>
                  <option>Status Changed</option>
                  <option>Assigned</option>
                </select>
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
      </main>
    )
  }

  export default AdminPage
