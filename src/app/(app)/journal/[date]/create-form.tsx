'use client'

import { ThreadForm } from '~/components/thread'
import { createJournalThread } from '~/actions/journal'

export const CreateForm = ({ date }: { date: string }) => {
  const createJournalThread_ = async (action: string, formData: FormData) => {
    await createJournalThread(date, formData)
  }
  return <ThreadForm onSubmit={createJournalThread_} />
}
