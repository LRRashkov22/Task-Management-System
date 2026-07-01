import { apiJson } from './apiClient'

export type EmployeeRecentTaskDto = {
  id: number
  title: string
  priority: string
  status: string
  deadline?: string | null
}

export type EmployeeDashboardDto = {
  myTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  totalHoursLogged: number
  tasksCompleted: number
  avgTimePerTask: number
  recentTasks: EmployeeRecentTaskDto[]
}

export type EmployeeTaskPreviewDto = {
  id: number
  title: string
  status: string
  priority: string
  createdAt?: string | null
  deadline?: string | null
  workHours: number
  estimatedHours?: number | null
}

export type EmployeeMemberDto = {
  id: number
  username: string
}

export type EmployeeTaskCommentDto = {
  id: number
  content: string
  username: string
  createdAt: string
}

export type EmployeeTaskWorkSessionDto = {
  id: number
  hours: number
  username: string
  date: string
  description?: string
}

export type EmployeeTaskHistoryDto = {
  id: number
  action: string
  oldValue?: string | null
  newValue?: string | null
  changedByUsername: string
  createdAt: string
}

export type EmployeeTaskDetailsDto = {
  id: number
  title: string
  description?: string | null
  priority: string
  status: string
  deadline?: string | null
  workHours: number
  estimatedHours?: number | null
  assignedUsers: EmployeeMemberDto[]
  comments: EmployeeTaskCommentDto[]
  workSessions: EmployeeTaskWorkSessionDto[]
  history: EmployeeTaskHistoryDto[]
}

export type PersonalTaskDto = {
  id: number
  title: string
  description?: string | null
  priority: string
  status: string
  createdAt?: string | null
  deadline: string
  estimatedHours: number
  workHours: number
}

export type CreatePersonalTaskRequest = {
  title: string
  description?: string
  priority: number
  deadline: string
  estimatedHours: number
}

export function getEmployeeDashboardApi() {
  return apiJson<EmployeeDashboardDto>('/employee/dashboard')
}

export function getEmployeeTaskPreviewApi() {
  return apiJson<EmployeeTaskPreviewDto[]>('/employee/TaskPreview')
}

export function getEmployeeTaskDetailsApi(taskId: number) {
  return apiJson<EmployeeTaskDetailsDto>(`/employee/TaskDetailed/${taskId}`)
}

export function requestTaskReviewApi(taskId: number) {
  return apiJson<boolean>(`/Task/Request-Review/${taskId}`, {
    method: 'PATCH',
  })
}

export function getPersonalTasksApi() {
  return apiJson<PersonalTaskDto[]>('/Task/personal-board')
}

export function getPersonalTaskDetailsApi(taskId: number) {
  return apiJson<PersonalTaskDto>(`/Task/personal-task/${taskId}`)
}

export function createPersonalTaskApi(request: CreatePersonalTaskRequest) {
  return apiJson<PersonalTaskDto>('/Task/create-personal', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function changePersonalTaskStatusApi(taskId: number, status: number) {
  return apiJson<boolean>(`/Task/personal-status/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(status),
  })
}

export function deletePersonalTaskApi(taskId: number) {
  return apiJson<boolean>(`/Task/delete-personal/${taskId}`, {
    method: 'DELETE',
  })
}
