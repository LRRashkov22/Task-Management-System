import { apiJson } from './apiClient'

export type WorkSessionDto = {
  id: number
  taskId: number
  username: string
  hours: number
  description: string
  date: string
}

export type CreateWorkSessionRequest = {
  taskId: number
  hours: number
  description: string
}

export function createWorkSessionApi(data: CreateWorkSessionRequest) {
  return apiJson<WorkSessionDto>('/WorkSessions', {
    method: 'POST',
    body: JSON.stringify({
      taskId: data.taskId,
      hours: data.hours,
      description: data.description,
    }),
  })
}

export function getWorkSessionsByTaskIdApi(taskId: number) {
  return apiJson<WorkSessionDto[]>(`/WorkSessions/task/${taskId}`)
}

export function getAllWorkSessionsApi() {
  return apiJson<WorkSessionDto[]>('/WorkSessions')
}
