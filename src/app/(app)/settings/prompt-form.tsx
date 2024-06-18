'use client'

import { saveUserPrompt } from '~/actions/user'
import { UserPromptForm } from '~/components/user/user-prompt-form'

export const PromptForm = () => {
  return <UserPromptForm onSubmit={saveUserPrompt} />
}
