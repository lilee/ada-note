import { LoginForm } from './form'

export const runtime = 'edge'

function SignIn() {
  return (
    <main className="w-full lg:w-[768px] mx-auto flex justify-center px-6 py-12 lg:py-24">
      <LoginForm />
    </main>
  )
}

export default SignIn
