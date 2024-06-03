'use client'

import { formatDate } from 'date-fns/format'
import { useRouter } from 'next/navigation'

export const runtime = 'edge'

export default function Page() {
  const router = useRouter()
  const date = formatDate(new Date(), 'yyyyMMdd')
  router.replace(`/journal/${date}`)
}
