import { getTopicThreads } from '~/actions/topic'
import { ThreadCardList } from '~/components/thread'
import { TopicGroupSelect } from '~/components/topic'
import { CreateForm } from './create-form'

export const runtime = 'edge'

type PageParams = {
  id: string
}
type SearchParams = {
  group?: string
}
const Page = async ({
  params,
  searchParams,
}: {
  params: PageParams
  searchParams: SearchParams
}) => {
  const { id: topic_id } = params
  const { group } = searchParams
  const { topic, thread_groups, threads } = await getTopicThreads(topic_id, { groupName: group })

  return (
    <div className="sm:w-full md:w-[768px] mx-auto flex flex-col gap-4 lg:gap-6">
      <CreateForm topicId={topic.id} />
      <TopicGroupSelect groups={thread_groups} groupConfig={topic.group_config} />
      <ThreadCardList threads={threads} />
    </div>
  )
}

export default Page
