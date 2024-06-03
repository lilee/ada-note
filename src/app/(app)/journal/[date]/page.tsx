import { getJournalThreads } from '~/actions/journal'
import { ThreadCardList } from '~/components/thread'
import { CreateForm } from './create-form'

export const runtime = 'edge'

type PageParams = {
  date: string
}
export default async function Page({ params }: { params: PageParams }) {
  const threads = await getJournalThreads(params.date)
  return (
    <>
      <CreateForm date={params.date} />
      <ThreadCardList threads={threads} />
    </>
  )
}
