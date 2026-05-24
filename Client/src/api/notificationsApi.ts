import { apiJson } from './apiClient'

export type NotificationDto = {
  id: number
  message: string
  createdAt: string
  isRead: boolean
}

type NotificationApiDto = {
  id?: number
  Id?: number
  message?: string
  Message?: string
  createdAt?: string
  CreatedAt?: string
  isRead?: boolean
  IsRead?: boolean
}

function mapNotification(dto: NotificationApiDto): NotificationDto {
  return {
    id: dto.id ?? dto.Id ?? 0,
    message: dto.message ?? dto.Message ?? '',
    createdAt: dto.createdAt ?? dto.CreatedAt ?? '',
    isRead: dto.isRead ?? dto.IsRead ?? false,
  }
}

export async function fetchNotifications() {
  const data = await apiJson<NotificationApiDto[]>(
    '/Statistics/Admin/get-Notifications-List',
  )

  return data
    .map(mapNotification)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
}
