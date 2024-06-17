'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '~/components/ui/button'
import { TextareaExtend } from '~/components/ui/textarea-extend'

export const ThreadFormCreate = ({
  defaultValue,
  onSubmit,
  onCancel,
}: {
  defaultValue?: string
  onSubmit: (formData: FormData) => Promise<void>
  onCancel?: () => void
}) => {
  const [defaultValue_, setDefaultValue] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  useEffect(() => {
    setDefaultValue(defaultValue ?? '')
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await onSubmit(formData)
      formRef.current?.reset()
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="stack">
      <TextareaExtend
        name="thread_content"
        placeholder="What's on your mind?"
        defaultValue={defaultValue_}
        className="bg-white"
        disabled={pending}
        onSubmit={() => {
          formRef.current?.requestSubmit()
        }}
      />
      <div className="flex items-center justify-end gap-2">
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
        <Button type="submit" className="rounded-full" size="sm" disabled={pending}>
          Post
        </Button>
      </div>
    </form>
  )
}
