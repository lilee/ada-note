import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { marked } from 'marked'

export const ThreadContentMarkdown = ({ content }: { content?: string | null }) => {
  if (!content) {
    return null
  }
  const markdown = marked(content, {
    breaks: true,
  })
  return (
    <Sheet>
      <SheetTrigger asChild>
        <a className="text-sm text-blue-600 cursor-pointer">More...</a>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-none">
        <article className="prose prose-sm" dangerouslySetInnerHTML={{ __html: markdown }} />
      </SheetContent>
    </Sheet>
  )
}
