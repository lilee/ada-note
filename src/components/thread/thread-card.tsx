'use client'

import { add, compareAsc, formatDistanceToNowStrict } from 'date-fns'
import { useState } from 'react'
import { cn } from '~/lib/utils'
import type { ThreadData } from '~/types'
import { ThreadCardReply } from './thread-card-reply'
import { ThreadItem } from './thread-item'

export const ThreadCard = ({ thread }: { thread: ThreadData }) => {
  const [flyingThread, setFlyingThread] = useState<ThreadData | null>(null)
  return (
    <div
      className={cn('border rounded-xl shadow-sm p-6 timeline', {
        'bg-gray-50': thread.pin_on_group > 0,
      })}
    >
      <ThreadBadge thread={thread} />
      <ThreadItem thread={thread} />
      {thread.follows?.map(thread => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
      {flyingThread && <ThreadItem thread={flyingThread} />}
      <div className="timeline-item pb-0">
        <div className="timeline-dot"></div>
        <div className="timeline-content">
          <ThreadCardReply lead={thread} onFlying={setFlyingThread} />
        </div>
      </div>
    </div>
  )
}

export const ThreadBadge = ({ thread }: { thread: ThreadData }) => {
  if (thread.color.toLowerCase() === 'none') {
    return null
  }
  let color = thread.color as string
  let text = thread.color as string
  if (color === 'task') {
    if (compareAsc(new Date(), add(thread.created_at, { days: 5 })) > 0) {
      color = 'task-overdue'
      text = `task: ${formatDistanceToNowStrict(thread.created_at, { addSuffix: true })}`
    }
  }
  return (
    <span
      className="thread-color absolute right-0 top-0 rounded-tr-xl rounded-bl-lg"
      data-color={color}
    >
      {text}
    </span>
  )
}
