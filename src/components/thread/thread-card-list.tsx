import type { ThreadData } from '~/types'
import { ThreadCard } from './thread-card'

export const ThreadCardList = ({ threads }: { threads: ThreadData[] }) => {
  return (
    <div className="stack-xl">
      {threads.map(thread => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  )
}
