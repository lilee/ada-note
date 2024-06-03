import { ScrollArea } from '~/components/ui/scroll-area'
import { Header } from './header'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <ScrollArea className="flex-1">
        <main className="sm:w-full md:w-[768px] mx-auto flex flex-col gap-4 lg:gap-6 py-4 px-6 lg:p-6">
          {children}
        </main>
      </ScrollArea>
    </>
  )
}
