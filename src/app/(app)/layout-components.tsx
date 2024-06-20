'use client'

import {
  BotMessageSquare as AskIcon,
  ChevronDown,
  Calendar as JournalIcon,
  Pencil,
  BookType as TopicIcon,
  Plus,
  ListTodo as TaskIcon,
  Highlighter as HighlightIcon,
  UserRoundCog as UserIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createTopic, getTopics, updateTopic } from '~/actions/topic'
import { TopicForm } from '~/components/topic/topic-form'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { refreshAction, useFetchAction } from '~/lib/client-utils'
import { TopicData } from '~/types'
import { cn } from '../../lib/utils'

const mainMenuItems = [
  { href: '/journal', label: 'Journal', Icon: JournalIcon },
  { href: '/tasks', label: 'Tasks', Icon: TaskIcon },
  { href: '/highlights', label: 'Highlights', Icon: HighlightIcon },
  { href: '/ask', label: 'Ask', Icon: AskIcon },
]
export const MainMenu = () => {
  const path = usePathname()
  return (
    <nav className="main-menu">
      {mainMenuItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="main-menu-item"
          data-active={path.startsWith(item.href)}
        >
          <div className="main-menu-item-left">{<item.Icon className="w-5 h-5" />}</div>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export const MainMenuFooter = () => {
  const path = usePathname()
  return (
    <div className="main-menu-footer">
      {mainMenuItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="main-menu-item justify-center rounded-none"
          data-active={path.startsWith(item.href)}
        >
          <item.Icon className="w-6 h-6" />
        </Link>
      ))}
    </div>
  )
}

export const UserMenu = () => {
  const router = useRouter()
  const goto = (path: string) => router.push(path)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
          <UserIcon className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => goto('/settings')}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const TopicsMenu = () => {
  const [group, setGroup] = useState('All')
  const { data: topics, refetch } = useFetchAction(getTopics, {
    cacheKey: 'topics',
  })
  const groupSet = new Set<string>(topics?.map(t => t.group_name?.trim()!).filter(Boolean))
  const groups = Array.from(groupSet)

  useEffect(() => {
    setGroup(localStorage.getItem('topic-group') ?? 'All')
  }, [])

  const handleGroupChange = (value: string) => {
    localStorage.setItem('topic-group', value)
    setGroup(value)
  }

  return (
    <nav className="main-menu">
      <div className="flex items-center justify-between gap-2">
        <TopicGroups groups={groups} value={group} onChange={handleGroupChange} />
        <TopicCreateButton onSuccess={refetch} />
      </div>
      {topics
        ?.filter(t => group === 'All' || t.group_name?.trim() === group.trim())
        .map(t => (
          <TopicItem key={t.id} topic={t} />
        ))}
    </nav>
  )
}

const TopicGroups = ({
  groups,
  value,
  onChange,
}: {
  groups: string[]
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <h2 className="text-xs text-gray-500 flex items-center gap-1">
          <span>Topics: {value}</span>
          <ChevronDown className="w-3 h-3" />
        </h2>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="All">
            <span className="text-xs font-medium">All</span>
          </DropdownMenuRadioItem>
          {groups.map(group => (
            <DropdownMenuRadioItem key={group} value={group}>
              <span className="text-xs font-medium">{group}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const TopicCreateButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Plus className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px]">
        <TopicForm
          onSubmit={async formData => {
            await createTopic(formData)
            onSuccess?.()
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

const TopicItem = ({ topic }: { topic: TopicData }) => {
  const path = usePathname()
  const [hover, setHover] = useState(false)
  return (
    <Link
      href={`/topics/${topic.id}`}
      className="main-menu-item"
      data-active={path.startsWith(`/topics/${topic.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex gap-1 items-center">
        <TopicIcon className="w-4 h-4" />
        <span className="text-xs">{topic.topic_name}</span>
      </div>
      <div
        className={cn({
          invisible: !hover,
        })}
      >
        <TopicEditButton topic={topic} onSuccess={() => refreshAction('topics')} />
      </div>
    </Link>
  )
}

const TopicEditButton = ({ topic, onSuccess }: { topic: TopicData; onSuccess?: () => void }) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Pencil className="w-3 h-3 text-gray-400" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px]">
        <TopicForm
          topic={topic}
          onSubmit={async formData => {
            await updateTopic(topic.id, formData)
            onSuccess?.()
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
