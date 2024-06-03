'use server'

import { z } from 'zod'
import { signIn } from '~/auth'
import * as zfd from '~/lib/zod-form-data'

export const login = async (formData: FormData) => {
  const { email, password } = zfd
    .formData({
      email: zfd.text(z.string().email()),
      password: zfd.text(),
    })
    .parse(formData)
  return signIn('credentials', { email, password, redirectTo: '/journal' })
}
