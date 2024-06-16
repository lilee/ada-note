import { useState } from 'react'
import { addFollowThread } from '~/actions/thread'
import { ThreadFormCreate } from './thread-form-create'
import { useRouter, useSearchParams } from 'next/navigation'

export const ThreadCardReply = ({ thread_id }: { thread_id: string }) => {
  const router = useRouter()
  const searchParams = new URLSearchParams(useSearchParams())
  const [isReplying, setReplying] = useState(false)
  const handleReply = async (formData: FormData) => {
    await addFollowThread(thread_id, formData)
    /*
    if (leadThread.group_name) {
      searchParams.set('group', leadThread.group_name)
    } else {
      searchParams.delete('group')
    }
    router.push(`/topics/${leadThread.topic_id}?${searchParams.toString()}`)
    */
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
