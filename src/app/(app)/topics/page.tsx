import { TopicCardList } from '~/components/topic/topic-card-list'
import { getTopics } from '~/actions/topic'

export const runtime = 'edge'

const Page = async () => {
  const topics = await getTopics()
  return <TopicCardList topics={topics} />
}

export default Page
