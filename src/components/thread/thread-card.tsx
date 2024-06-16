'use client'

import { useState } from 'react'
import type { ThreadData } from '~/types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ThreadCardReply } from './thread-card-reply'
import { ThreadFormUpdate } from './thread-form-update'
import { parseThreadContent } from './util'
import { ThreadFollowItem } from './thread-follow-item'
import { deleteThread, updateThread } from '~/actions/thread'
import ThreadTime from './thread-time'
import { TopicGroupButton } from '~/components/topic/topic-group-button'

export const ThreadCard = ({ thread }: { thread: ThreadData }) => {
  const [isEditing, setEditing] = useState(false)
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
          <div className="timeline-item pb-0">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <ThreadCardReply thread_id={thread.id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
