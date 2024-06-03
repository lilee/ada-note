import { Search } from 'lucide-react'
import { Input, InputProps } from './input'
import { cn } from '~/lib/utils'

export const InputSearch = ({ className, ...props }: InputProps) => {
  return (
    <form className="w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          className={cn(
            'w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3',
            className
          )}
          {...props}
        />
      </div>
    </form>
  )
}
