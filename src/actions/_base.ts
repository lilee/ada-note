import { db, schema } from '~/db'
import * as zfd from '~/lib/zod-form-data'
import { ThreadColor, ThreadData, ThreadUpdate } from '~/types'
import { splitThreadContent } from './util'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export const threadFormSchema = zfd.formData({
  thread_content: zfd.text(z.string().default('')),
  refer_thread_ids: zfd.repeatableOfType(zfd.text()).optional(),
  image_ids: zfd.repeatableOfType(zfd.text()).optional(),
})

type CreateThreadData = {
  topic_id: string
  lead_thread_id?: string
  thread_content: string
  group_name?: string
  command?: string
  color?: ThreadColor
  refer_thread_ids?: string[]
  image_ids?: string[]
}

type UpdateThreadData = {
  thread_content: string
  group_name?: string
  refer_thread_ids?: string[]
  image_ids?: string[]
}

export const createThread = async (userId: string, data: CreateThreadData) => {
  const db_ = db()
  const [thread_content, thread_content_long] = splitThreadContent(data.thread_content)
  if (
    !thread_content &&
    !data.command &&
    (!data.refer_thread_ids || data.refer_thread_ids.length === 0)
  ) {
    throw new Error('thread content or refer thread ids is required')
  }
  const threads = await db_
    .insert(schema.threads)
    .values({
      topic_id: data.topic_id,
      lead_thread_id: data.lead_thread_id,
      group_name: data.group_name,
      thread_content,
      thread_content_long,
      color: data.color,
      command: data.command,
      user_id: userId,
    })
    .returning()
  const thread = threads[0]
  await updateThreadRefers(thread, data.refer_thread_ids)
  await updateThreadImages(thread, data.image_ids)
  return thread
}

export const updateThread = async (userId: string, threadId: string, data: UpdateThreadData) => {
  const db_ = db()
  const [thread_content, thread_content_long] = splitThreadContent(data.thread_content as string)

  if (!thread_content && (!data.refer_thread_ids || data.refer_thread_ids.length === 0)) {
    throw new Error('thread content or refer thread ids is required')
  }

  const updateData: ThreadUpdate = {
    thread_content,
    thread_content_long,
    group_name: data.group_name,
  }
  const threads = await db_
    .update(schema.threads)
    .set(updateData)
    .where(and(eq(schema.threads.id, threadId), eq(schema.threads.user_id, userId)))
    .returning()
  const thread = threads[0]
  await updateThreadRefers(thread, data.refer_thread_ids)
  await updateThreadImages(thread, data.image_ids)

  return thread
}

const updateThreadRefers = async (thread: ThreadData, refer_thread_ids?: string[]) => {
  const db_ = db()
  await db_
    .delete(schema.threadRefers)
    .where(
      and(
        eq(schema.threadRefers.thread_id, thread.id),
        eq(schema.threadRefers.user_id, thread.user_id!)
      )
    )
  const insertRefers = refer_thread_ids?.map(refer_thread_id => ({
    thread_id: thread.id,
    lead_thread_id: thread.lead_thread_id ?? thread.id,
    refer_thread_id,
    user_id: thread.user_id,
  }))
  if (insertRefers && insertRefers.length > 0) {
    await db_.insert(schema.threadRefers).values(insertRefers)
  }
}

const updateThreadImages = async (thread: ThreadData, image_ids?: string[]) => {
  const db_ = db()
  await db_
    .delete(schema.threadImages)
    .where(
      and(
        eq(schema.threadImages.thread_id, thread.id),
        eq(schema.threadImages.user_id, thread.user_id!)
      )
    )
  const inserts = image_ids?.map(image_id => ({
    thread_id: thread.id,
    image_id,
    user_id: thread.user_id,
  }))
  if (inserts && inserts.length > 0) {
    await db_.insert(schema.threadImages).values(inserts)
  }
}
