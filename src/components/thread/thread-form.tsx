'use client'

import { Image, Link2, Trash } from 'lucide-react'
import { useEffect, useReducer, useRef, useState, useTransition } from 'react'
import { Button } from '~/components/ui/button'
import { TextareaExtend } from '~/components/ui/textarea-extend'
import { useToast } from '~/components/ui/use-toast'
import { ThreadData } from '~/types'
import { ThreadRefer } from './thread-refer'
import { uploadImage } from '../../actions/common'

type ThreadReferAction =
  | {
      type: 'init'
      threadIds?: string[]
    }
  | {
      type: 'add' | 'remove'
      threadId: string
    }
  | {
      type: 'clear'
    }

type ThreadImageAction =
  | {
      type: 'init'
      imageIds?: string[]
    }
  | {
      type: 'add'
      imageIds: string[]
    }
  | {
      type: 'remove'
      imageId: string
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
  const [referThreads, dispatchRefers] = useReducer(
    (state: string[], action: ThreadReferAction) => {
      if (action.type === 'init') {
        state = action.threadIds ?? []
      } else if (action.type === 'add') {
        if (state.includes(action.threadId)) {
          toast({ description: `Thread has been referenced.` })
        } else {
          if (state.length >= 3) {
            toast({ description: 'Up to three references are supported' })
          } else {
            state = [...state, action.threadId]
          }
        }
      } else if (action.type === 'remove') {
        state = state.filter(threadId => threadId !== action.threadId)
      } else if (action.type === 'clear') {
        state = []
      }
      return state
    },
    []
  )

  const [images, dispatchImages] = useReducer((state: string[], action: ThreadImageAction) => {
    if (action.type === 'init') {
      state = action.imageIds ?? []
    } else if (action.type === 'add') {
      for (const imageId of action.imageIds) {
        if (state.includes(imageId)) {
          toast({ description: `Image has been referenced.` })
        } else {
          state = [...state, imageId]
        }
      }
    } else if (action.type === 'remove') {
      state = state.filter(imageId => imageId !== action.imageId)
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
      dispatchRefers({ type: 'init', threadIds: thread.refers?.map(x => x.refer_thread_id) })
      dispatchImages({ type: 'init', imageIds: thread.images?.map(x => x.image_id) })
    } else {
      setThreadContent(defaultValue ?? '')
    }
  }, [])

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      let action = 'create'
      if (thread) {
        action = 'update'
        if (!threadContent && referThreads.length === 0) {
          action = 'delete'
        }
      }
      await onSubmit(action, formData)
      dispatchRefers({ type: 'clear' })
      dispatchImages({ type: 'clear' })
      setThreadContent('')
    })
  }

  const handleRefer = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const threadPrefix = 'thread://'
    navigator.clipboard.readText().then(text => {
      if (!text.startsWith(threadPrefix)) {
        const description = (
          <>
            Please <b>copy</b> a thread first.
          </>
        )
        toast({ description })
        return
      }
      const threadId = text.substring(threadPrefix.length)
      dispatchRefers({ type: 'add', threadId })
    })
  }
  const handleImages = (files: FileList | null) => {
    if (!files) return
    const formData = new FormData()
    for (const file of files) {
      formData.append('images', file)
    }
    uploadImage(formData).then(results => {
      dispatchImages({ type: 'add', imageIds: results.map(x => x.key) })
    })
  }

  const isEmpty = !threadContent && referThreads.length === 0
  const isDeleted = thread && isEmpty

  return (
    <form ref={formRef} action={handleSubmit} className="stack border rounded-lg p-2">
      <TextareaExtend
        name="thread_content"
        className="border-none p-0"
        placeholder="What's on your mind?"
        value={threadContent}
        onChange={event => {
          setThreadContent(event.target.value)
        }}
        disabled={pending}
        onSubmit={() => {
          formRef.current?.requestSubmit()
        }}
      />
      <ul className="flex items-center gap-1">
        {images.map(key => (
          <li key={key} className="flex items-center">
            <img src={`/image/${key}`} className="w-9 h-9 rounded" />
            <input type="hidden" name="image_ids" value={key} />
          </li>
        ))}
      </ul>
      <ul>
        {referThreads.map(threadId => (
          <div key={threadId} className="flex items-center">
            <ThreadRefer threadId={threadId} />
            <input type="hidden" name="refer_thread_ids" value={threadId} />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatchRefers({ type: 'remove', threadId })}
            >
              <Trash className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            className="rounded-full"
            onClick={handleRefer}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <ImageUploader pending={pending} onChange={handleImages} />
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onCancel}
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

const ImageUploader = ({
  pending,
  onChange,
}: {
  pending: boolean
  onChange: (files: FileList | null) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    fileInputRef.current?.click()
  }
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    onChange(files)
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      className="rounded-full"
      onClickCapture={handleClick}
    >
      <Image className="h-4 w-4" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={handleFile}
      />
    </Button>
  )
}
