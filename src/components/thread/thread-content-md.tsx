import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { marked } from 'marked'

export const ThreadContentMarkdown = ({ content }: { content: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <a className="text-sm text-blue-600 cursor-pointer">查看更多</a>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-none w-[1/3]">
        <article className="prose prose-sm" dangerouslySetInnerHTML={{ __html: marked(content) }} />
      </SheetContent>
    </Sheet>
  )
}
