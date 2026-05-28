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

export function normalizeNotification(
  payload: Partial<NotificationDto> & Record<string, unknown>,
): NotificationDto {
  return {
    id: Number(payload.id ?? payload.Id),
    message: String(payload.message ?? payload.Message ?? ''),
    createdAt: String(payload.createdAt ?? payload.CreatedAt ?? ''),
    isRead: Boolean(payload.isRead ?? payload.IsRead ?? false),
  }
}

export function sortNotifications(items: NotificationDto[]): NotificationDto[] {
  const unread = items
    .filter((notification) => !notification.isRead)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )

  const read = items
    .filter((notification) => notification.isRead)
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    )

  return [...unread, ...read]
}

export async function fetchNotifications() {
  const data = await apiJson<NotificationApiDto[]>(
    '/Statistics/Admin/get-Notifications-List',
  )

  return sortNotifications(data.map(mapNotification))
}
