'use client'

import { startTransition, useRef } from 'react'
import { createTopic } from '~/actions/topic'
import { Button } from '~/components/ui/button'
import { TextareaExtend } from '~/components/ui/textarea-extend'

export const TopicCreateForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await createTopic(formData)
    })
    formRef.current?.reset()
    onSuccess?.()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="stack">
      <TextareaExtend
        name="topic_content"
        placeholder="Please input topic name and description"
        className="bg-white"
        onSubmit={() => {
          formRef.current?.requestSubmit()
        }}
      />
      <div className="flex items-center justify-end">
        <Button type="submit" className="rounded-full" size="sm">
          New
        </Button>
      </div>
    </form>
  )
}
