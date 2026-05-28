import { apiJson } from './apiClient'

export function requestTaskReviewApi(taskId: number) {
  return apiJson<boolean>(`/Task/Request-Review/${taskId}`, {
    method: 'PATCH',
  })
}
