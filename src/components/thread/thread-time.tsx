import { formatInTimeZone } from 'date-fns-tz'

export default function ThreadTime({ time, format }: { time: Date; format: string }) {
  const timeString = time.toLocaleString('zh-CN', { timeZone: 'PRC' })
  return (
    <time dateTime={timeString} suppressHydrationWarning>
      {formatInTimeZone(time, 'PRC', format)}
    </time>
  )
}
