import { apiJson } from './apiClient'

export type AdminDashboardDto = {
  firstEntity: number
  secondEntitu: number
  thirdEntity: number
  fourthEntity: number
}

export type AdminUserDto = {
  id: number
  username: string
  managerName?: string
  teams?: number | null
}

export type ArchivedTeamDto = {
  id: number
  name: string
  managerName: string
  membersCount: number
  taskCount: number
}

export type ArchivedTaskDto = {
  id: number
  title: string
  teamName: string
  managerName?: string | null
  assignedEmployeesCount: number
}

export type CreateUserRequest = {
  username: string
  password: string
  role: 2 | 3
  managerId?: number | null
}

export type EditUserRequest = {
  id: number
  username: string
  managerId?: number | null
}

export function getAdminDashboardApi() {
  return apiJson<AdminDashboardDto>('/Statistics/Admin/get-Admin-Dashboard')
}

export function getEmployeesApi() {
  return apiJson<AdminUserDto[]>('/Statistics/Admin/get-employee')
}

export function getManagersApi() {
  return apiJson<AdminUserDto[]>('/Statistics/Admin/get-managers')
}

export function getArchivedTeamsApi() {
  return apiJson<ArchivedTeamDto[]>('/Statistics/Admin/get-archived-teams')
}

export function getArchivedTasksApi() {
  return apiJson<ArchivedTaskDto[]>('/Task/get-archived-tasks')
}

export function searchEmployeesApi(text: string, page = 1, pageSize = 10) {
  const searchParams = new URLSearchParams({
    text,
    page: String(page),
    pageSize: String(pageSize),
  })

  return apiJson<AdminUserDto[]>(
    `/Statistics/Admin/search-employee?${searchParams.toString()}`,
  )
}

export function createUserApi(request: CreateUserRequest) {
  return apiJson<void>('/identity/create-user', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function editUserApi(request: EditUserRequest) {
  return apiJson<EditUserRequest>('/identity/edit-user', {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function recoverArchivedTeamApi(id: number) {
  return apiJson<boolean>('/teams/recover-team', {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  })
}

export function deleteArchivedTeamApi(id: number) {
  return apiJson<boolean>(`/teams/force-delete-team/${id}`, {
    method: 'DELETE',
  })
}

export function recoverArchivedTaskApi(id: number) {
  return apiJson<unknown>('/Task/Recover-task', {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  })
}

export function deleteArchivedTaskApi(id: number) {
  return apiJson<boolean>(`/Task/force-delete-task/${id}`, {
    method: 'DELETE',
  })
}
