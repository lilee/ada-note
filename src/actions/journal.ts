'use server'

import { db, schema } from '~/db'
import { mustAuth, parseThreadContent } from './util'
import { revalidatePath } from 'next/cache'
import { ThreadColor } from '../types'
import { createThread, threadFormSchema } from './_base'

export const getJournalThreads = async (date: string) => {
  const user = await mustAuth()
  const db_ = db()
  const builtin_topic_name = `journal_${date}`
  const topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.builtin_topic_name, builtin_topic_name), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    return []
  }

  const threads = await db_.query.threads.findMany({
    with: {
      refers: true,
      reverts: true,
      images: true,
      follows: {
        limit: 30,
        with: {
          refers: true,
          images: true,
        },
      },
    },
    where: (table, { and, eq, isNull }) =>
      and(
        isNull(table.lead_thread_id),
        eq(table.topic_id, topic.id),
        eq(table.user_id, user.userId)
      ),
    orderBy: (table, { desc }) => [desc(table.created_at)],
    limit: 50,
  })
  return threads
}

export const createJournalThread = async (date: string, formData: FormData) => {
  const user = await mustAuth()
  const db_ = db()
  const topic_name = `Journal ${date}`
  const builtin_topic_name = `journal_${date}`

  let topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.builtin_topic_name, builtin_topic_name), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    topic = await db_
      .insert(schema.topics)
      .values({
        topic_name,
        builtin_topic_name,
        user_id: user.userId,
      })
      .returning()
      .get()
  }
  const form = threadFormSchema.parse(formData)
  const { group_name: color, thread_content } = parseThreadContent(form.thread_content, 'lead')
  const thread = await createThread(user.userId, {
    topic_id: topic.id,
    color: color as ThreadColor,
    thread_content,
    refer_thread_ids: form.refer_thread_ids,
    image_ids: form.image_ids,
  })
  revalidatePath(`/journal/${date}`)
  return thread
}
