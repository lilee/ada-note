'use client'

import { Pin as PinIcon, Settings as SettingsIcon } from 'lucide-react'
import { MouseEvent, startTransition, useState } from 'react'
import { updateTopic } from '~/actions/topic'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { refreshAction } from '~/lib/client-utils'
import { TopicData } from '~/types'

export const TopicSettings = ({ topic }: { topic: TopicData }) => {
  const [open, setOpen] = useState(false)
  const handlePin = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('pin', topic.pin ? 'off' : 'on')
      await updateTopic(topic.id, formData)
      setOpen(false)
      refreshAction('pin-topics')
    })
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost">
          <SettingsIcon className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center justify-between" onClick={handlePin}>
          <PinIcon className="h-4 w-4" />
          <span>{topic.pin ? 'Unpin' : 'Pin'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
