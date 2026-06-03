import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createCommentApi,
  getCommentsByTaskIdApi,
  searchCommentMentionsApi,
  type CommentDto,
  type CommentMentionUserDto,
} from '../api/commentsApi'
import { commonStyles, managerStyles } from '../styles'

export type CommentAssignee = {
  id: number
  username: string
}

type TaskCommentsPanelProps = {
  taskId: number
  comments: CommentDto[]
  assignees: CommentAssignee[]
  onCommentsChange: (comments: CommentDto[]) => void
  onTaskRefresh?: () => Promise<void>
  onError?: (message: string) => void
}

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function mentionToken(username: string) {
  return `@${username.replace(/\s/g, '')}`
}

function getActiveMentionQuery(value: string, cursorPosition: number) {
  const textBeforeCursor = value.slice(0, cursorPosition)
  const match = textBeforeCursor.match(/@([a-zA-Z0-9]*)$/)

  return match ? match[1] : null
}

function parseMentionedUserIds(
  content: string,
  mentionUsers: CommentMentionUserDto[],
): number[] {
  const matches = content.matchAll(/@([a-zA-Z0-9]+)/g)
  const ids = new Set<number>()

  for (const match of matches) {
    const token = match[1]
    const user = mentionUsers.find(
      (candidate) =>
        candidate.username.replace(/\s/g, '') === token ||
        candidate.username === token,
    )

    if (user) {
      ids.add(user.id)
    }
  }

  return [...ids]
}

function renderCommentContent(content: string) {
  const parts = content.split(/(@[a-zA-Z0-9]+)/g)

  return parts.map((part, index) => {
    if (/^@[a-zA-Z0-9]+$/.test(part)) {
      return (
        <span className="font-extrabold text-[#315af2]" key={`${part}-${index}`}>
          {part}
        </span>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

export function TaskCommentsPanel({
  taskId,
  comments,
  assignees,
  onCommentsChange,
  onTaskRefresh,
  onError,
}: TaskCommentsPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState<
    CommentMentionUserDto[]
  >([])
  const [isMentionLoading, setIsMentionLoading] = useState(false)

  const activeMentionQuery = getActiveMentionQuery(draft, cursorPosition)

  const mentionUsers = useMemo(() => {
    const users = new Map<number, CommentMentionUserDto>()

    assignees.forEach((assignee) => {
      users.set(assignee.id, {
        id: assignee.id,
        username: assignee.username,
      })
    })

    mentionSuggestions.forEach((user) => {
      users.set(user.id, user)
    })

    return [...users.values()]
  }, [assignees, mentionSuggestions])

  const availableMentions = useMemo(
    () => mentionUsers.map((user) => mentionToken(user.username)),
    [mentionUsers],
  )

  useEffect(() => {
    if (activeMentionQuery === null) {
      setMentionSuggestions([])
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsMentionLoading(true)

        try {
          const results = await searchCommentMentionsApi(
            taskId,
            activeMentionQuery,
          )

          if (!cancelled) {
            setMentionSuggestions(results)
          }
        } catch {
          if (!cancelled) {
            setMentionSuggestions([])
          }
        } finally {
          if (!cancelled) {
            setIsMentionLoading(false)
          }
        }
      })()
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [activeMentionQuery, taskId])

  function updateDraft(value: string, nextCursorPosition = value.length) {
    setDraft(value)
    setCursorPosition(nextCursorPosition)
  }

  function insertMention(username: string) {
    const textarea = textareaRef.current
    const token = mentionToken(username)
    const textBeforeCursor = draft.slice(0, cursorPosition)
    const textAfterCursor = draft.slice(cursorPosition)
    const mentionStart = textBeforeCursor.lastIndexOf('@')

    if (mentionStart === -1) {
      return
    }

    const nextValue = `${draft.slice(0, mentionStart)}${token} ${textAfterCursor}`
    const nextCursor = mentionStart + token.length + 1

    updateDraft(nextValue, nextCursor)
    setMentionSuggestions([])

    window.requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(nextCursor, nextCursor)
    })
  }

  async function refreshComments() {
    const refreshedComments = await getCommentsByTaskIdApi(taskId)
    onCommentsChange(refreshedComments)

    if (onTaskRefresh) {
      await onTaskRefresh()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = draft.trim()
    if (!content) {
      onError?.('Comment cannot be empty.')
      return
    }

    setIsSubmitting(true)

    try {
      await createCommentApi({
        content,
        taskId,
        mentionedUserIds: parseMentionedUserIds(content, mentionUsers),
      })

      await refreshComments()
      setDraft('')
      setMentionSuggestions([])
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Could not add comment.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={managerStyles.taskTabPanel}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) =>
              updateDraft(event.target.value, event.target.selectionStart ?? 0)
            }
            onClick={(event) =>
              setCursorPosition(
                (event.target as HTMLTextAreaElement).selectionStart ?? 0,
              )
            }
            onKeyUp={(event) =>
              setCursorPosition(
                (event.target as HTMLTextAreaElement).selectionStart ?? 0,
              )
            }
            placeholder="Add Comment... Use @username to mention someone"
            disabled={isSubmitting}
          />

          {activeMentionQuery !== null ? (
            <div className="absolute top-[calc(100%+8px)] left-0 z-20 w-full overflow-hidden rounded-xl border border-[#dbe2ea] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.12)]">
              {isMentionLoading ? (
                <p className="px-4 py-3 text-[13px] font-semibold text-[#64748b]">
                  Searching users...
                </p>
              ) : mentionSuggestions.length ? (
                mentionSuggestions.map((user) => (
                  <button
                    className="flex w-full items-center gap-3 border-0 border-b border-[#edf0f4] bg-white px-4 py-3 text-left text-[14px] font-semibold text-[#111827] last:border-b-0 hover:bg-[#f8fafc]"
                    key={user.id}
                    type="button"
                    onClick={() => insertMention(user.username)}
                  >
                    <span className={commonStyles.avatar}>
                      {initials(user.username)}
                    </span>
                    {user.username}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-[13px] font-semibold text-[#64748b]">
                  No matching assignees.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className={managerStyles.commentActions}>
          <span>
            Available:{' '}
            {availableMentions.length
              ? availableMentions.join(', ')
              : 'No assignees'}
          </span>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>

      {comments.length ? (
        <div className={managerStyles.commentList}>
          {comments.map((comment) => (
            <article key={comment.id}>
              <span className={commonStyles.avatar}>
                {initials(comment.username)}
              </span>
              <div>
                <strong>{comment.username}</strong>
                <time>{new Date(comment.createdAt).toLocaleString()}</time>
                <p>{renderCommentContent(comment.content)}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-[#6b7280]">No comments yet.</p>
      )}
    </section>
  )
}
