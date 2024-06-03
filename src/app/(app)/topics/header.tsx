'use client'

import { Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { getTopic } from '~/actions/topic'
import { TopicCreateForm } from '~/components/topic'
import { Button } from '~/components/ui/button'
import { InputSearch } from '~/components/ui/input-search'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { TopicData } from '~/types'

export const Header = () => {
  const params = useParams<{ id?: string }>()
  const [topic, setTopic] = useState<TopicData>()

  useEffect(() => {
    if (!params.id) {
      return
    }
    startTransition(async () => {
      const topic = await getTopic(params.id!)
      setTopic(topic)
    })
  }, [params.id])

  if (!params.id) {
    return (
      <div className="group w-full">
        <TopicCreateButton />
        <InputSearch placeholder="Find a topic" />
      </div>
    )
  }

  return <h2>{topic?.topic_name}</h2>
}

const TopicCreateButton = () => {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[480px]">
        <TopicCreateForm onSuccess={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
