import { apiJson } from './apiClient'

export function markNotificationAsReadApi(notificationId: number) {
  return apiJson<boolean>(`/Notification/mark-as-read/${notificationId}`, {
    method: 'PATCH',
  })
}

export function markAllNotificationsAsReadApi() {
  return apiJson<boolean>('/Notification/mark-as-read-all', {
    method: 'PATCH',
  })
}
