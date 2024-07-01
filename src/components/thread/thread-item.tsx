'use client'

import { useState } from 'react'
import { deleteThread, updateThread } from '~/actions/thread'

import { ThreadData, ThreadImageData, ThreadReferData } from '~/types'
import { ThreadForm } from './thread-form'
import ThreadTime from './thread-time'
import { TopicGroupButton } from '~/components/topic/topic-group-button'
import { ThreadContentMarkdown } from './thread-content-md'
import { parseThreadContent } from './util'
import { ThreadRefer } from './thread-refer'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'
import Image from 'next/image'

export const ThreadItem = ({ thread }: { thread: ThreadData }) => {
  const [isEditing, setEditing] = useState(false)

  const handleSubmit = async (action: string, formData: FormData) => {
    if (action === 'delete') {
      await deleteThread(thread.id)
    } else if (action === 'update') {
      await updateThread(thread.id, formData)
    }
    setEditing(false)
  }

  const { thread_title, thread_content } = parseThreadContent(thread.thread_content)
  const timeFormat = thread.lead_thread_id ? 'MM/dd HH:mm' : 'yyyy/MM/dd HH:mm'

  return (
    <div className="timeline-item">
      <div className="timeline-dot" />
      <div className="timeline-content" onDoubleClick={() => setEditing(true)}>
        <div className="timeline-header">
          <ThreadTime time={thread.created_at} format={timeFormat} />
          {thread.group_name && <div className="font-medium">[{thread.group_name}]</div>}
          <CopyButton thread={thread} />
        </div>
        <div className="flex flex-col gap-0.5">
          {thread.command && <ThreadCommand command={thread.command} />}
          {isEditing ? (
            <ThreadForm
              thread={thread}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              {thread.lead_thread_id ? (
                <pre>
                  {thread.thread_content}{' '}
                  <ThreadContentMarkdown content={thread.thread_content_long} />
                </pre>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium">{thread_title}</h2>
                  </div>
                  {thread_content && (
                    <pre>
                      {thread_content}{' '}
                      <ThreadContentMarkdown content={thread.thread_content_long} />
                    </pre>
                  )}
                </>
              )}
              <ThreadImages images={thread.images} />
              <ThreadRefers refers={thread.refers} />
              <ThreadRefers refers={thread.reverts} revert />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ThreadRefers = ({ refers, revert }: { refers?: ThreadReferData[]; revert?: boolean }) => {
  if (!refers || refers.length == 0) {
    return null
  }
  const linkThreadIds = new Set<string>()
  refers.forEach(r => {
    if (revert) {
      linkThreadIds.add(r.lead_thread_id)
    } else {
      linkThreadIds.add(r.refer_thread_id)
    }
  })
  return (
    <ul>
      {Array.from(linkThreadIds).map(threadId => (
        <ThreadRefer key={threadId} threadId={threadId} revert={revert} />
      ))}
    </ul>
  )
}

const ThreadImages = ({ images }: { images?: ThreadImageData[] }) => {
  if (!images || images.length == 0) {
    return null
  }
  return (
    <ul className="flex items-center">
      {images.map(image => (
        <li key={image.image_id} className="flex items-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <img src={`/image/${image.image_id}`} className="w-9 h-9 rounded" alt="" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <img src={`/image/${image.image_id}`} loading="lazy" alt="" />
            </HoverCardContent>
          </HoverCard>
        </li>
      ))}
    </ul>
  )
}

const ThreadCommand = ({ command }: { command: string }) => {
  const [cmd, ...args] = command.split(' ')
  return (
    <div className="flex gap-2 items-center py-2">
      <div className="h-5 px-2 flex items-center text-xs rounded-full bg-blue-50 border border-blue-400 text-blue-500 font-medium">
        {cmd}
      </div>
      <ThreadCommandArgs cmd={cmd} args={args} />
    </div>
  )
}

const ThreadCommandArgs = ({ cmd, args }: { cmd: string; args: string[] }) => {
  if (cmd == '/group') {
    const [toGroup, fromGroup = 'None'] = args
    return (
      <>
        <TopicGroupButton group={{ group_name: fromGroup }} />
        <span>→</span>
        <TopicGroupButton group={{ group_name: toGroup }} />
      </>
    )
  }
  if (cmd === '/color') {
    const [toColor, fromColor] = args.map(color => color.toLowerCase())
    return (
      <>
        <div className="thread-color rounded-full" data-color={fromColor}>
          {fromColor}
        </div>
        <span>→</span>
        <div className="thread-color rounded-full" data-color={toColor}>
          {toColor}
        </div>
      </>
    )
  }
  if (cmd == '/reflect') {
    return <div className="text-xs text-gray-500">{args.join(' ')}</div>
  }
  return null
}

const CopyButton = ({ thread }: { thread: ThreadData }) => {
  const [isCopied, setCopied] = useState(false)
  const handleCopy = () => {
    if (isCopied) {
      return
    }
    navigator.clipboard.writeText(`thread://${thread.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (thread.lead_thread_id) {
    return null
  }
  return (
    <span onClick={handleCopy} className="cursor-pointer font-medium">
      [{isCopied ? 'copied' : 'copy'}]
    </span>
  )
}
