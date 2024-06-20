import { readStreamableValue } from 'ai/rsc'
import { useState } from 'react'
import { addFollowThread, reflectThread, revalidateThread } from '~/actions/thread'
import { ThreadData } from '~/types'
import { ThreadForm } from './thread-form'

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
        color: 'none',
        is_archived: false,
        task_done_at: null,
        group_name: null,
        pin_on_group: 0,
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

  const handleReply = async (action: string, formData: FormData) => {
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
    return <ThreadForm onSubmit={handleReply} onCancel={() => setReplying(false)} />
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
