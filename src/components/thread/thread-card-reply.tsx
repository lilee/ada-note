import { readStreamableValue } from 'ai/rsc'
import { useState } from 'react'
import { addFollowThread, reflectThread, revalidateThread } from '~/actions/thread'
import { ThreadData } from '~/types'
import { ThreadFormCreate } from './thread-form-create'
import { revalidatePath } from 'next/cache'

export const ThreadCardReply = ({
  lead,
  onFlying,
}: {
  lead: ThreadData
  onFlying?: (thread: ThreadData | null) => void
}) => {
  const [isReplying, setReplying] = useState(false)
  const handleReflect = async (prompt: string) => {
    const makeFlyingThead = (thread_content: string) => {
      const flyingThead: ThreadData = {
        id: 'flying',
        lead_thread_id: lead.id,
        topic_id: lead.topic_id,
        color: 'None',
        task_done_at: null,
        group_name: null,
        thread_content,
        thread_content_long: null,
        command: `/reflect ${prompt}`,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: lead.user_id,
      }
      return flyingThead
    }
    onFlying?.(makeFlyingThead('Wait reflecting...'))
    const result = await reflectThread(lead.id, prompt)
    for await (const content of readStreamableValue(result)) {
      onFlying?.(makeFlyingThead(content ?? 'Wait reflecting...'))
    }
    await revalidateThread(lead.id)
    onFlying?.(null)
  }

  const handleReply = async (formData: FormData) => {
    const thread_content = formData.get('thread_content') as string
    if (thread_content.startsWith('/reflect ')) {
      const prompt = thread_content.substring('/reflect '.length)
      handleReflect(prompt).then(() => setReplying(false))
    } else {
      await addFollowThread(lead.id, formData)
      setReplying(false)
    }
  }
  if (isReplying) {
    return <ThreadFormCreate onSubmit={handleReply} onCancel={() => setReplying(false)} />
  }
  return (
    <div
      className="border rounded p-2 text-gray-500 text-xs cursor-text"
      onClick={() => {
        setReplying(true)
      }}
    >
      Add a reply ...
    </div>
  )
}
