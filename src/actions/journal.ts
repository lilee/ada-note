'use server'

import { db, schema } from '~/db'
import { mustAuth } from './util'
import * as zfd from '~/lib/zod-form-data'
import { revalidatePath } from 'next/cache'

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
      follows: {
        limit: 10,
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
  const builtin_topic_name = `journal_${date}`

  let topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.builtin_topic_name, builtin_topic_name), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    topic = await db_
      .insert(schema.topics)
      .values({
        topic_name: builtin_topic_name,
        builtin_topic_name,
        user_id: user.userId,
      })
      .returning()
      .get()
  }
  const form = zfd
    .formData({
      thread_content: zfd.text(),
    })
    .parse(formData)
  const thread = await db_.insert(schema.threads).values({
    topic_id: topic.id,
    thread_content: form.thread_content,
    user_id: user.userId,
  })
  revalidatePath(`/journal/${date}`)
  return thread
}
