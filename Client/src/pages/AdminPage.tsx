  import { useCallback, useEffect, useState } from 'react'
  import type { FormEvent } from 'react'
  import {
    createUserApi,
    editUserApi,
    getAdminDashboardApi,
    getEmployeesApi,
    getManagersApi,
    searchEmployeesApi,
  } from '../api/adminApi'
  import type { AdminDashboardDto, AdminUserDto } from '../api/adminApi'

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
    | 'search'

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
  type AdminView = 'dashboard' | 'notifications' | 'users' | 'managers' | 'logs'
  type CreateModal = 'user' | 'manager' | null

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
      logs: 'Logs',
      settings: 'Settings',
      tasks: 'Tasks',
      teams: 'Teams',
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

    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    )
  }

  

  function AdminPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [language, setLanguage] = useState<Language>('en')
    const [activeView, setActiveView] = useState<AdminView>('dashboard')
    const [createModal, setCreateModal] = useState<CreateModal>(null)
    const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null)
    const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm)
    const [logFilter, setLogFilter] = useState('All')
    const [dashboard, setDashboard] =
      useState<AdminDashboardDto>(emptyDashboard)
    const [employees, setEmployees] = useState<AdminUserDto[]>([])
    const [managers, setManagers] = useState<AdminUserDto[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
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
    
useEffect(() => {
  void loadAdminData()
}, [loadAdminData])

useEffect(() => {
  setMessage(null)
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
                  className={activeView === item.id ? 'active' : ''}
                  type="button"
                  key={item.label}
                  onClick={() => setActiveView(item.id)}
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

        <section className="admin-main" aria-labelledby="admin-page-title">
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
            <div className="admin-page-heading">
              <h2 id="admin-page-title">{pageTitle}</h2>
              {activeView === 'users' ? (
                <button
                  className="admin-create-button"
                  type="button"
                  onClick={() => openCreateModal('user')}
                >
                  <span aria-hidden="true">+</span>
                  {t.createUser}
                </button>
              ) : null}
              {activeView === 'managers' ? (
                <button
                  className="admin-create-button"
                  type="button"
                  onClick={() => openCreateModal('manager')}
                >
                  <span aria-hidden="true">+</span>
                  {t.createManager}
                </button>
              ) : null}
            </div>

            {message ? (
              <p className={`admin-message ${message.type}`} role="status">
                {message.text}
              </p>
            ) : null}

            {activeView === 'notifications' ? (
              <section className="empty-state-card" aria-label={t.notifications}>
                <div className="empty-state-content">
                  <Icon name="bell" />
                  <p>{t.noNotifications}</p>
                </div>
              </section>
            ) : activeView === 'users' ? (
              <section className="admin-table-card" aria-label={t.users}>
                <div className="admin-search">
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
                <div className="admin-table admin-table-users" role="table">
                  <div className="admin-table-row admin-table-head" role="row">
                    <span role="columnheader">{t.username.toUpperCase()}</span>
                    <span role="columnheader">ID</span>
                    <span role="columnheader">{t.manager.toUpperCase()}</span>
                    <span role="columnheader">{t.edit.toUpperCase()}</span>
                  </div>
                  {isLoading ? (
                    <div className="admin-table-empty">{t.loading}</div>
                  ) : employees.length ? (
                    employees.map((employee) => (
                      <div
                        className="admin-table-row admin-table-body-row"
                        role="row"
                        key={employee.id}
                      >
                        <span role="cell">{employee.username}</span>
                        <span role="cell">{employee.id}</span>
                        <span role="cell">{employee.managerName || '-'}</span>
                        <span role="cell">
                          <button
                            className="admin-table-action"
                            type="button"
                            onClick={() => openEditModal(employee, 'user')}
                          >
                            {t.edit}
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="admin-table-empty">{t.empty}</div>
                  )}
                </div>
              </section>
            ) : activeView === 'managers' ? (
              <section className="admin-table-card manager-table-card" aria-label={t.managers}>
                <div className="admin-table admin-table-managers" role="table">
                  <div className="admin-table-row admin-table-head" role="row">
                    <span role="columnheader">{t.username.toUpperCase()}</span>
                    <span role="columnheader">ID</span>
                    <span role="columnheader">{t.teams.toUpperCase()}</span>
                    <span role="columnheader">{t.edit.toUpperCase()}</span>
                  </div>
                  {isLoading ? (
                    <div className="admin-table-empty">{t.loading}</div>
                  ) : managers.length ? (
                    managers.map((manager) => (
                      <div
                        className="admin-table-row admin-table-body-row"
                        role="row"
                        key={manager.id}
                      >
                        <span role="cell">{manager.username}</span>
                        <span role="cell">{manager.id}</span>
                        <span role="cell">{manager.teams ?? 0}</span>
                        <span role="cell">
                          <button
                            className="admin-table-action"
                            type="button"
                            onClick={() => openEditModal(manager, 'manager')}
                          >
                            {t.edit}
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="admin-table-empty">{t.empty}</div>
                  )}
                </div>
              </section>
            ) : activeView === 'logs' ? (
              <section className="logs-panel" aria-label={t.logs}>
                <div className="admin-table-card logs-table-card">
                  <div className="admin-table admin-table-logs" role="table">
                    <div className="admin-table-row admin-table-head" role="row">
                      <span role="columnheader">ACTION</span>
                      <span role="columnheader">USER</span>
                      <span role="columnheader">TASK ID</span>
                      <span role="columnheader">TIME</span>
                    </div>
                  </div>
                </div>

                <select
                  className="logs-filter"
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
            )}
          </div>
        </section>

        {createModal ? (
          <div className="admin-modal-backdrop" role="presentation">
            <form
              className="admin-modal"
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

              <div className="admin-modal-actions">
                <button
                  className="admin-modal-cancel"
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setCreateModal(null)
                    setEditingUser(null)
                  }}
                >
                  {t.cancel}
                </button>
                <button className="admin-modal-save" type="submit" disabled={isSaving}>
                  {isSaving ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    )
  }

  export default AdminPage
