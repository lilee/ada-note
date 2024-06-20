'use client'

import { Link2, Trash } from 'lucide-react'
import { useEffect, useReducer, useRef, useState, useTransition } from 'react'
import { Button } from '~/components/ui/button'
import { TextareaExtend } from '~/components/ui/textarea-extend'
import { useToast } from '~/components/ui/use-toast'
import { ThreadData } from '~/types'
import { ThreadRefer } from './thread-refer'

type ReferThreadsAction =
  | {
      type: 'add' | 'remove'
      threadId: string
    }
  | {
      type: 'clear'
    }
export const ThreadForm = ({
  defaultValue,
  thread,
  onSubmit,
  onCancel,
}: {
  defaultValue?: string
  thread?: ThreadData
  onSubmit: (action: string, formData: FormData) => Promise<void>
  onCancel?: () => void
}) => {
  const { toast } = useToast()
  const [threadContent, setThreadContent] = useState('')
  const [referThreads, dispatch] = useReducer((state: string[], action: ReferThreadsAction) => {
    if (action.type === 'add') {
      if (!state.includes(action.threadId)) {
        state = [...state, action.threadId]
      }
    } else if (action.type === 'remove') {
      state = state.filter(threadId => threadId !== action.threadId)
    } else if (action.type === 'clear') {
      state = []
    }
    return state
  }, [])

  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  useEffect(() => {
    if (thread) {
      let content = thread.thread_content_long ?? thread.thread_content
      if (thread.group_name) {
        content = `[${thread.group_name}]\n${content}`
      }
      setThreadContent(content)
      thread.refers?.forEach(r => dispatch({ type: 'add', threadId: r.refer_thread_id }))
    } else {
      setThreadContent(defaultValue ?? '')
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      let action = 'create'
      if (thread) {
        action = 'update'
        if (!threadContent && referThreads.length === 0) {
          action = 'delete'
        }
      }
      await onSubmit(action, formData)
      dispatch({ type: 'clear' })
      setThreadContent('')
    })
  }

  const handleRefer = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const threadPrefix = 'thread://'
    navigator.clipboard.readText().then(text => {
      if (!text.startsWith(threadPrefix)) {
        toast({
          description: (
            <>
              Please <b>copy</b> a thread first.
            </>
          ),
        })
        return
      }
      const threadId = text.substring(threadPrefix.length)
      dispatch({ type: 'add', threadId })
    })
  }

  const isEmpty = !threadContent && referThreads.length === 0
  const isDeleted = thread && isEmpty

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="stack border rounded-lg p-2">
      <TextareaExtend
        name="thread_content"
        className="border-none p-0"
        placeholder="What's on your mind?"
        value={threadContent}
        onChange={event => {
          console.log('change', event.target.value)
          setThreadContent(event.target.value)
        }}
        disabled={pending}
        onSubmit={() => {
          formRef.current?.requestSubmit()
        }}
      />
      <ul>
        {referThreads.map(threadId => (
          <div key={threadId} className="flex items-center">
            <ThreadRefer threadId={threadId} />
            <input type="hidden" name="refer_thread_ids" value={threadId} />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch({ type: 'remove', threadId })}
            >
              <Trash className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            className="rounded-full"
            onClick={handleRefer}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.preventDefault()
                onCancel()
              }}
              disabled={pending}
              className="rounded-full"
            >
              Cancel
            </Button>
          )}
          {isDeleted ? (
            <Button
              type="submit"
              className="rounded-full"
              variant="destructive"
              size="sm"
              disabled={pending}
            >
              Delete
            </Button>
          ) : (
            <Button type="submit" className="rounded-full" size="sm" disabled={pending || isEmpty}>
              Post
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
