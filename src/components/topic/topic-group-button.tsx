'use client'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { ThreadGroup } from '~/types'

export const TopicGroupButton = ({
  group,
  menu = false,
}: {
  group: ThreadGroup | null
  menu?: boolean
}) => {
  const router = useRouter()
  const path = usePathname()
  const searchParams = useSearchParams()
  const searchGroup = searchParams.get('group')
  const handleSelect = (group: string | null) => {
    updateKey()
    const searchParams_ = new URLSearchParams(searchParams)
    if (group) {
      searchParams_.set('group', group)
    } else {
      searchParams_.delete('group')
    }
    router.push(`${path}?${searchParams_.toString()}`)
  }
  const [key, updateKey] = React.useReducer(state => state + 1, 0)
  const name = group?.group_name ?? 'All'
  const size = menu ? 'sm' : 'xs'
  if (group?.children && group.children.length > 0) {
    const selectValue = searchGroup?.startsWith(group.group_name + '/') ? searchGroup : undefined
    return (
      <SelectPrimitive.Select
        key={key}
        value={selectValue}
        onValueChange={value => handleSelect(value)}
      >
        <GroupSelectTrigger placeholder={name} active={selectValue !== undefined} />
        <GroupSelectContent>
          {group.children.map(child => (
            <GroupSelectItem key={child} value={child} className="outline-none">
              {child}
            </GroupSelectItem>
          ))}
        </GroupSelectContent>
      </SelectPrimitive.Select>
    )
  }
  return (
    <Button
      variant={menu && searchGroup === (group?.group_name ?? null) ? 'default' : 'secondary'}
      size={size}
      className="rounded-full border"
      onClick={() => handleSelect(group?.group_name ?? null)}
    >
      {name}
    </Button>
  )
}

const triggerVariants = cva(
  'font-medium flex items-center bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-full h-7 px-3 text-xs outline-none',
  {
    variants: {
      active: {
        true: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      },
    },
  }
)
const GroupSelectTrigger = ({ placeholder, active }: { placeholder: string; active: boolean }) => {
  return (
    <SelectPrimitive.Trigger className={cn(triggerVariants({ active }))}>
      <SelectPrimitive.SelectValue placeholder={placeholder} />
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

const GroupSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
GroupSelectContent.displayName = SelectPrimitive.Content.displayName

const GroupSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'font-medium relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-xs outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
GroupSelectItem.displayName = SelectPrimitive.Item.displayName
