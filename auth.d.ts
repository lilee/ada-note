import 'next-auth'

declare module 'next-auth' {
  interface User {
    userId: string
    name?: string
    email: string
    role: 'admin' | 'user'
  }
}
