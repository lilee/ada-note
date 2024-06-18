'use client'

import { useState } from 'react'
import { deleteThread, updateThread } from '~/actions/thread'
import { TopicGroupButton } from '~/components/topic/topic-group-button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { ThreadData } from '~/types'
import { ThreadCardReply } from './thread-card-reply'
import { ThreadFollowItem } from './thread-follow-item'
import { ThreadFormUpdate } from './thread-form-update'
import ThreadTime from './thread-time'
import { parseThreadContent } from './util'

export const ThreadCard = ({ thread }: { thread: ThreadData }) => {
  const [isEditing, setEditing] = useState(false)
  const [flyingThread, setFlyingThread] = useState<ThreadData | null>(null)
  const { thread_title, thread_content } = parseThreadContent(thread.thread_content)

  const handleUpdate = async (formData: FormData) => {
    await updateThread(thread.id, formData)
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteThread(thread.id)
    setEditing(false)
  }

  if (isEditing) {
    return (
      <Card>
        <div className="p-4">
          <ThreadFormUpdate
            thread={thread}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onClose={() => setEditing(false)}
          />
        </div>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="p-4 space-y-1" onDoubleClick={() => setEditing(true)}>
        <div className="flex justify-between">
          <CardTitle className="text-sm flex gap-1 items-center">
            {thread.group_name && <TopicGroupButton group={{ group_name: thread.group_name }} />}
            {thread_title}
          </CardTitle>
          <div className="flex gap-1 text-xs text-gray-500">
            <ThreadTime time={thread.created_at} format="yyyy/MM/dd" />
          </div>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 font-sans leading-5 break-all text-wrap whitespace-pre-wrap;">
          {thread_content}
        </pre>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="timeline ml-2">
          {thread.follows?.map(thread => (
            <ThreadFollowItem key={thread.id} thread={thread} />
          ))}
          {flyingThread && <ThreadFollowItem thread={flyingThread} />}
          <div className="timeline-item pb-0">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <ThreadCardReply lead={thread} onFlying={setFlyingThread} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
