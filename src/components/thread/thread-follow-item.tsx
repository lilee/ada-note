'use client'

import { Check, CheckCircle } from 'lucide-react'
import { MouseEvent, startTransition, useState } from 'react'
import { deleteThread, updateThread } from '~/actions/thread'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'
import { ThreadData } from '~/types'
import { ThreadFormUpdate } from './thread-form-update'
import ThreadTime from './thread-time'

export const ThreadFollowItem = ({ thread }: { thread: ThreadData }) => {
  const [isEditing, setEditing] = useState(false)

  const handleTodoChange = (status: 'done' | 'doing') => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('todo_status', status)
      await updateThread(thread.id, formData)
    })
  }

  const handleUpdate = async (formData: FormData) => {
    await updateThread(thread.id, formData)
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteThread(thread.id)
    setEditing(false)
  }

  return (
    <div className={cn('timeline-item')}>
      <ThreadDot onTodoChange={handleTodoChange} />
      <div className="timeline-content" onDoubleClick={() => setEditing(true)}>
        <div className="timeline-header">
          <ThreadTime time={thread.created_at} format="MM/dd HH:mm" />
        </div>
        {isEditing ? (
          <ThreadFormUpdate
            thread={thread}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onClose={() => setEditing(false)}
          />
        ) : (
          <pre>{thread.thread_content}</pre>
        )}
      </div>
    </div>
  )
}

const ThreadDot = ({ onTodoChange }: { onTodoChange?: (status: 'done' | 'doing') => void }) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="timeline-dot"></div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-3 w-[180px]"></DropdownMenuContent>
    </DropdownMenu>
  )
}
