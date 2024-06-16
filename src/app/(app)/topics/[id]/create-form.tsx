'use client'

import { ThreadFormCreate } from '~/components/thread'
import { createTopicThread } from '~/actions/topic'
import { useSearchParams } from 'next/navigation'

export const CreateForm = ({ topicId }: { topicId: string }) => {
  const searchParams = useSearchParams()
  const group = searchParams.get('group')
  const handleSubmit = async (formData: FormData) => {
    await createTopicThread(topicId, formData)
  }
  return <ThreadFormCreate onSubmit={handleSubmit} defaultValue={group ? `[${group}]\n` : ''} />
}
