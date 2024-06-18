'use client'

import { useRef, useTransition } from 'react'
import { Input } from '~/components/ui/input'
import { TopicData } from '~/types'

export const TopicForm = ({
  topic,
  onSubmit,
}: {
  topic?: TopicData
  onSubmit: (formData: FormData) => Promise<void>
}) => {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await onSubmit(formData)
    })
  }
  let defaultValue = ''
  if (topic) {
    defaultValue = topic.topic_name
    if (topic.group_name) {
      defaultValue += ` / ${topic.group_name}`
    }
  }
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="stack">
      <Input
        name="topic_content"
        placeholder="topic name / group name"
        disabled={pending}
        defaultValue={defaultValue}
      />
    </form>
  )
}
