'use client'

import { Settings } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { TopicData } from '~/types'
import { Input } from '../ui/input'
import { useState, useTransition } from 'react'
import { updateTopic } from '~/actions/topic'
import { useParams } from 'next/navigation'

export const TopicGroupConfig = ({ groupConfig }: { groupConfig: TopicData['group_config'] }) => {
  const [open, setOpen] = useState(false)
  const params = useParams<{ id: string }>()
  const [pending, startTransition] = useTransition()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const groupFormData = new FormData()
      Array.from(formData.entries()).forEach(([group_name, seq]) => {
        groupFormData.append('group_config', `${group_name}##${seq}`)
      })
      await updateTopic(params.id, groupFormData)
      setOpen(false)
    })
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="rounded-full" size="icon-sm">
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Groups Config</SheetTitle>
        </SheetHeader>
        <form className="flex flex-col gap-2 my-4" onSubmit={handleSubmit} aria-disabled={pending}>
          {Object.entries(groupConfig!).map(([group_name, config]) => (
            <div key={group_name} className="flex justify-between items-center text-sm">
              <span className="flex-1">{group_name}</span>
              <div className="flex gap-2">
                <Input name={group_name} defaultValue={config.seq} className="w-24 h-7" />
              </div>
            </div>
          ))}
          <SheetFooter>
            <Button type="submit" className="h-8">
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
