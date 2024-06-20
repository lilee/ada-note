import { and, asc, eq } from 'drizzle-orm'
import { auth } from '~/auth'
import { db, schema } from '~/db'
import { TopicData } from '../types'

export const mustAuth = async () => {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('User not authenticated.')
  }
  return session.user
}

export const checkOwner = async (
  table: typeof schema.threads | typeof schema.topics,
  id: string
) => {
  const session = await mustAuth()
  const db_ = db()
  const objects = await db_.select().from(table).where(eq(table.id, id))
  if (objects && objects.length > 0 && objects[0].user_id !== session.userId) {
    throw new Error('Unauthorized')
  }
  return objects[0]
}

export const splitN = (str: string, sep: string, n: number) => {
  const parts: string[] = []
  let index = str.indexOf(sep)
  if (index === -1) {
    parts.push(str.trim())
    return parts
  }
  for (let i = 0; i < n; i++) {
    parts.push(str.slice(0, index).trim())
    str = str.slice(index + 1)
    index = str.indexOf(sep)
  }
  if (str) {
    parts.push(str.trim())
  }
  return parts
}

export const parseThreadContent = (
  text: string,
  mode: 'lead' | 'follow'
): {
  group_name?: string
  command?: string
  thread_content: string
} => {
  const [firstLine, restContent = ''] = splitN(text, '\n', 1)
  let thread_content = text
  if (mode === 'lead') {
    const group_name = extractGroupName(firstLine)
    if (group_name) {
      thread_content = restContent.trim()
    }
    return { group_name, thread_content }
  } else {
    const command = extractCommand(firstLine)
    if (command) {
      thread_content = restContent.trim()
    }
    return { command, thread_content }
  }
}

export const splitThreadContent = (text: string): [string, string | null] => {
  const threshold = 280
  if (text.length < threshold) {
    return [text, null]
  }
  return [text.substring(0, threshold), text]
}

const extractGroupName = (input: string) => {
  const regex = /^#(.*?)#$|^\[(.*?)\]$/
  const matches = input.match(regex)

  if (matches) {
    // matches[1] 是 ## 包围的字符串
    // matches[2] 是 [] 包围的字符串
    if (matches[1]) {
      return matches[1]
    } else if (matches[2]) {
      return matches[2]
    }
  }
  return undefined
}

const extractCommand = (input: string) => {
  const [command] = input.split(' ')
  if (!COMMAND_DEFINE.has(command)) {
    return undefined
  }
  return input
}

const COMMAND_DEFINE = new Set(['/reflect', '/group', '/color', '/archive', '/pin'])

export const revalidateTopicGroup = async (topic_: TopicData | string) => {
  let topic: TopicData | undefined
  if (typeof topic_ === 'string') {
    topic = await db().query.topics.findFirst({ where: eq(schema.topics.id, topic_) })
  } else {
    topic = topic_
  }
  if (!topic) {
    return
  }
  topic.group_config = topic.group_config || {}
  const groups = await getTopicGroups(topic.id)
  const groupSet = new Set(groups)
  Object.keys(topic.group_config).forEach(group_name => {
    if (!groupSet.has(group_name)) {
      delete topic.group_config![group_name]
    }
  })
  Array.from(groupSet).forEach(group_name => {
    if (!topic.group_config![group_name]) {
      topic.group_config![group_name] = {}
    }
  })
  const updates = await db()
    .update(schema.topics)
    .set({ group_config: topic.group_config })
    .where(eq(schema.topics.id, topic.id))
    .returning()
  return updates[0]
}

export const getTopicGroups = async (topicId: string) => {
  const result = await db()
    .selectDistinct({
      group_name: schema.threads.group_name,
    })
    .from(schema.threads)
    .where(and(eq(schema.threads.topic_id, topicId), eq(schema.threads.is_archived, false)))
    .orderBy(asc(schema.threads.group_name))
  const groups = result.filter(r => r.group_name).map(r => r.group_name!.split('/')[0])
  return groups
}
