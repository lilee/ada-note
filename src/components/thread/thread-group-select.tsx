'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../ui/button'

export const ThreadGroupSelect = ({ groups }: { groups: string[] }) => {
  const router = useRouter()
  const path = usePathname()
  const searchParams = useSearchParams()
  const searchGroup = searchParams.get('group')
  const handleSelect = (group?: string) => () => {
    const searchParams_ = new URLSearchParams(searchParams)
    if (group) {
      searchParams_.set('group', group)
    } else {
      searchParams_.delete('group')
    }
    router.replace(`${path}?${searchParams_.toString()}`)
  }
  if (groups.length === 0) {
    return null
  }
  return (
    <div className="flex gap-2">
      <Button
        variant={searchGroup === null ? 'default' : 'secondary'}
        size="sm"
        className="rounded-full"
        onClick={handleSelect(undefined)}
      >
        All
      </Button>
      {groups.map(g => (
        <Button
          key={g}
          variant={searchGroup === g ? 'default' : 'secondary'}
          size="sm"
          className="rounded-full"
          onClick={handleSelect(g)}
        >
          {g}
        </Button>
      ))}
    </div>
  )
}
