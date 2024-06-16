'use server'

import { db, schema } from '~/db'
import { mustAuth, parseThreadContent, revalidateTopicGroup } from './util'
import { ThreadGroup, TopicCreate, TopicData, TopicUpdate } from '../types'
import { formData as zFormData, text, repeatableOfType } from '../lib/zod-form-data'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
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

export const getTopic = async (topicId: string) => {
  const db_ = db()
  const user = await mustAuth()
  const topic = await db_.query.topics.findFirst({
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
    group_config: repeatableOfType(text()).optional(),
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
  if (form.group_config) {
    values.group_config = form.group_config.reduce((acc, group_seq) => {
      const [group_name, seq] = group_seq.split('##')
      acc[group_name] = { seq }
      return acc
    }, {} as Record<string, { seq?: string }>)
  }
  const topics = await db()
    .update(schema.topics)
    .set(values)
    .where(and(eq(schema.topics.id, topicId), eq(schema.topics.user_id, user.userId)))
    .returning()
  const topic = topics[0]
  await revalidatePath(`/topics/${topic.id}}`)
  return topic
}

export const createTopicThread = async (topicId: string, formData: FormData) => {
  const user = await mustAuth()
  const form = zFormData({
    thread_content: text(),
  }).parse(formData)

  const topic = await db().query.topics.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, topicId), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    throw new Error('topic not found')
  }

  const { thread_content, group_name, command } = parseThreadContent(form.thread_content, 'lead')

  if (command) {
    await executeTopicCommand(command, topic)
  } else {
    if (!thread_content) {
      throw new Error('thread content is required')
    }
    await db()
      .insert(schema.threads)
      .values({
        topic_id: topicId,
        group_name,
        thread_content: thread_content,
        user_id: user.userId,
      })
      .returning()
    if (group_name) {
      await revalidateTopicGroup(topic)
    }
  }
  revalidatePath(`/topics/${topicId}`)
}

export const getTopicThreads = async (topicId: string, { groupName }: { groupName?: string }) => {
  const db_ = db()
  const user = await mustAuth()
  const topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, topicId), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    throw new Error('topic not found')
  }

  const threads = await db().query.threads.findMany({
    with: {
      follows: {
        limit: 30,
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
    limit: 100,
  })

  const thread_groups_ = await db_
    .selectDistinct({ group_name: schema.threads.group_name })
    .from(schema.threads)
    .where(eq(schema.threads.topic_id, topicId))

  const group_config = topic.group_config || {}
  const thread_groups_set: Record<string, ThreadGroup> = {}
  thread_groups_.forEach(g => {
    if (!g.group_name) {
      return
    }
    const [group_name, child_group_name] = g.group_name.split('/')
    const config = group_config[group_name] ?? {}
    let group = thread_groups_set[group_name]
    if (!group) {
      group = {
        group_name,
        seq: config.seq ?? 'Z99',
        children: [],
      }
      thread_groups_set[group_name] = group
    }
    if (child_group_name) {
      group.children?.push(g.group_name)
    }
  })
  const thread_groups = Object.values(thread_groups_set).sort((a, b) =>
    a.seq!.localeCompare(b.seq!)
  )
  thread_groups.forEach(group => {
    group.children = group.children?.sort((a, b) => b.localeCompare(a))
  })
  return { topic, thread_groups, threads }
}

const executeTopicCommand = async (command: string, topic: TopicData) => {
  const [cmd, ...args] = command.split(' ')
  const updateValues: Partial<TopicData> = {}
  const db_ = db()
  switch (cmd) {
    case '/group':
      let [fromGroup, toGroup] = args
      if (fromGroup === undefined && toGroup === undefined) {
        throw new Error('group name is required')
      }
      if (!topic.group_config![toGroup] || topic.group_config![fromGroup]) {
        topic.group_config![toGroup] = topic.group_config![fromGroup]
      }
      delete topic.group_config![fromGroup]
      updateValues.group_config = topic.group_config
      await db_
        .update(schema.threads)
        .set({ group_name: toGroup })
        .where(and(eq(schema.threads.topic_id, topic.id), eq(schema.threads.group_name, fromGroup)))
      break
    default:
      throw new Error('command not implemented')
  }
  await db_
    .update(schema.topics)
    .set(updateValues)
    .where(eq(schema.topics.id, topic.id))
    .returning()
}
