import { TopicData } from '../../types'
import { TopicCard } from './topic-card'

export const TopicCardList = ({ topics }: { topics: TopicData[] }) => {
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
      {topics.map(topic => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  )
}
