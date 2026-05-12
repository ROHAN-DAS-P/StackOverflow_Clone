import { memo, useEffect } from 'react'
import { useSidebarStore } from '../../store/sidebarStore'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import SidebarPanel from './sidebar/SidebarPanel'
import { IconChevronLeft, IconChevronRight } from './sidebar/sidebarIcons'

/**
 * Responsive primary navigation: full width on large screens, collapsible rail on
 * tablet, hidden in favor of the mobile drawer on small screens.
 */
function Sidebar() {
  const bp = useBreakpoint()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)

  const isLg = bp === 'lg'
  const effectiveCollapsed = !isLg && collapsed

  // Desktop uses a full-width rail; collapse state only applies to tablet.
  useEffect(() => {
    if (isLg) setCollapsed(false)
  }, [isLg, setCollapsed])

  const widthClass = effectiveCollapsed ? 'w-[4.5rem]' : 'w-64'

  return (
    <aside
      className={[
        'relative z-30 hidden h-full min-h-0 shrink-0 flex-col md:flex',
        'border-r border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-md',
        'transition-[width] duration-300 ease-out dark:border-white/10 dark:bg-gray-900/90',
        widthClass,
      ].join(' ')}
      aria-label="Site navigation"
    >
      {/* Tablet-only collapse control */}
      {!isLg ? (
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
          title={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!effectiveCollapsed}
          aria-controls="sidebar-panel"
        >
          {effectiveCollapsed ? (
            <IconChevronRight className="h-3.5 w-3.5" />
          ) : (
            <IconChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      ) : null}

      <div id="sidebar-panel" className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SidebarPanel collapsed={effectiveCollapsed} />
      </div>
    </aside>
  )
}

export default memo(Sidebar)
