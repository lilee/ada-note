'use server'

import { eq } from 'drizzle-orm'
import * as zfd from '~/lib/zod-form-data'
import { db, schema } from '../db'
import { mustAuth, splitN } from './util'
import { revalidatePath } from 'next/cache'

export const getUser = async () => {
  const session = await mustAuth()
  const db_ = db()
  const user = await db_.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, session.userId),
  })
  return user
}

export const saveUserPrompt = async (formData: FormData) => {
  const session = await mustAuth()
  const db_ = db()
  const user = await db_.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, session.userId),
  })
  if (!user) {
    throw new Error('user not found')
  }
  const form = zfd
    .formData({
      prompt_content: zfd.text(),
    })
    .parse(formData)
  const [name, content] = splitN(form.prompt_content, '\n', 1)
  if (!user.reflect_prompts) {
    user.reflect_prompts = {}
  }
  user.reflect_prompts[name] = content

  await db()
    .update(schema.users)
    .set({ reflect_prompts: user.reflect_prompts })
    .where(eq(schema.users.id, user.id))
    .execute()

  revalidatePath('/settings')
}
