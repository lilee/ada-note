import { ScrollArea } from '~/components/ui/scroll-area'
import { Input } from '~/components/ui/input'
import { Search as SearchIcon } from 'lucide-react'

export default function Page() {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-col gap-4 lg:gap-6 p-4 lg:p-6 max-w-[768px] mx-auto">
        <div className="my-12">
          <h2 className="my-6 text-2xl text-center">和你的过往开始对话</h2>
          <AskInput />
        </div>
      </main>
    </ScrollArea>
  )
}

const AskInput = () => {
  return (
    <form className="w-full">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-6 w-6 text-gray-300" />
        <Input
          type="search"
          placeholder="Ask something..."
          className="h-12 appearance-none bg-background pl-10 shadow-none"
        />
      </div>
    </form>
  )
}
