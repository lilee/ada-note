'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db, schema } from '../db'
import { ThreadColor, ThreadData, ThreadUpdate, TopicData } from '../types'
import { mustAuth, parseThreadContent, revalidateTopicGroup, splitThreadContent } from './util'
import { createThread, threadFormSchema, updateThread as updateThread_ } from './_base'

export const getThread = async (threadId: string) => {
  const db_ = db()
  const user = await mustAuth()
  const thread = await db_.query.threads.findFirst({
    with: {
      topic: true,
      follows: {
        limit: 30,
        with: {
          refers: true,
        },
      },
      refers: true,
      reverts: true,
    },
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, user.userId)),
  })
  return thread
}

export const updateThread = async (threadId: string, formData: FormData) => {
  const db_ = db()
  const user = await mustAuth()
  const thread = await db_.query.threads.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, user.userId)),
  })
  if (!thread) {
    throw new Error('thread not found')
  }

  const form = threadFormSchema.parse(formData)
  let thread_content = form.thread_content
  let group_name: string | undefined = undefined
  if (!thread.lead_thread_id) {
    const x = parseThreadContent(form.thread_content, 'lead')
    thread_content = x.thread_content
    group_name = x.group_name
  }
  await updateThread_(user.userId, threadId, {
    thread_content,
    group_name,
    refer_thread_ids: form.refer_thread_ids,
  })
  await revalidateTopicGroup(thread.topic_id)
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
  const form = threadFormSchema.parse(formData)
  const leadThread = await db_.query.threads.findFirst({
    with: { topic: true },
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

  await createThread(user.userId, {
    topic_id: leadThread.topic_id,
    lead_thread_id: leadThread.id,
    command,
    thread_content,
    refer_thread_ids: form.refer_thread_ids,
  })

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

export const reflectThread = async (threadId: string, prompt: string) => {
  const db_ = db()
  const session = await mustAuth()
  const thread = await db_.query.threads.findFirst({
    with: {
      follows: true,
    },
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, session.userId)),
  })
  if (!thread) {
    throw new Error('thread not found')
  }

  const user = await db_.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, session.userId),
  })

  const prompt_content = user?.reflect_prompts?.[prompt] ?? prompt

  const messages: CoreMessage[] = []
  messages.push({
    role: 'system',
    content: prompt_content,
  })
  messages.push({
    role: 'user',
    content: thread.thread_content,
  })
  thread.follows.forEach(f => {
    messages.push({
      role: 'user',
      content: f.thread_content,
    })
  })

  const openai = createOpenAI({
    baseURL: process.env.OPENAI_API_BASE,
  })

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    onFinish: async e => {
      await createThread(session.userId, {
        topic_id: thread.topic_id,
        lead_thread_id: thread.id,
        command: `/reflect ${prompt}`,
        thread_content: e.text,
      })
    },
  })

  const stream = createStreamableValue(result.textStream)
  return stream.value
}

export const revalidateThread = async (threadId: string) => {
  const user = await mustAuth()
  const db_ = db()
  const thread = await db_.query.threads.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, threadId), eq(table.user_id, user.userId)),
  })
  if (!thread) {
    throw new Error('thread not found')
  }
  await revalidate(thread)
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
  const updateValues: ThreadUpdate = {}

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
    case '/color':
      const [color] = args
      if (color === thread.color) {
        throw new Error('color not change')
      }
      args.push(thread.color)
      thread.color = color as ThreadColor
      updateValues.color = thread.color
      break
    case '/pin':
      const [value = 1] = args
      const pinValue = Number(value)
      if (isNaN(pinValue)) {
        throw new Error('pin value is not a number')
      }
      thread.pin_on_group = pinValue
      updateValues.pin_on_group = pinValue
      break
    case '/archive':
      if (thread.is_archived) {
        throw new Error('thread already archived')
      }
      thread.is_archived = true
      updateValues.is_archived = true
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
