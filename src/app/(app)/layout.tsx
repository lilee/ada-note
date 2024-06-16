import { Notebook } from 'lucide-react'
import Link from 'next/link'
import { MainMenu, MainMenuFooter, TopicsMenu, UserMenu } from './layout-components'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden md:block border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="h-header flex items-center border-b px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Notebook className="h-5 w-5" />
              <span>Ada Note</span>
            </Link>
            <UserMenu />
          </div>
          <div className="flex-1">
            <MainMenu />
            <hr className="my-2" />
            <TopicsMenu />
          </div>
        </div>
      </div>
      <div className="flex flex-col max-h-screen overflow-hidden relative">
        {children}
        <div className="h-8"></div>
      </div>
      <MainMenuFooter />
    </div>
  )
}

export default Layout
