'use client'
import { ThreadGroup, TopicData } from '~/types'
import { TopicGroupButton } from './topic-group-button'
import { TopicGroupConfig } from './topic-group-config'

export const TopicGroupSelect = ({
  groups,
  groupConfig,
}: {
  groups: ThreadGroup[]
  groupConfig: TopicData['group_config']
}) => {
  return (
    <div className="flex gap-2">
      <TopicGroupButton group={null} menu />
      {groups.map(group => (
        <TopicGroupButton key={group.group_name} group={group} menu />
      ))}
      <TopicGroupConfig groupConfig={groupConfig} />
    </div>
  )
}
