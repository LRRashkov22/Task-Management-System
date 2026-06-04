import { apiJson } from './apiClient'

export type ManagerMemberDto = {
  id: number
  username: string
}

export type ManagerUserDto = {
  id: number
  username: string
  managerName?: string
  teams?: number | null
}

export type TaskCommentDto = {
  id: number
  content: string
  username: string
  createdAt: string
}

export type TaskWorkSessionDto = {
  id: number
  hours: number
  username: string
  date: string
  description?: string | null
}

export type TaskHistoryDto = {
  id: number
  action: string
  oldValue?: string | null
  newValue?: string | null
  changedByUsername: string
  createdAt: string
}

export type ManagerTaskCardDto = {
  id: number
  title: string
  description?: string | null
  status: string
  priority: string
  deadline?: string | null
  assignedEmployeesCount: number
  workHours: number
  assignedEmployees?: ManagerMemberDto[]
}

export type ManagerTaskDetailsDto = {
  id: number
  title: string
  description?: string | null
  priority: string
  status: string
  deadline?: string | null
  workHours: number
  assignedUsers: ManagerMemberDto[]
  comments: TaskCommentDto[]
  workSessions: TaskWorkSessionDto[]
  history: TaskHistoryDto[]
}

export type ManagerTeamDto = {
  id: number
  name: string
  managerId: number
  managerUsername?: string
  employeesCount: number
  tasksCount?: number | null
  members?: ManagerMemberDto[]
  tasks?: ManagerTaskCardDto[]
}

export type ManagerTeamDropdownDto = {
  id: number
  name: string
}

export type ManagerCalendarTaskDto = {
  taskName: string
  teamName: string
  status: string | number
  deadline: string
  startDate: string
}

export type EditManagerTaskRequest = {
  name?: string
  description?: string
  deadline?: string
  members?: number[]
}

export type TransferTeamPreviewDto = {
  teamId: number
  teamName: string
  membersCount: number
  tasksCount: number
  currentManagerName: string
}

export type CreateManagerTaskRequest = {
  title: string
  description: string
  priority: number
  deadline: string
  teamId: number
  assignments: number[]
}

export type CreateManagerTeamRequest = {
  name: string
  managerId: number
  memberIds: number[]
}

export type EditManagerTeamRequest = {
  id: number
  name: string
  members: number[]
}

export type TransferManagerTeamRequest = {
  teamId: number
  newManagerId: number
}

export type TransferManagerTaskRequest = {
  taskId: number
  newTeamId: number
  assignments: number[]
}

export type ChangeManagerTaskStatusRequest = {
  status: number
}

export type BoardTaskDto = {
  id: number
  title: string
  description?: string | null
  priority: string
  status: string
  deadline?: string | null
  assignedEmployeesCount: number
  workHours: number
}

export function getManagerTeamsApi() {
  return apiJson<ManagerTeamDto[]>(
    '/Statistics/Manager/get-all-teams-dashboard/team-page',
  )
}

export function getManagerTeamDropdownApi() {
  return apiJson<ManagerTeamDropdownDto[]>('/Statistics/Manager/my-teams')
}

export function getManagerTeamDetailsApi(id: number) {
  return apiJson<ManagerTeamDto>(`/Statistics/Manager/get-team-details/${id}`)
}

export function getManagerEmployeesApi() {
  return apiJson<ManagerMemberDto[]>('/Statistics/Manager/get-manager-employees')
}

export function getManagerCalendarInformationApi() {
  return apiJson<ManagerCalendarTaskDto[]>(
    '/Statistics/Manager/get-calendar-information',
  )
}

export function getManagersForTransferApi() {
  return apiJson<ManagerUserDto[]>('/Statistics/Admin/get-managers')
}

export function getTransferTeamPreviewApi(id: number) {
  return apiJson<TransferTeamPreviewDto>(
    `/Statistics/Manager/transfer-preview/${id}`,
  )
}

export function getManagerTaskDetailsApi(id: number) {
  return apiJson<ManagerTaskDetailsDto>(`/Task/get-tasks-board/details/${id}`)
}

export function getManagerBoardTasksApi() {
  return apiJson<BoardTaskDto[]>('/Task/get-tasks-board')
}

export function changeManagerTaskStatusApi(
  taskId: number,
  request: ChangeManagerTaskStatusRequest,
) {
  return apiJson<void>(`/Task/Change-task-status/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function markManagerTaskAsDoneApi(taskId: number) {
  return apiJson<boolean>(`/Task/Mark-AsDone/${taskId}`, {
    method: 'PATCH',
  })
}

export function createManagerTaskApi(request: CreateManagerTaskRequest) {
  return apiJson<void>('/Task/Create-task', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function archiveManagerTaskApi(id: number) {
  return apiJson<unknown>('/Task/Remove-task', {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  })
}

export function editManagerTaskApi(
  taskId: number,
  request: EditManagerTaskRequest,
) {
  return apiJson<boolean>(`/Task/Edit-Task/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function createManagerTeamApi(request: CreateManagerTeamRequest) {
  return apiJson<void>('/teams/create-team', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function editManagerTeamApi(request: EditManagerTeamRequest) {
  return apiJson<ManagerTeamDto>('/teams/edit-team', {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function transferManagerTeamApi(request: TransferManagerTeamRequest) {
  return apiJson<boolean>('/teams/transfer-team-ownership', {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function transferManagerTaskApi(request: TransferManagerTaskRequest) {
  return apiJson<boolean>('/Task/transfer-task', {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function archiveManagerTeamApi(id: number) {
  return apiJson<void>('/teams/remove-team', {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  })
}
