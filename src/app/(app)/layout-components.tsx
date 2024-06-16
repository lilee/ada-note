'use client'

import {
  BotMessageSquare as AskIcon,
  Calendar as JournalIcon,
  Bookmark as PinIcon,
  Plus,
  ListTodo as TaskIcon,
  UserRoundCog as UserIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { getTopics } from '~/actions/topic'
import { TopicCreateForm } from '~/components/topic'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { useFetchAction } from '~/lib/client-utils'

const mainMenuItems = [
  { href: '/journal', label: 'Journal', Icon: JournalIcon },
  { href: '/tasks', label: 'Tasks', Icon: TaskIcon },
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
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const TopicsMenu = () => {
  const path = usePathname()
  const { data: topics, refetch } = useFetchAction(getTopics)
  return (
    <nav className="main-menu">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs text-gray-500">Topics</h2>
        <TopicCreateButton onSuccess={refetch} />
      </div>
      {topics?.map(t => (
        <Link
          key={`topic-${t.id}`}
          href={`/topics/${t.id}`}
          className="main-menu-item"
          data-active={path === `/topics/${t.id}`}
        >
          <div className="main-menu-item-left">
            <PinIcon className="w-4 h-4" />
          </div>
          <span className="text-xs">{t.topic_name}</span>
        </Link>
      ))}
    </nav>
  )
}

const TopicCreateButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px]">
        <TopicCreateForm
          onSuccess={() => {
            onSuccess?.()
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
