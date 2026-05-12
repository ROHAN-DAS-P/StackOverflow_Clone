import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileSidebarDrawer from './sidebar/MobileSidebarDrawer'
import { useBreakpoint } from '../../hooks/useBreakpoint'

/**
 * App shell: sidebar + (header + main) share one column so the navbar aligns with content.
 * Mobile: full-width column with drawer; tablet/desktop: sidebar + fluid main column.
 */
export default function Layout() {
  const bp = useBreakpoint()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <div className="flex min-h-0 flex-1">
        {bp !== 'sm' ? <Sidebar /> : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-out">
          <Header />
          <main className="min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <MobileSidebarDrawer />
    </div>
  )
}
