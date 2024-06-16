'use server'

import { and, eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { mustAuth, parseThreadContent, revalidateTopicGroup } from './util'
import * as zfd from '~/lib/zod-form-data'
import { revalidatePath } from 'next/cache'
import { ThreadData, TopicData } from '../types'
import { redirect } from 'next/navigation'

export const updateThread = async (threadId: string, formData: FormData) => {
  const db_ = db()
  const user = await mustAuth()
  const thread = await db_.query.threads.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, user.userId)),
  })
  if (!thread) {
    throw new Error('thread not found')
  }

  const form = zfd
    .formData({
      thread_content: zfd.text(),
    })
    .parse(formData)
  const updateData: { thread_content: string; group_name?: string } = {
    thread_content: form.thread_content,
  }
  if (!thread.lead_thread_id) {
    const { thread_content, group_name } = parseThreadContent(form.thread_content, 'lead')
    updateData.thread_content = thread_content
    updateData.group_name = group_name
  }
  await db_
    .update(schema.threads)
    .set(updateData)
    .where(and(eq(schema.threads.id, threadId), eq(schema.threads.user_id, user.userId)))

  revalidateTopicGroup(thread.topic_id)
  await revalidate(thread)
}

export const deleteThread = async (threadId: string) => {
  const db_ = db()
  const user = await mustAuth()
  const thread = await db_
    .delete(schema.threads)
    .where(and(eq(schema.threads.id, threadId), eq(schema.threads.user_id, user.userId)))
    .returning()

  if (thread.length === 0) {
    return
  }
  await revalidate(thread[0])
}

export const addFollowThread = async (threadId: string, formData: FormData) => {
  const db_ = db()
  const user = await mustAuth()
  const form = zfd
    .formData({
      thread_content: zfd.text(),
    })
    .parse(formData)

  const leadThread = await db_.query.threads.findFirst({
    with: {
      topic: true,
    },
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, user.userId)),
  })
  if (!leadThread) {
    throw new Error('Thread not found.')
  }
  const old_group_name = leadThread.group_name

  let { thread_content, command } = parseThreadContent(form.thread_content, 'follow')
  if (command) {
    command = await executeCommand(command, leadThread)
  }

  await db_
    .insert(schema.threads)
    .values({
      lead_thread_id: leadThread.id,
      topic_id: leadThread.topic_id,
      command,
      thread_content,
      user_id: user.userId,
    })
    .returning()

  await revalidate(leadThread)

  if (leadThread.group_name !== old_group_name) {
    const searchParams = new URLSearchParams()
    if (leadThread.group_name) {
      searchParams.set('group', leadThread.group_name)
    } else {
      searchParams.delete('group')
    }
    redirect(`/topics/${leadThread.topic_id}?${searchParams.toString()}`)
  }
}

const revalidate = async (thread: ThreadData) => {
  const db_ = db()
  const topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, thread.topic_id)),
  })
  if (!topic) {
    throw new Error('Topic not found.')
  }

  if (topic.builtin_topic_name?.startsWith('journal_')) {
    const [, date] = topic.builtin_topic_name.split('_')
    revalidatePath(`/journal/${date}`)
  } else {
    revalidatePath(`/topics/${topic.id}`)
  }
}

const executeCommand = async (command: string, thread: ThreadData & { topic: TopicData }) => {
  const [cmd, ...args] = command.split(' ')
  const updateValues: Record<string, any> = {}

  switch (cmd) {
    case '/group':
      let [group_name = null] = args
      if (group_name === undefined) {
        throw new Error('group name is required')
      }
      if (group_name === thread.group_name) {
        throw new Error('group name not change')
      }
      if (group_name === 'NONE') {
        group_name = null
      }
      if (thread.group_name) {
        args.push(thread.group_name)
      }
      thread.group_name = group_name
      updateValues.group_name = group_name
      break
    default:
      throw new Error('command not implemented')
  }
  await db()
    .update(schema.threads)
    .set(updateValues)
    .where(eq(schema.threads.id, thread.id))
    .returning()

  if (updateValues.group_name) {
    revalidateTopicGroup(thread.topic)
  }
  return [cmd, ...args].join(' ')
}
