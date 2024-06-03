import { useState } from 'react'
import { addFollowThread } from '~/actions/thread'
import { ThreadFormCreate } from './thread-form-create'

export const ThreadCardReply = ({ thread_id }: { thread_id: string }) => {
  const [isReplying, setReplying] = useState(false)
  const handleReply = async (formData: FormData) => {
    await addFollowThread(thread_id, formData)
    setReplying(false)
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
