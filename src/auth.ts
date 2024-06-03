import NextAuth, { User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { ZodError, object, string } from 'zod'
import { db } from './db'
import { authConfig } from './auth.config'

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials)
          const user = await getUser(email)
          if (!user) {
            throw new Error('User not found.')
          }
          const passwordHashBuffer = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(password)
          )
          // to hex
          const passwordHash = Buffer.from(passwordHashBuffer).toString('hex')
          const passwordsMatch = user.password === passwordHash
          if (!passwordsMatch) {
            throw new Error('Incorrect password.')
          }

          const authUser: User = {
            userId: user.id,
            email: user.email,
            name: user.username,
            role: user.role,
          }
          return authUser
        } catch (error) {
          if (error instanceof ZodError) {
            return null
          }
          throw error
        }
      },
    }),
  ],
})

const getUser = async (email: string) => {
  return await db().query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  })
}

export const signInSchema = object({
  email: string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(6, 'Password must be more than 6 characters')
    .max(18, 'Password must be less than 18 characters'),
})
