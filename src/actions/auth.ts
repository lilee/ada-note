'use server'

import { z } from 'zod'
import { signIn } from '~/auth'
import * as zfd from '~/lib/zod-form-data'
import { db, schema } from '../db'
import { revalidatePath } from 'next/cache'

export const login = async (formData: FormData) => {
  const { email, password } = zfd
    .formData({
      email: zfd.text(z.string().email()),
      password: zfd.text(),
    })
    .parse(formData)
  return signIn('credentials', { email, password, redirectTo: '/journal' })
}

export const signUp = async (formData: FormData) => {
  const { email, password } = zfd
    .formData({
      email: zfd.text(z.string().email()),
      password: zfd.text(),
    })
    .parse(formData)
  const db_ = db()
  const passwordHashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password)
  )
  // to hex
  const passwordHash = Buffer.from(passwordHashBuffer).toString('hex')

  await db_.insert(schema.users).values({
    email,
    password: passwordHash,
  })
  revalidatePath('/auth/signup')
}
