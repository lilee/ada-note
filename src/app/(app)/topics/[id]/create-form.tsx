'use client'

import { ThreadFormCreate } from '~/components/thread'
import { createTopicThread } from '~/actions/topic'

export const CreateForm = ({ topicId }: { topicId: string }) => {
  const handleSubmit = async (formData: FormData) => {
    await createTopicThread(topicId, formData)
  }
  return <ThreadFormCreate onSubmit={handleSubmit} />
}
