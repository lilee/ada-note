import { formatInTimeZone } from 'date-fns-tz'

export default function ThreadTime({
  time,
  format,
  className,
}: {
  time: Date
  format: string
  className?: string
}) {
  const timeString = time.toLocaleString('zh-CN', { timeZone: 'PRC' })
  return (
    <time className={className} dateTime={timeString} suppressHydrationWarning>
      {formatInTimeZone(time, 'PRC', format)}
    </time>
  )
}
