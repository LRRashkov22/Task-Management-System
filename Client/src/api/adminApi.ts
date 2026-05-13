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
  return apiJson<AdminDashboardDto>('/Statistics/get-Admin-Dashboard')
}

export function getEmployeesApi() {
  return apiJson<AdminUserDto[]>('/Statistics/get-employee')
}

export function getManagersApi() {
  return apiJson<AdminUserDto[]>('/Statistics/get-managers')
}

export function searchEmployeesApi(text: string, page = 1, pageSize = 10) {
  const searchParams = new URLSearchParams({
    text,
    page: String(page),
    pageSize: String(pageSize),
  })

  return apiJson<AdminUserDto[]>(
    `/Statistics/search-employee?${searchParams.toString()}`,
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
