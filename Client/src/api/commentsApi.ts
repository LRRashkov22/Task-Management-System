import { apiJson } from './apiClient'

export type CommentDto = {
  id: number
  content: string
  userId?: number | null
  username: string
  taskId?: number
  createdAt: string
  mentionedUserIds?: number[]
}

export type CreateCommentRequest = {
  content: string
  taskId: number
  mentionedUserIds?: number[]
}

export function getCommentsByTaskIdApi(taskId: number) {
  return apiJson<CommentDto[]>(`/Comments/task/${taskId}`)
}

export function createCommentApi(request: CreateCommentRequest) {
  return apiJson<CommentDto>('/Comments', {
    method: 'POST',
    body: JSON.stringify({
      content: request.content,
      taskId: request.taskId,
      mentionedUserIds: request.mentionedUserIds ?? [],
    }),
  })
}

export type CommentMentionUserDto = {
  id: number
  username: string
}

export function searchCommentMentionsApi(taskId: number, search = '') {
  const searchParams = new URLSearchParams()
  const trimmedSearch = search.trim()

  if (trimmedSearch) {
    searchParams.set('search', trimmedSearch)
  }

  const query = searchParams.toString()

  return apiJson<CommentMentionUserDto[]>(
    `/employee/CommentSearchEmployee/${taskId}${query ? `?${query}` : ''}`,
  )
}
