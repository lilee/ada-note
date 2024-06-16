import Link from 'next/link'
import { db } from '../../../db'
import { SignUpForm } from './form'

export const runtime = 'edge'

async function hasUsers() {
  'use server'

  const users = await db().query.users.findMany()
  if (users.length > 0) {
    return true
  }
  return false
}

async function Page() {
  const hasUsers_ = await hasUsers()
  if (hasUsers_) {
    return (
      <main className="w-full lg:w-[768px] mx-auto justify-center px-6 py-12 lg:py-24">
        <h2 className="text-lg font-medium">You already have an account</h2>
        <div>
          Click{' '}
          <Link href="/auth/signin" className="text-blue-500">
            here
          </Link>{' '}
          to sign in
        </div>
      </main>
    )
  }
  return (
    <main className="w-full lg:w-[768px] mx-auto flex justify-center px-6 py-12 lg:py-24">
      <SignUpForm />
    </main>
  )
}

export default Page
