import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet'
import { marked } from 'marked'

export const ThreadContentMarkdown = ({ content }: { content: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <a className="text-sm text-blue-600 cursor-pointer">查看更多</a>
      </SheetTrigger>
      <SheetContent>
        <article
          className="prose prose-sm"
          dangerouslySetInnerHTML={{ __html: marked(content) }}
        ></article>
      </SheetContent>
    </Sheet>
  )
}
