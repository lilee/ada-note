import { getColorThreads } from '~/actions/color'
import { ThreadCardList } from '~/components/thread'

export const runtime = 'edge'

export default async function Page() {
  const threads = await getColorThreads('task')
  return <ThreadCardList threads={threads} />
}
