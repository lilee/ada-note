'use client'
import { parse as dateParse } from 'date-fns'
import { formatDate } from 'date-fns/format'

import { CalendarDays } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { MouseEvent, useState } from 'react'
import { ActiveModifiers } from 'react-day-picker'
import { Button } from '~/components/ui/button'
import { Calendar, CalendarProps } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { WeekdaySelect } from './weekday-select'

type PageParams = {
  date?: string
}
export const Header = () => {
  const router = useRouter()
  const { date } = useParams<PageParams>()
  if (!date) {
    return null
  }
  const handleDayClick = (d: Date) => {
    router.push(`/journal/${formatDate(d, 'yyyyMMdd')}`)
  }
  const currentDate = dateParse(date, 'yyyyMMdd', new Date())
  return (
    <header className="header">
      <div className="hidden md:block">
        <div className="flex items-baseline gap-2 w-[220px]">
          <h2 className="text-lg">{formatDate(currentDate, 'MMM d, yyyy')}</h2>
          <span className="text-red-500 text-sm">{formatDate(currentDate, 'EEEE')}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-4">
        <div className="flex-1">
          <WeekdaySelect selected={currentDate} onChange={handleDayClick} />
        </div>
        <DatePicker onDayClick={handleDayClick} selected={currentDate} />
        <Button
          size="sm"
          variant="outline"
          className="px-2"
          onClick={() => handleDayClick(new Date())}
        >
          Today
        </Button>
      </div>
    </header>
  )
}

const DatePicker = (props: CalendarProps) => {
  const [open, setOpen] = useState(false)
  const { onDayClick, ...otherProps } = props
  const handleDayClick = (d: Date, activeModifiers: ActiveModifiers, e: MouseEvent) => {
    onDayClick?.(d, activeModifiers, e)
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <CalendarDays className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar className="mt-2" weekStartsOn={1} onDayClick={handleDayClick} {...otherProps} />
      </PopoverContent>
    </Popover>
  )
}
