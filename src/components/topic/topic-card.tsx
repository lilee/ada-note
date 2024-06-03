import { TopicData } from '~/types'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'
import { TopicSettings } from './topic-settings'

export const TopicCard = ({ topic }: { topic: TopicData }) => {
  return (
    <Link href={`/topics/${topic.id}`}>
      <Card className="h-[160px] cursor-pointer bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{topic.topic_name}</span>
            <TopicSettings topic={topic} />
          </CardTitle>
          <CardDescription>{topic.topic_desc ?? 'No description'}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
