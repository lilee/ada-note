import { getThread } from '~/actions/thread'
import { useFetchAction } from '~/lib/client-utils'
import { parseThreadContent } from './util'
import { cn } from '~/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { ThreadCard } from './thread-card'
import ThreadTime from './thread-time'

export const ThreadRefer = ({ threadId, revert }: { threadId: string; revert?: boolean }) => {
  const { data } = useFetchAction(() => getThread(threadId), {
    cacheKey: `thread_${threadId}`,
  })
  const className = cn('flex gap-2 items-center text-sm text-green-600 cursor-pointer', {
    'text-rose-600': revert,
  })
  if (!data) {
    return <li className={className}>loading...</li>
  }
  const { thread_title } = parseThreadContent(data.thread_content)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <li className={className}>
          <ThreadTime
            className="text-gray-400 text-xs"
            time={data.created_at}
            format="MM/dd HH:mm"
          />
          <span>
            {revert ? '←' : '→'} {thread_title}
          </span>
        </li>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-none sm:w-full lg:w-[640px]">
        <SheetHeader>
          <SheetTitle>{data.topic.topic_name}</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <ThreadCard thread={data} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
