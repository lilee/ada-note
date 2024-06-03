'use client'

import {
  BotMessageSquare as AskIcon,
  Calendar as JournalIcon,
  BookType as TopicsIcon,
  Bookmark as PinIcon,
  UserRoundCog as UserIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useFetchAction } from '~/lib/client-utils'
import { getPinTopics } from '~/actions/topic'

const mainMenuItems = [
  { href: '/journal', label: 'Journal', Icon: JournalIcon },
  { href: '/topics', label: 'Topics', Icon: TopicsIcon },
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

export const PinTopics = () => {
  const path = usePathname()
  const { data: topics } = useFetchAction(getPinTopics, {
    refreshKey: 'pin-topics',
  })
  return (
    <nav className="main-menu">
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
