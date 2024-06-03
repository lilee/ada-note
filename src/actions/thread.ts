'use server'

import { and, eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { mustAuth, parseThreadContent } from './util'
import * as zfd from '~/lib/zod-form-data'
import { revalidatePath } from 'next/cache'

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
    const { thread_content, group_name } = parseThreadContent(form.thread_content)
    updateData.thread_content = thread_content
    updateData.group_name = group_name
  }
  await db_
    .update(schema.threads)
    .set(updateData)
    .where(and(eq(schema.threads.id, threadId), eq(schema.threads.user_id, user.userId)))

  revalidatePath(`/topics/${thread.topic_id}`)
}

export const deleteThread = async (threadId: string) => {}

export const addFollowThread = async (threadId: string, formData: FormData) => {
  const db_ = db()
  const user = await mustAuth()
  const form = zfd
    .formData({
      thread_content: zfd.text(),
    })
    .parse(formData)

  const thread = await db_.query.threads.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, user.userId)),
  })
  if (!thread) {
    throw new Error('Thread not found.')
  }
  const topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, thread.topic_id), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    throw new Error('Topic not found.')
  }

  await db_.insert(schema.threads).values({
    lead_thread_id: thread.id,
    topic_id: thread.topic_id,
    thread_content: form.thread_content,
    user_id: user.userId,
  })

  if (topic.builtin_topic_name?.startsWith('journal_')) {
    const [, date] = topic.builtin_topic_name.split('_')
    revalidatePath(`/journal/${date}`)
  } else {
    revalidatePath(`/topics/${topic.id}`)
  }
}
