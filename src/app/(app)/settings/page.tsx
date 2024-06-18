import { getUser } from '~/actions/user'
import { UserPrompt } from '~/components/user/user-prompt'
import { PromptForm } from './prompt-form'

export const runtime = 'edge'
export default async function Page() {
  const user = await getUser()
  return (
    <div className="flex flex-col gap-2">
      <PromptForm />
      {Object.entries(user?.reflect_prompts ?? {}).map(([name, content]) => (
        <UserPrompt key={name} prompt={{ name, content }} />
      ))}
    </div>
  )
}
