import { ScrollArea } from '~/components/ui/scroll-area'
import { Header } from './header'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="header">
        <Header />
      </header>
      <ScrollArea className="flex-1">
        <main className="flex flex-col py-4 px-6 lg:p-6">{children}</main>
      </ScrollArea>
    </>
  )
}

export default Layout
