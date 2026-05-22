import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import {
  archiveManagerTaskApi,
  archiveManagerTeamApi,
  createManagerTaskApi,
  createManagerTeamApi,
  editManagerTeamApi,
  getManagerEmployeesApi,
  getManagerTaskDetailsApi,
  getManagerTeamDetailsApi,
  getManagerTeamsApi,
  getManagersForTransferApi,
  getTransferTeamPreviewApi,
  transferManagerTaskApi,
  transferManagerTeamApi,
  changeManagerTaskStatusApi,
} from '../api/managerApi'
import type {
  ManagerMemberDto,
  ManagerTaskCardDto,
  ManagerTaskDetailsDto,
  ManagerTeamDto,
  ManagerUserDto,
  TransferTeamPreviewDto,
} from '../api/managerApi'
import { commonStyles, managerStyles } from '../styles'
import { getUserId, getUsername } from '../utils/auth'

type ManagerView =
  | 'dashboard'
  | 'notifications'
  | 'teamTasks'
  | 'teams'
  | 'calendar'
  | 'analytics'

type IconName =
  | 'dashboard'
  | 'bell'
  | 'tasks'
  | 'teams'
  | 'calendar'
  | 'analytics'
  | 'settings'
  | 'logout'
  | 'close'
  | 'menu'
  | 'globe'
  | 'plus'
  | 'edit'
  | 'user'
  | 'clock'
  | 'warning'

type StatusMessage = {
  text: string
  type: 'error' | 'success'
}

type TaskForm = {
  title: string
  description: string
  priority: string
  deadline: string
  teamId: string
  assignments: string[]
}

type TeamForm = {
  name: string
  memberIds: string[]
}

type BoardTask = ManagerTaskCardDto & {
  teamId: number
  teamName: string
}

const emptyTaskForm: TaskForm = {
  title: '',
  description: '',
  priority: '2',
  deadline: '',
  teamId: '',
  assignments: [],
}

const emptyTeamForm: TeamForm = {
  name: '',
  memberIds: [],
}

const priorityOptions = [
  { label: 'Low', value: '1' },
  { label: 'Medium', value: '2' },
  { label: 'High', value: '3' },
]

function buildBoardTasks(teams: ManagerTeamDto[]) {
  return teams.flatMap((team) =>
    (team.tasks ?? []).map((task) => ({
      ...task,
      status: task.status || 'todo',
      teamId: team.id,
      teamName: team.name,
    })),
  )
}

const boardColumns = [
  { id: 'todo', label: 'TO DO' },
  { id: 'inprogress', label: 'IN PROGRESS' },
  { id: 'review', label: 'REVIEW' },
  { id: 'done', label: 'DONE' },
] as const

