import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.userId = token.uid as string
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.userId
      }
      return token
    },
  },
} satisfies NextAuthConfig
