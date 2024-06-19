'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '~/components/ui/button'
import { TextareaExtend } from '~/components/ui/textarea-extend'
import { ThreadData } from '~/types'

export const ThreadFormUpdate = ({
  thread,
  onUpdate,
  onDelete,
  onClose,
}: {
  thread: ThreadData
  onUpdate?: (formData: FormData) => Promise<void>
  onDelete?: () => Promise<void>
  onClose?: () => void
}) => {
  let content = thread.thread_content_long ?? thread.thread_content
  if (thread.group_name) {
    content = `#${thread.group_name}#\n${content}`
  }
  const [contentState, setContentState] = useState<string>(content)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      if (!contentState) {
        await onDelete?.()
      } else {
        await onUpdate?.(formData)
      }
      formRef.current?.reset()
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="stack">
      <TextareaExtend
        name="thread_content"
        className="border-none p-0"
        value={contentState}
        onChange={event => setContentState(event.target.value)}
        disabled={pending}
        onSubmit={() => formRef.current?.requestSubmit()}
        onEsc={() => onClose?.()}
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          className="rounded-full"
          variant="secondary"
          size="sm"
          onClick={e => {
            e.preventDefault()
            onClose?.()
          }}
          disabled={pending}
        >
          Cancel
        </Button>
        {contentState ? (
          <Button
            type="submit"
            className="rounded-full"
            variant="default"
            size="sm"
            disabled={pending}
          >
            Update
          </Button>
        ) : (
          <Button
            type="submit"
            className="rounded-full"
            variant="destructive"
            size="sm"
            disabled={pending}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
