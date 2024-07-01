'use client'

import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone'
import { useRouter } from 'next/navigation'

export const runtime = 'edge'

export default function Page() {
  const router = useRouter()
  const date = formatInTimeZone(new Date(), 'PRC', 'yyyyMMdd')
  router.replace(`/journal/${date}`)
}