type BoardColumnId = (typeof boardColumns)[number]['id']
type TaskTab = 'comments' | 'time' | 'history'

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

  if (name === 'teams') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="3" />
        <path d="M20 20v-2.2a4 4 0 0 0-3-3.8" />
        <path d="M16 4.2a3 3 0 0 1 0 5.6" />
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

  if (name === 'analytics') {
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

  if (name === 'plus') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
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

  if (name === 'user') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3" />
        <path d="M6 20a6 6 0 0 1 12 0" />
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

function statusColumn(status: string): BoardColumnId {
  const normalized = status.replace(/[\s_-]/g, '').toLowerCase()

  if (normalized === 'done') return 'done'
  if (normalized === 'requestedcompletion' || normalized === 'review') {
    return 'review'
  }

  if (status.startsWith('local:')) {
    const localStatus = status.replace('local:', '') as BoardColumnId

    return boardColumns.some((column) => column.id === localStatus)
      ? localStatus
      : 'todo'
  }

  if (
    normalized === 'inprogress' ||
    normalized === 'doing' ||
    normalized === 'active'
  ) {
    return 'inprogress'
  }

  return 'todo'
}

function statusLabelFromColumn(column: BoardColumnId) {
  if (column === 'done') return 'Done'
  if (column === 'review') return 'Review'
  if (column === 'inprogress') return 'In Progress'
  return 'To Do'
}

function statusLabel(status: string) {
  return statusLabelFromColumn(statusColumn(status))
}

function getEnumStatusForColumn(column: BoardColumnId) {
  if (column === 'done') return 2
  if (column === 'review') return 3
  return 1
}

function isDropTargetColumn(column: BoardColumnId) {
  return column !== 'done'
}

function priorityLabel(priority: string) {
  const normalized = priority.toLowerCase()
  if (normalized === 'high' || normalized === '3') return 'High'
  if (normalized === 'low' || normalized === '1') return 'Low'
  return 'Medium'
}

function priorityTone(priority: string) {
  return priorityLabel(priority).toLowerCase()
}

function formatDate(value?: string | null) {
  if (!value) return 'No date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US')
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

function isTaskMissingVisibleData(task: BoardTask) {
  return !task.description || !task.deadline
}

function uniqMembers(teams: ManagerTeamDto[]) {
  const members = new Map<number, ManagerMemberDto>()

  teams.forEach((team) => {
    team.members?.forEach((member) => {
      members.set(member.id, member)
    })
  })

  return Array.from(members.values()).sort((first, second) =>
    first.username.localeCompare(second.username),
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

function ManagerPage({ onLogout }: { onLogout: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [language, setLanguage] = useState<'en' | 'bg'>('en')
  const [activeView, setActiveView] = useState<ManagerView>('dashboard')
  const [teams, setTeams] = useState<ManagerTeamDto[]>([])
  const [teamDetails, setTeamDetails] = useState<Record<number, ManagerTeamDto>>(
    {},
  )
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<StatusMessage | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [archiveCandidate, setArchiveCandidate] =
    useState<ManagerTeamDto | null>(null)
  const [transferCandidate, setTransferCandidate] =
    useState<ManagerTeamDto | null>(null)
  const [transferPreview, setTransferPreview] =
    useState<TransferTeamPreviewDto | null>(null)
  const [transferManagerId, setTransferManagerId] = useState('')
  const [transferManagers, setTransferManagers] = useState<ManagerUserDto[]>([])
  const [transferManagersError, setTransferManagersError] = useState('')
  const [isTransferTaskModalOpen, setIsTransferTaskModalOpen] = useState(false)
  const [transferTaskTeamId, setTransferTaskTeamId] = useState('')
  const [transferTaskAssignments, setTransferTaskAssignments] = useState<string[]>([])
  const [transferTaskError, setTransferTaskError] = useState('')
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null)
  const [selectedTaskDetails, setSelectedTaskDetails] =
    useState<ManagerTaskDetailsDto | null>(null)
  const [taskDetailsWarning, setTaskDetailsWarning] = useState('')
  const [activeTaskTab, setActiveTaskTab] = useState<TaskTab>('comments')
  const [boardTasks, setBoardTasks] = useState<BoardTask[]>([])
  const [calendarView, setCalendarView] = useState<'weekly' | 'monthly'>('monthly')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [editingTeam, setEditingTeam] = useState<ManagerTeamDto | null>(null)
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null)
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTaskForm)
  const [teamForm, setTeamForm] = useState<TeamForm>(emptyTeamForm)
  const [managerEmployees, setManagerEmployees] = useState<ManagerMemberDto[]>([])

  const managerName = getUsername() || 'Manager'
  const managerId = Number(getUserId() ?? 0)

  const loadManagerData = useCallback(async () => {
    setIsLoading(true)

    try {
      const teamList = await getManagerTeamsApi()
      const detailResults = await Promise.all(
        teamList.map(async (team) => {
          try {
            return await getManagerTeamDetailsApi(team.id)
          } catch {
            return team
          }
        }),
      )

      const detailsById = detailResults.reduce<Record<number, ManagerTeamDto>>(
        (current, team) => ({
          ...current,
          [team.id]: team,
        }),
        {},
      )

      const loadedBoardTasks = buildBoardTasks(detailResults)

      setTeams(teamList)
      setTeamDetails(detailsById)
      setBoardTasks(loadedBoardTasks)
      setSelectedTask(null)
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Could not load manager data.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadManagerData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadManagerData])

  useEffect(() => {
    let cancelled = false

    const loadEmployees = async () => {
      try {
        const employees = await getManagerEmployeesApi()
        if (!cancelled) setManagerEmployees(employees)
      } catch (error) {
        if (!cancelled) {
          setManagerEmployees([])
          setMessage({
            text:
              error instanceof Error
                ? error.message
                : 'Could not load manager employees.',
            type: 'error',
          })
        }
      }
    }

    void loadEmployees()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMessage(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [activeView])

  useEffect(() => {
    if (!selectedTask) return

    const timeoutId = window.setTimeout(() => {
      const updatedTask = boardTasks.find((task) => task.id === selectedTask.id)
      setSelectedTask(updatedTask ?? null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [boardTasks, selectedTask])

  const teamsWithDetails = useMemo(
    () => teams.map((team) => ({ ...team, ...teamDetails[team.id] })),
    [teamDetails, teams],
  )

  const allMembers = useMemo(
    () => (managerEmployees.length ? managerEmployees : uniqMembers(teamsWithDetails)),
    [managerEmployees, teamsWithDetails],
  )

  const calendarTasksByDay = useMemo(() => {
    const map = new Map<string, BoardTask[]>()

    boardTasks.forEach((task) => {
      if (!task.deadline) return

      const parsed = new Date(task.deadline)
      if (Number.isNaN(parsed.getTime())) return

      const key = getDayKey(parsed)
      const current = map.get(key) ?? []
      current.push(task)
      map.set(key, current)
    })

    return map
  }, [boardTasks])

  const calendarDays = useMemo(() => {
    const focalDate = new Date(calendarDate)

    const start = calendarView === 'monthly'
      ? startOfWeek(startOfMonth(focalDate))
      : startOfWeek(focalDate)

    const end = calendarView === 'monthly'
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

  const filteredTasks = useMemo(
    () =>
      boardTasks.filter((task) => {
        const teamMatches =
          selectedTeamFilter === 'all' ||
          task.teamId === Number(selectedTeamFilter)
        const priorityMatches =
          priorityFilter === 'all' ||
          priorityTone(task.priority) === priorityFilter
        const statusMatches =
          statusFilter === 'all' || statusColumn(task.status) === statusFilter

        return teamMatches && priorityMatches && statusMatches
      }),
    [boardTasks, priorityFilter, selectedTeamFilter, statusFilter],
  )

  const hasLoadedDetails =
    !isLoading && (teams.length === 0 || Object.keys(teamDetails).length > 0)
  const totalTasks = boardTasks.length
  const doneTasks = boardTasks.filter((task) => statusColumn(task.status) === 'done')
  const inProgressTasks = boardTasks.filter(
    (task) => statusColumn(task.status) === 'inprogress',
  )
  const totalMembers =
    allMembers.length ||
    teamsWithDetails.reduce((total, team) => total + team.employeesCount, 0)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'teamTasks', label: 'Team Tasks', icon: 'tasks' },
    { id: 'teams', label: 'Teams', icon: 'teams' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  ] satisfies Array<{ id: ManagerView; label: string; icon: IconName }>

  const pageTitle =
    navItems.find((item) => item.id === activeView)?.label ?? 'Dashboard'

  const selectedTaskTeam = taskForm.teamId
    ? teamDetails[Number(taskForm.teamId)] ??
      teamsWithDetails.find((team) => team.id === Number(taskForm.teamId))
    : null

  const transferTaskTargetTeams = selectedTask
    ? teamsWithDetails.filter((team) => team.id !== selectedTask.teamId)
    : []
  const selectedTransferTaskTeam = transferTaskTargetTeams.find(
    (team) => team.id === Number(transferTaskTeamId),
  )

  function openCreateTaskModal() {
    setTaskForm(emptyTaskForm)
    setMessage(null)
    setIsTaskModalOpen(true)
  }

  function openCreateTeamModal() {
    setEditingTeam(null)
    setTeamForm(emptyTeamForm)
    setMessage(null)
    setIsTeamModalOpen(true)
  }

  function openTransferTaskModal() {
    if (!selectedTask) return
    setIsTransferTaskModalOpen(true)
    setTransferTaskTeamId('')
    setTransferTaskAssignments([])
    setTransferTaskError('')
    setMessage(null)
  }

  function openEditTeamModal(team: ManagerTeamDto) {
    const detail = teamDetails[team.id] ?? team

    setEditingTeam(detail)
    setTeamForm({
      name: detail.name,
      memberIds: (detail.members ?? []).map((member) => String(member.id)),
    })
    setMessage(null)
    setIsTeamModalOpen(true)
  }

  async function openTransferTeamModal(team: ManagerTeamDto) {
    setTransferCandidate(team)
    setTransferPreview(null)
    setTransferManagerId('')
    setTransferManagers([])
    setTransferManagersError('')
    setMessage(null)

    try {
      const [preview, managers] = await Promise.all([
        getTransferTeamPreviewApi(team.id),
        getManagersForTransferApi(),
      ])

      setTransferPreview(preview)
      setTransferManagers(
        managers.filter((manager) => manager.id !== managerId),
      )
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : 'Could not load manager list.'

      setTransferManagersError(
        `api/Statistics/Admin/get-managers failed: ${errorText}. Backend marks this endpoint as Admin-only.`,
      )
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Could not load transfer preview.',
        type: 'error',
      })
    }
  }

  function handleTransferTaskTeamChange(teamId: string) {
    setTransferTaskTeamId(teamId)
    setTransferTaskAssignments([])
    setTransferTaskError('')
  }

  function toggleTransferTaskAssignment(memberId: number, checked: boolean) {
    setTransferTaskAssignments((current) =>
      checked
        ? [...current, String(memberId)]
        : current.filter((id) => id !== String(memberId)),
    )
  }

  async function handleTransferTask() {
    if (!selectedTask) return
    if (!transferTaskTeamId) {
      setTransferTaskError('Select a destination team.')
      return
    }

    if (transferTaskAssignments.length === 0) {
      setTransferTaskError('Select at least one user from the destination team.')
      return
    }

    setIsSaving(true)
    setMessage(null)
    setTransferTaskError('')

    try {
      await transferManagerTaskApi({
        taskId: selectedTask.id,
        newTeamId: Number(transferTaskTeamId),
        assignments: transferTaskAssignments.map(Number),
      })

      await loadManagerData()
      setSelectedTask(null)
      setSelectedTaskDetails(null)
      setIsTransferTaskModalOpen(false)
      setTransferTaskTeamId('')
      setTransferTaskAssignments([])
      setMessage({ text: 'Task transferred successfully.', type: 'success' })
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Could not transfer task.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, taskId: number) {
    event.dataTransfer.setData('text/plain', String(taskId))
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault()
  }

  async function handleDropOnColumn(
    event: DragEvent<HTMLElement>,
    newStatus: BoardColumnId,
  ) {
    event.preventDefault()
    if (!isDropTargetColumn(newStatus)) return

    const taskId = Number(event.dataTransfer.getData('text/plain'))
    if (!taskId) return

    const previousTasks = boardTasks
    const updatedTasks = boardTasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task,
    )

    setBoardTasks(updatedTasks)
    setMessage(null)

    try {
      await changeManagerTaskStatusApi(taskId, {
        status: getEnumStatusForColumn(newStatus),
      })
      setMessage({ text: 'Task status updated.', type: 'success' })
    } catch (error) {
      setBoardTasks(previousTasks)
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Could not update task status.',
        type: 'error',
      })
    }
  }

  async function openTaskDetails(task: BoardTask) {
    setSelectedTask(task)
    setSelectedTaskDetails(null)
    setTaskDetailsWarning('')
    setActiveTaskTab('comments')

    try {
      const details = await getManagerTaskDetailsApi(task.id)

      if (!details || details.id !== task.id) {
        throw new Error('Task details endpoint returned invalid data.')
      }

      setSelectedTaskDetails(details)
    } catch (error) {
      setTaskDetailsWarning(
        error instanceof Error
          ? `Task details endpoint issue: ${error.message}`
          : 'Task details endpoint is not available.',
      )
    }
  }

  async function handleTaskTeamChange(teamId: string) {
    setTaskForm((current) => ({
      ...current,
      teamId,
      assignments: [],
    }))

    const numericTeamId = Number(teamId)
    if (!numericTeamId || teamDetails[numericTeamId]?.members) return

    try {
      const detail = await getManagerTeamDetailsApi(numericTeamId)
      setTeamDetails((current) => ({
        ...current,
        [detail.id]: detail,
      }))
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Could not load team members.',
        type: 'error',
      })
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !taskForm.title.trim() ||
      !taskForm.description.trim() ||
      !taskForm.deadline ||
      !taskForm.teamId ||
      taskForm.assignments.length === 0
    ) {
      setMessage({
        text: 'Title, description, deadline, team and assignment are required.',
        type: 'error',
      })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // Client-side deadline validation (compare dates only)
      const deadlineInput = taskForm.deadline
      const parsedDeadline = deadlineInput ? new Date(`${deadlineInput}T00:00:00`) : null
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (!parsedDeadline || Number.isNaN(parsedDeadline.getTime())) {
        setMessage({ text: 'Invalid deadline.', type: 'error' })
        return
      }

      parsedDeadline.setHours(0, 0, 0, 0)

      if (parsedDeadline.getTime() < today.getTime()) {
        setMessage({ text: 'Deadline cannot be in the past.', type: 'error' })
        return
      }


      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: Number(taskForm.priority),
        // set to midnight UTC for the provided date
        deadline: new Date(`${deadlineInput}T00:00:00Z`).toISOString(),
        teamId: Number(taskForm.teamId),
        assignments: taskForm.assignments.map(Number),
      }

      await createManagerTaskApi(payload)
      await loadManagerData()
      setTaskForm(emptyTaskForm)
      setIsTaskModalOpen(false)
      setMessage({ text: 'Task created successfully.', type: 'success' })
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : 'Could not create task.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if ((!editingTeam && !teamForm.name.trim()) || teamForm.memberIds.length === 0) {
      setMessage({
        text: 'Team name and at least one member are required.',
        type: 'error',
      })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      if (editingTeam) {
        await editManagerTeamApi({
          id: editingTeam.id,
          name: editingTeam.name,
          members: teamForm.memberIds.map(Number),
        })
      } else {
        await createManagerTeamApi({
          name: teamForm.name.trim(),
          managerId,
          memberIds: teamForm.memberIds.map(Number),
        })
      }

      await loadManagerData()
      setTeamForm(emptyTeamForm)
      setEditingTeam(null)
      setIsTeamModalOpen(false)
      setMessage({
        text: editingTeam
          ? 'Team updated successfully.'
          : 'Team created successfully.',
        type: 'success',
      })
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Could not save team.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleArchiveTeam() {
    if (!archiveCandidate) return

    setIsSaving(true)
    setMessage(null)

    try {
      await archiveManagerTeamApi(archiveCandidate.id)
      await loadManagerData()
      setArchiveCandidate(null)
      setMessage({ text: 'Team archived successfully.', type: 'success' })
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : 'Could not archive team.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleArchiveSelectedTask() {
    if (!selectedTask) return

    setIsSaving(true)
    setMessage(null)

    try {
      await archiveManagerTaskApi(selectedTask.id)
      await loadManagerData()
      setSelectedTask(null)
      setSelectedTaskDetails(null)
      setMessage({ text: 'Task archived successfully.', type: 'success' })
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : 'Could not archive task.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTransferTeam() {
    if (!transferCandidate) return

    if (!transferManagerId) {
      setMessage({
        text: 'Select manager for transfer.',
        type: 'error',
      })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      await transferManagerTeamApi({
        teamId: transferCandidate.id,
        newManagerId: Number(transferManagerId),
      })
      await loadManagerData()
      setTransferCandidate(null)
      setTransferPreview(null)
      setTransferManagerId('')
      setMessage({ text: 'Team transferred successfully.', type: 'success' })
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : 'Could not transfer team.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  function toggleAssignment(memberId: number, checked: boolean) {
    setTaskForm((current) => ({
      ...current,
      assignments: checked
        ? [...current.assignments, String(memberId)]
        : current.assignments.filter((id) => id !== String(memberId)),
    }))
  }

  function toggleTeamMember(memberId: number, checked: boolean) {
    setTeamForm((current) => ({
      ...current,
      memberIds: checked
        ? [...current.memberIds, String(memberId)]
        : current.memberIds.filter((id) => id !== String(memberId)),
    }))
  }

  const selectedTaskAssignedUsers =
    selectedTaskDetails?.assignedUsers ?? selectedTask?.assignedEmployees ?? []
  const selectedTaskComments = selectedTaskDetails?.comments ?? []
  const selectedTaskWorkSessions = selectedTaskDetails?.workSessions ?? []
  const selectedTaskHistory = selectedTaskDetails?.history ?? []

  return (
    <main className={managerStyles.shell(isSidebarOpen)}>
      <aside
        className={managerStyles.sidebar(isSidebarOpen)}
        aria-label="Manager navigation"
        aria-hidden={!isSidebarOpen}
      >
        <div className={`${managerStyles.sidebarInner(isSidebarOpen)} ${managerStyles.brand}`}>
          <h1>TaskMan</h1>
          <p>{managerName}</p>
          <span>Manager</span>
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

      <section className={managerStyles.main} aria-labelledby="manager-page-title">
        <header className={managerStyles.topbar(isSidebarOpen)}>
          <button
            className={managerStyles.iconButton}
            type="button"
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            <Icon name={isSidebarOpen ? 'close' : 'menu'} />
          </button>
          <button
            className={managerStyles.languageButton}
            type="button"
            onClick={() =>
              setLanguage((current) => (current === 'en' ? 'bg' : 'en'))
            }
          >
            <Icon name="globe" />
            <span>{language.toUpperCase()}</span>
          </button>
        </header>

        <div className={managerStyles.content}>
          <div className={managerStyles.heading}>
            <h2 id="manager-page-title">{pageTitle}</h2>
            {activeView === 'teamTasks' ? (
              <button
                className={managerStyles.createButton}
                type="button"
                onClick={openCreateTaskModal}
              >
                <Icon name="plus" />
                Create Task
              </button>
            ) : null}
            {activeView === 'teams' ? (
              <button
                className={managerStyles.createButton}
                type="button"
                onClick={openCreateTeamModal}
              >
                <Icon name="plus" />
                Create Team
              </button>
            ) : null}
          </div>

          {message ? (
            <p className={`${managerStyles.message} ${commonStyles.message(message.type)}`} role="status">
              {message.text}
            </p>
          ) : null}

          {activeView === 'dashboard' ? (
            <>
              <section className={managerStyles.statsGrid} aria-label="Dashboard stats">
                <article className={managerStyles.statCard}>
                  <p>Tasks</p>
                  <strong>{isLoading ? '' : totalTasks}</strong>
                </article>
                <article className={managerStyles.statCard}>
                  <p>Done</p>
                  <strong>{hasLoadedDetails ? doneTasks.length : ''}</strong>
                </article>
                <article className={managerStyles.statCard}>
                  <p>In Progress</p>
                  <strong>{hasLoadedDetails ? inProgressTasks.length : ''}</strong>
                </article>
                <article className={managerStyles.statCard}>
                  <p>Members</p>
                  <strong>{isLoading ? '' : totalMembers}</strong>
                </article>
              </section>

              <section className={managerStyles.dashboardPanel} aria-label="Teams">
                <h3>Teams</h3>
                {isLoading ? (
                  <p className={managerStyles.emptyText}>Loading...</p>
                ) : teamsWithDetails.length ? (
                  <div className={managerStyles.teamList}>
                    {teamsWithDetails.map((team) => {
                      const tasks = team.tasks ?? []
                      const completed = tasks.filter(
                        (task) => statusColumn(task.status) === 'done',
                      ).length
                      const taskCount = tasks.length || team.tasksCount || 0

                      return (
                        <article className={managerStyles.dashboardTeam} key={team.id}>
                          <div>
                            <h4>{team.name}</h4>
                            <p>
                              {team.employeesCount} Members - {taskCount} Tasks
                            </p>
                          </div>
                          <span>
                            {completed}/{taskCount} completed
                          </span>
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <p className={managerStyles.emptyText}>No teams yet</p>
                )}
              </section>
            </>
          ) : activeView === 'teamTasks' ? (
            <section aria-label="Team tasks">
              <div className={managerStyles.filters}>
                <select
                  aria-label="Team filter"
                  value={selectedTeamFilter}
                  onChange={(event) => setSelectedTeamFilter(event.target.value)}
                >
                  <option value="all">All Teams</option>
                  {teamsWithDetails.map((team) => (
                    <option value={team.id} key={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Priority filter"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  aria-label="Status filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className={managerStyles.kanban}>
                {boardColumns.map((column) => {
                  const columnTasks = filteredTasks.filter(
                    (task) => statusColumn(task.status) === column.id,
                  )
                  const isDropTarget = isDropTargetColumn(column.id)

                  return (
                    <section
                      className={managerStyles.kanbanColumn(column.id)}
                      aria-label={column.label}
                      aria-disabled={!isDropTarget}
                      key={column.id}
                      onDragOver={isDropTarget ? handleDragOver : undefined}
                      onDrop={isDropTarget ? (event) => handleDropOnColumn(event, column.id) : undefined}
                    >
                      <header className={managerStyles.kanbanHeader}>
                        <h3>{column.label}</h3>
                        <span>{columnTasks.length} tasks</span>
                      </header>
                      <div className={managerStyles.kanbanList}>
                        {columnTasks.map((task) => (
                          <article
                            className={managerStyles.taskCard(selectedTask?.id === task.id)}
                            key={task.id}
                            draggable
                            onDragStart={(event) => handleDragStart(event, task.id)}
                            onClick={() => {
                              void openTaskDetails(task)
                            }}
                          >
                            <div className={managerStyles.taskCardTitle}>
                              <h4>{task.title}</h4>
                              <span className={managerStyles.cardBadges}>
                                {isTaskMissingVisibleData(task) ? (
                                  <span
                                    className={managerStyles.cardWarning}
                                    title="Missing backend data for this card"
                                  >
                                    <Icon name="warning" />
                                  </span>
                                ) : null}
                                <span
                                  className={commonStyles.priority(priorityTone(task.priority))}
                                >
                                  {priorityLabel(task.priority)}
                                </span>
                              </span>
                            </div>
                            <p className={managerStyles.taskDescription}>{task.description || 'Missing description'}</p>
                            <div className={managerStyles.taskMeta}>
                              <span>
                                <Icon name="user" />
                                {task.assignedEmployeesCount}
                              </span>
                              <span className={!task.deadline ? managerStyles.missing : ''}>
                                {!task.deadline ? (
                                  <Icon name="warning" />
                                ) : null}
                                {formatDate(task.deadline)}
                              </span>
                              <span>
                                <Icon name="clock" />
                                {task.workHours}h
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
              {selectedTask ? (
                <section className={managerStyles.taskDetailsPanel} aria-label="Selected task details">
                  <div className="mb-[18px] flex items-start justify-between gap-4 [&_h3]:text-[22px] [&_p]:mt-1.5 [&_p]:text-[14px] [&_p]:text-[#6b7280]">
                    <div>
                      <h3>{selectedTask.title}</h3>
                      <p>{selectedTask.teamName}</p>
                    </div>
                    <button
                      className="cursor-pointer border-0 bg-transparent text-[14px] leading-none font-bold text-[#315af2]"
                      type="button"
                      onClick={() => setSelectedTask(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mb-[18px] flex flex-wrap gap-2.5 text-[#4f5b72] [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.5 [&>span]:rounded-full [&>span]:bg-[#f3f6ff] [&>span]:px-3.5 [&>span]:py-2.5 [&>span]:text-[13px] [&>span]:font-semibold">
                    <span className={commonStyles.priority(priorityTone(selectedTask.priority))}>
                      {priorityLabel(selectedTask.priority)}
                    </span>
                    <span className={commonStyles.status(statusColumn(selectedTask.status))}>
                      {statusLabel(selectedTask.status)}
                    </span>
                    <span>{formatDate(selectedTask.deadline)}</span>
                    <span>
                      <Icon name="clock" /> {selectedTask.workHours}h
                    </span>
                  </div>

                  <p className="mb-[18px] text-[15px] leading-[1.7] text-[#25324a]">
                    {selectedTask.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap justify-between gap-4 text-[14px] text-[#4f5b72]">
                    <span>
                      <Icon name="user" /> Assigned employees: {selectedTask.assignedEmployeesCount}
                    </span>
                    <span>
                      Drag task cards into a different column to update status locally.
                    </span>
                  </div>
                  <p className={managerStyles.endpointNote}>
                    ! Status movement is currently local because the backend status edit endpoint is not implemented yet.
                  </p>
                </section>
              ) : null}
            </section>
          ) : activeView === 'calendar' ? (
            <section className={managerStyles.calendarPanel} aria-label="Calendar">
              <div className={managerStyles.calendarHeader}>
                <div>
                  <p className={managerStyles.calendarLabel}>Calendar</p>
                  <h3>{formatCalendarMonth(calendarDate)}</h3>
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
          ) : activeView === 'teams' ? (
            <section className={managerStyles.teamsPanel} aria-label="Teams">
              {isLoading ? (
                <p className={managerStyles.emptyText}>Loading...</p>
              ) : teamsWithDetails.length ? (
                teamsWithDetails.map((team) => {
                  const detail = teamDetails[team.id] ?? team
                  const tasksCount = detail.tasks?.length ?? team.tasksCount ?? 0

                  return (
                    <article className={managerStyles.teamCard} key={team.id}>
                      <div className={managerStyles.teamCardMain}>
                        <div>
                          <h3>{team.name}</h3>
                          <p>
                            {team.employeesCount} Members - {tasksCount} Tasks
                          </p>
                        </div>
                        <div className={managerStyles.teamActions}>
                          <button
                            type="button"
                            onClick={() => openEditTeamModal(team)}
                          >
                            <Icon name="edit" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void openTransferTeamModal(team)
                            }}
                          >
                            Transfer
                          </button>
                          <button
                            className="text-[#ef1d32]"
                            type="button"
                            onClick={() => setArchiveCandidate(team)}
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTeamId((current) =>
                                current === team.id ? null : team.id,
                              )
                            }
                          >
                            {expandedTeamId === team.id ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      {expandedTeamId === team.id ? (
                        <div className={managerStyles.teamDetails}>
                          <section className={managerStyles.detailSection}>
                            <h4>
                              <Icon name="teams" />
                              Members
                            </h4>
                            {(detail.members ?? []).length ? (
                              <div className={managerStyles.memberGrid}>
                                {detail.members?.map((member) => (
                                  <span className={managerStyles.memberChip} key={member.id}>
                                    <span className={commonStyles.avatar}>
                                      {initials(member.username)}
                                    </span>
                                    {member.username}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p>No members loaded</p>
                            )}
                          </section>

                          <section className={managerStyles.detailSection}>
                            <h4>
                              <Icon name="analytics" />
                              Tasks
                            </h4>
                            {(detail.tasks ?? []).length ? (
                              <div className={managerStyles.detailTaskList}>
                                {detail.tasks?.map((task) => (
                                  <article className={managerStyles.detailTask} key={task.id}>
                                    <div className={managerStyles.detailTaskHeader}>
                                      <h5>{task.title}</h5>
                                      <span>
                                        <span
                                          className={commonStyles.priority(priorityTone(task.priority))}
                                        >
                                          {priorityLabel(task.priority)}
                                        </span>
                                        <span
                                          className={commonStyles.status(statusColumn(task.status))}
                                        >
                                          {statusLabel(task.status)}
                                        </span>
                                      </span>
                                    </div>
                                    <p>{task.description || 'No description'}</p>
                                    <div className={managerStyles.detailTaskMeta}>
                                      <span>
                                        <Icon name="user" />
                                        {task.assignedEmployeesCount} assigned
                                      </span>
                                      <span>{formatDate(task.deadline)}</span>
                                      <span>
                                        <Icon name="clock" />
                                        {task.workHours}h
                                      </span>
                                    </div>
                                    {(task.assignedEmployees ?? []).length ? (
                                      <div className={managerStyles.assigneeList}>
                                        {task.assignedEmployees?.map((member) => (
                                          <span key={member.id}>
                                            {member.username}
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </article>
                                ))}
                              </div>
                            ) : (
                              <p>No tasks yet</p>
                            )}
                          </section>
                        </div>
                      ) : null}
                    </article>
                  )
                })
              ) : (
                <p className={managerStyles.emptyText}>No teams yet</p>
              )}
            </section>
          ) : (
            <section className={managerStyles.dashboardPanel} aria-label={pageTitle}>
              <p>No data yet</p>
            </section>
          )}
        </div>
      </section>

      {selectedTask ? (
        <div className={managerStyles.modalBackdrop} role="presentation">
          <section
            className={`${managerStyles.modal} ${managerStyles.taskDetailModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manager-task-detail-title"
          >
            <header className={managerStyles.taskDetailHead}>
              <div>
                <div className={managerStyles.taskDetailTitleRow}>
                  <h2 id="manager-task-detail-title">{selectedTask.title}</h2>
                  <span
                    className={commonStyles.priority(priorityTone(selectedTask.priority))}
                  >
                    {priorityLabel(selectedTask.priority)}
                  </span>
                  <span
                    className={commonStyles.status(statusColumn(selectedTask.status))}
                  >
                    {statusLabel(selectedTask.status)}
                  </span>
                </div>
                <p>{selectedTask.teamName}</p>
              </div>
              <button
                className={managerStyles.taskDetailClose}
                type="button"
                aria-label="Close task details"
                onClick={() => {
                  setSelectedTask(null)
                  setSelectedTaskDetails(null)
                  setTaskDetailsWarning('')
                }}
              >
                <Icon name="close" />
              </button>
            </header>

            <div className={managerStyles.taskDetailBody}>
              {taskDetailsWarning ? (
                <p className={managerStyles.backendWarning}>
                  <Icon name="warning" />
                  {taskDetailsWarning}
                </p>
              ) : null}

              <section className={managerStyles.taskSummary}>
                <h3>Description</h3>
                <p>
                  {selectedTaskDetails?.description ??
                    selectedTask.description ??
                    'Missing description'}
                </p>
                <div className={managerStyles.taskFacts}>
                  <span className={!selectedTask.deadline ? managerStyles.missing : ''}>
                    <Icon name={selectedTask.deadline ? 'calendar' : 'warning'} />
                    Deadline: {formatDate(selectedTask.deadline)}
                  </span>
                  <span>
                    <Icon name="clock" />
                    Total Time:{' '}
                    {selectedTaskDetails?.workHours ?? selectedTask.workHours}h
                  </span>
                </div>
              </section>

              <section className={managerStyles.taskAssignees}>
                <div>
                  <h3>Assign To</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage({
                        text: 'Backend endpoint for editing task assignees is missing.',
                        type: 'error',
                      })
                    }
                  >
                    <Icon name="edit" />
                    Edit
                  </button>
                </div>
                {selectedTaskAssignedUsers.length ? (
                  <div className={managerStyles.taskAssigneeChips}>
                    {selectedTaskAssignedUsers.map((member) => (
                      <span key={member.id}>
                        <span className={commonStyles.avatar}>
                          {initials(member.username)}
                        </span>
                        {member.username}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`${managerStyles.backendWarning} m-0`}>
                    <Icon name="warning" />
                    Assigned users are not available from the loaded task data.
                  </p>
                )}
              </section>

              <div className={managerStyles.taskTabs}>
                <button
                  className={managerStyles.taskTab(activeTaskTab === 'comments')}
                  type="button"
                  onClick={() => setActiveTaskTab('comments')}
                >
                  Comments
                </button>
                <button
                  className={managerStyles.taskTab(activeTaskTab === 'time')}
                  type="button"
                  onClick={() => setActiveTaskTab('time')}
                >
                  Time Tracking
                </button>
                <button
                  className={managerStyles.taskTab(activeTaskTab === 'history')}
                  type="button"
                  onClick={() => setActiveTaskTab('history')}
                >
                  History
                </button>
              </div>

              {activeTaskTab === 'comments' ? (
                <section className={managerStyles.taskTabPanel}>
                  <textarea
                    placeholder="Add Comment... Use @username to mention someone"
                  />
                  <div className={managerStyles.commentActions}>
                    <span>
                      Available:{' '}
                      {selectedTaskAssignedUsers.length
                        ? selectedTaskAssignedUsers
                            .map((member) => `@${member.username}`)
                            .join(', ')
                        : 'No assignees'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMessage({
                          text: 'Backend endpoint for adding comments is missing.',
                          type: 'error',
                        })
                      }
                    >
                      Add Comment
                    </button>
                  </div>
                  {selectedTaskComments.length ? (
                    <div className={managerStyles.commentList}>
                      {selectedTaskComments.map((comment) => (
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
                    <p className={managerStyles.emptyText}>
                      No comments loaded from backend.
                    </p>
                  )}
                </section>
              ) : null}

              {activeTaskTab === 'time' ? (
                <section className={managerStyles.taskTabPanel}>
                  {selectedTaskWorkSessions.length ? (
                    selectedTaskWorkSessions.map((session) => (
                      <article className={managerStyles.taskRecord} key={session.id}>
                        <strong>{session.username}</strong>
                        <span>{session.hours}h</span>
                        <time>{formatDate(session.date)}</time>
                      </article>
                    ))
                  ) : (
                    <p className={managerStyles.emptyText}>
                      No time sessions loaded from backend.
                    </p>
                  )}
                </section>
              ) : null}

              {activeTaskTab === 'history' ? (
                <section className={managerStyles.taskTabPanel}>
                  {selectedTaskHistory.length ? (
                    selectedTaskHistory.map((item) => (
                      <article className={managerStyles.taskRecord} key={item.id}>
                        <strong>{item.action}</strong>
                        <span>{item.changedByUsername}</span>
                        <time>{new Date(item.createdAt).toLocaleString()}</time>
                      </article>
                    ))
                  ) : (
                    <p className={managerStyles.emptyText}>
                      No history loaded from backend.
                    </p>
                  )}
                </section>
              ) : null}
            </div>

            <footer className={managerStyles.taskDetailFooter}>
              <button
                className="text-[#ef1d32]"
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleArchiveSelectedTask()
                }}
              >
                Archive
              </button>
              <button type="button" onClick={openTransferTaskModal}>
                Transfer Task
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {isTaskModalOpen ? (
        <div className={managerStyles.modalBackdrop} role="presentation">
          <form
            className={`${managerStyles.modal} w-[min(100%,648px)]`}
            aria-label="Create Task"
            onSubmit={handleCreateTask}
          >
            <h2>Create Task</h2>

            <label>
              <span>Title</span>
              <input
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <div className={managerStyles.modalGrid}>
              <label>
                <span>Priority</span>
                <select
                  value={taskForm.priority}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      priority: event.target.value,
                    }))
                  }
                >
                  {priorityOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Deadline</span>
                <input
                  type="date"
                  value={taskForm.deadline}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      deadline: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label>
              <span>Team</span>
              <select
                value={taskForm.teamId}
                onChange={(event) => {
                  void handleTaskTeamChange(event.target.value)
                }}
              >
                <option value="">Select team</option>
                {teamsWithDetails.map((team) => (
                  <option value={team.id} key={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedTaskTeam ? (
              <>
                <div className={managerStyles.taskAssignLabel}>Assign To</div>
                <fieldset className={managerStyles.taskAssignPanel}>
                {(selectedTaskTeam.members ?? []).length ? (
                  <div className={managerStyles.memberList}>
                    {selectedTaskTeam.members?.map((member) => (
                      <label
                        key={member.id}
                        className={managerStyles.memberListOption}
                      >
                        <input
                          type="checkbox"
                          checked={taskForm.assignments.includes(String(member.id))}
                          onChange={(event) =>
                            toggleAssignment(member.id, event.target.checked)
                          }
                        />
                        <span>{member.username}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p>No members in this team</p>
                )}
                </fieldset>
              </>
            ) : null}

            <div className={managerStyles.modalActions}>
              <button
                className={managerStyles.modalCancel}
                type="button"
                disabled={isSaving}
                onClick={() => setIsTaskModalOpen(false)}
              >
                Cancel
              </button>
              <button className={managerStyles.modalSave} type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isTeamModalOpen ? (
        <div className={managerStyles.modalBackdrop} role="presentation">
          <form
            className={`${managerStyles.modal} ${managerStyles.teamModal} self-center`}
            aria-label={editingTeam ? 'Edit Team' : 'Create Team'}
            onSubmit={handleSaveTeam}
          >
            <h2>
              {editingTeam
                ? `Edit Team Members - ${editingTeam.name}`
                : 'Create Team'}
            </h2>

            {editingTeam ? null : (
              <label>
                <span>Name</span>
                <input
                  value={teamForm.name}
                  onChange={(event) =>
                    setTeamForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
            )}

            <div className={managerStyles.memberListLabel}>Members</div>
            <fieldset className={managerStyles.memberListPanel}>
              {allMembers.length ? (
                <div className={managerStyles.memberList}>
                  {allMembers.map((member) => (
                    <label
                      key={member.id}
                      className={managerStyles.memberListOption}
                    >
                      <input
                        type="checkbox"
                        checked={teamForm.memberIds.includes(String(member.id))}
                        onChange={(event) =>
                          toggleTeamMember(member.id, event.target.checked)
                        }
                      />
                      <span>{member.username}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p>No employees are assigned to this manager yet.</p>
              )}
            </fieldset>

            <div className={managerStyles.modalActions}>
              <button
                className={managerStyles.modalCancel}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsTeamModalOpen(false)
                  setEditingTeam(null)
                }}
              >
                Cancel
              </button>
              <button className={managerStyles.modalSave} type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingTeam ? 'Save Team' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isTransferTaskModalOpen ? (
        <div className={managerStyles.modalBackdrop} role="presentation">
          <div
            className={`${managerStyles.modal} w-[min(100%,560px)] self-center`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-task-title"
          >
            <h2 id="transfer-task-title">Transfer Task</h2>
            <p className="mb-4 text-[15px] leading-[1.6] text-[#374151]">
              Transfer "{selectedTask?.title}" from {selectedTask?.teamName} to a
              different active team.
            </p>

            <label>
              <span>Destination team</span>
              <select
                value={transferTaskTeamId}
                onChange={(event) =>
                  handleTransferTaskTeamChange(event.target.value)
                }
              >
                <option value="">Select team</option>
                {transferTaskTargetTeams.map((team) => (
                  <option value={team.id} key={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedTransferTaskTeam ? (
              <>
                <div className={managerStyles.taskAssignLabel}>Assign To</div>
                <fieldset className={managerStyles.taskAssignPanel}>
                {selectedTransferTaskTeam.members?.length ? (
                  <div className={managerStyles.memberList}>
                    {selectedTransferTaskTeam.members.map((member) => (
                      <label
                        key={member.id}
                        className={managerStyles.memberListOption}
                      >
                        <input
                          type="checkbox"
                          checked={transferTaskAssignments.includes(String(member.id))}
                          onChange={(event) =>
                            toggleTransferTaskAssignment(member.id, event.target.checked)
                          }
                        />
                        <span>{member.username}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p>No members available in the selected team.</p>
                )}
                </fieldset>
              </>
            ) : null}

            {transferTaskError ? (
              <p className="mb-4 text-[14px] font-bold text-[#b91c1c]">
                {transferTaskError}
              </p>
            ) : null}

            <div className={managerStyles.modalActions}>
              <button
                className={managerStyles.modalCancel}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsTransferTaskModalOpen(false)
                  setTransferTaskTeamId('')
                  setTransferTaskAssignments([])
                  setTransferTaskError('')
                }}
              >
                Cancel
              </button>
              <button
                className={managerStyles.modalSave}
                type="button"
                disabled={isSaving || !transferTaskTeamId || transferTaskAssignments.length === 0}
                onClick={() => {
                  void handleTransferTask()
                }}
              >
                {isSaving ? 'Transferring...' : 'Transfer Task'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {transferCandidate ? (
        <div className={managerStyles.modalBackdrop} role="presentation">
          <div
            className={`${managerStyles.modal} w-[min(100%,448px)] self-center [&>p]:mb-3.5 [&>p]:text-[14px] [&>p]:leading-[1.45] [&>p]:font-medium [&>p]:text-[#25324a] [&_ul]:mb-[18px] [&_ul]:grid [&_ul]:list-none [&_ul]:gap-2 [&_ul]:p-0 [&_ul]:text-[14px] [&_ul]:font-semibold [&_ul]:text-[#050505]`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-team-title"
          >
            <h2 id="transfer-team-title">Transfer Team</h2>
            <p>
              Transfer "{transferCandidate.name}" to another manager. This will
              also transfer:
            </p>
            <ul>
              <li>
                {transferPreview?.membersCount ??
                  transferCandidate.employeesCount}{' '}
                team members
              </li>
              <li>
                {transferPreview?.tasksCount ??
                  transferCandidate.tasksCount ??
                  0}{' '}
                tasks
              </li>
            </ul>

            <label>
              <span>Select Manager</span>
              <select
                value={transferManagerId}
                onChange={(event) => setTransferManagerId(event.target.value)}
              >
                <option value="">Choose manager...</option>
                {transferManagers.map((manager) => (
                  <option value={manager.id} key={manager.id}>
                    {manager.username}
                  </option>
                ))}
              </select>
            </label>
            {transferManagersError ? (
              <p className={`${managerStyles.endpointNote} text-[#b91c1c]`}>
                ! {transferManagersError}
              </p>
            ) : null}
            {!transferManagersError && transferManagers.length === 0 ? (
              <p className={managerStyles.endpointNote}>
                Loading managers or no managers available for transfer.
              </p>
            ) : null}

            <div className={managerStyles.modalActions}>
              <button
                className={managerStyles.modalCancel}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setTransferCandidate(null)
                  setTransferPreview(null)
                  setTransferManagerId('')
                  setTransferManagers([])
                  setTransferManagersError('')
                }}
              >
                Cancel
              </button>
              <button
                className={managerStyles.modalSave}
                type="button"
                disabled={isSaving || !transferManagerId}
                onClick={() => {
                  void handleTransferTeam()
                }}
              >
                {isSaving ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {archiveCandidate ? (
        <div className={managerStyles.modalBackdrop} role="presentation">
          <div
            className={`${managerStyles.modal} w-[min(100%,448px)] self-center [&_h2]:mb-3.5 [&>p]:mb-6 [&>p]:text-[16px] [&>p]:leading-[1.45] [&>p]:font-medium [&>p]:text-[#25324a]`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-confirm-title"
          >
            <h2 id="archive-confirm-title">Are you sure?</h2>
            <p>
              Archive "{archiveCandidate.name}"? This will also archive the
              team's tasks.
            </p>
            <div className={managerStyles.modalActions}>
              <button
                className={managerStyles.modalCancel}
                type="button"
                disabled={isSaving}
                onClick={() => setArchiveCandidate(null)}
              >
                No
              </button>
              <button
                className={managerStyles.modalDanger}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleArchiveTeam()
                }}
              >
                {isSaving ? 'Archiving...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default ManagerPage
