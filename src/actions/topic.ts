'use server'

import { db, schema } from '~/db'
import { mustAuth, parseThreadContent } from './util'
import { TopicCreate, TopicUpdate } from '../types'
import { formData as zFormData, text } from '../lib/zod-form-data'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export const getTopics = async () => {
  const user = await mustAuth()
  const topics = await db().query.topics.findMany({
    where: (table, { and, eq, isNull }) =>
      and(eq(table.user_id, user.userId), isNull(table.builtin_topic_name)),
    orderBy: (table, { desc }) => [desc(table.updated_at)],
  })
  return topics
}
export const getPinTopics = async () => {
  const topics = await db().query.topics.findMany({
    where: (table, { eq }) => {
      return eq(table.pin, true)
    },
    columns: {
      id: true,
      topic_name: true,
    },
    orderBy: (table, { desc }) => [desc(table.updated_at)],
  })
  return topics
}

export const getTopic = async (topicId: string) => {
  const user = await mustAuth()
  const topic = await db().query.topics.findFirst({
    where: (table, { eq }) => and(eq(table.id, topicId), eq(table.user_id, user.userId)),
  })
  return topic
}

export const createTopic = async (formData: FormData) => {
  const user = await mustAuth()
  const form = zFormData({
    topic_content: text(),
  }).parse(formData)

  const [topic_name, ...topic_desc_parts] = form.topic_content.split('\n')
  const topic_desc = topic_desc_parts.join('\n')
  const values: TopicCreate = {
    topic_name,
    topic_desc,
    user_id: user.userId,
  }
  const topic = await db().insert(schema.topics).values(values).returning()
  revalidatePath('/topics')
  return topic
}

export const updateTopic = async (topicId: string, formData: FormData) => {
  const user = await mustAuth()
  const form = zFormData({
    topic_content: text(z.string().optional()),
    pin: text(z.enum(['on', 'off']).optional()),
  }).parse(formData)
  const values: TopicUpdate = {}
  if (form.pin !== undefined) {
    values.pin = form.pin === 'on'
  }
  if (form.topic_content) {
    const [topic_name, ...topic_desc_parts] = form.topic_content.split('\n')
    const topic_desc = topic_desc_parts.join('\n')
    values.topic_name = topic_name
    values.topic_desc = topic_desc
  }
  const topic = await db()
    .update(schema.topics)
    .set(values)
    .where(and(eq(schema.topics.id, topicId), eq(schema.topics.user_id, user.userId)))
    .returning()
  return topic
}

export const createTopicThread = async (topicId: string, formData: FormData) => {
  const user = await mustAuth()
  const form = zFormData({
    thread_content: text(),
  }).parse(formData)

  const { thread_content, group_name } = parseThreadContent(form.thread_content)
  if (!thread_content) {
    throw new Error('thread content is required')
  }

  const thread = await db()
    .insert(schema.threads)
    .values({
      topic_id: topicId,
      group_name,
      thread_content: thread_content,
      user_id: user.userId,
    })
    .returning()

  revalidatePath(`/topics/${topicId}`)
  return thread
}

export const getTopicThreads = async (topicId: string, { groupName }: { groupName?: string }) => {
  const user = await mustAuth()
  const result = await db().query.threads.findMany({
    with: {
      follows: {
        limit: 10,
      },
    },
    where: (table, { and, eq, isNull }) =>
      and(
        isNull(table.lead_thread_id),
        eq(table.topic_id, topicId),
        eq(table.user_id, user.userId),
        groupName ? eq(table.group_name, groupName) : undefined
      ),
    orderBy: (table, { desc }) => [desc(table.created_at)],
  })
  return result
}

export const getTopicThreadGroups = async (topicId: string): Promise<string[]> => {
  const result = await db()
    .selectDistinct({
      group_name: schema.threads.group_name,
    })
    .from(schema.threads)
    .where(eq(schema.threads.topic_id, topicId))
  return result.filter(r => r.group_name).map(r => r.group_name!)
}
