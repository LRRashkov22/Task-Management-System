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
  email?: string | null
  managerName?: string
  teams?: number | null
}

export type AdminDeleteManagerPreviewDto = {
  managerName: string
  teams: number
  tasks: number
  employees: number
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

export type AdminLogDto = {
  id: number
  module: number | string
  actionType: number | string
  action?: string | null
  userId?: number | null
  createdAt?: string | null
  user?: {
    id?: number
    username?: string | null
    role?: number | string
  } | null
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

export type TransferManagerOwnershipRequest = {
  currentManagerId: number
  newManagerId: number
}

export type GetAdminLogsRequest = {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  userId?: number
  actionType?: number
  module?: number
  fromDate?: string
  toDate?: string
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

export function getAdminLogsApi(request: GetAdminLogsRequest = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return apiJson<AdminLogDto[]>(
    `/logs/get-logs${query ? `?${query}` : ''}`,
  )
}

export function searchEmployeesApi(text = '', page = 1, pageSize = 10) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  const trimmedText = text.trim()

  if (trimmedText) {
    searchParams.set('text', trimmedText)
  }

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

export function deleteEmployeeApi(employeeId: number) {
  return apiJson<boolean>(`/identity/delete-employee/${employeeId}`, {
    method: 'DELETE',
  })
}

export function getAdminDeleteManagerPreviewApi(managerId: number) {
  return apiJson<AdminDeleteManagerPreviewDto>(
    `/Statistics/Admin/get-admin-preview-OnDelete/${managerId}`,
  )
}

export function transferManagerOwnershipApi(
  request: TransferManagerOwnershipRequest,
) {
  return apiJson<boolean>('/identity/transfer-ownership', {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function forceDeleteManagerApi(managerId: number) {
  return apiJson<boolean>(`/identity/${managerId}/force-delete`, {
    method: 'DELETE',
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
  return apiJson<boolean>('/Task/Recover-task', {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  })
}

export function deleteArchivedTaskApi(id: number) {
  return apiJson<boolean>(`/Task/force-delete-task/${id}`, {
    method: 'DELETE',
  })
}
