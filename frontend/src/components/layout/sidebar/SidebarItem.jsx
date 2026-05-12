import { memo } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * Primary nav row with hover motion, active background, and left accent bar.
 * When `collapsed`, shows icon only + native tooltip via `title`.
 *
 * `matchActive` overrides default path matching (needed for query-string routes).
 */
function SidebarItem({
  to,
  end = false,
  icon: Icon,
  children,
  collapsed,
  matchActive,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? String(children) : undefined}
      aria-label={collapsed ? String(children) : undefined}
      onClick={onClick}
      className={({ isActive: navIsActive }) => {
        const active = typeof matchActive === 'function' ? matchActive() : navIsActive
        return [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
          'transition-all duration-200 ease-out',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-gray-900',
          collapsed ? 'justify-center px-2' : '',
          active
            ? 'bg-primary/12 text-primary dark:bg-primary/25 dark:text-cyan-300 shadow-sm'
            : 'text-gray-700 hover:bg-gray-100/90 hover:translate-x-0.5 dark:text-gray-200 dark:hover:bg-white/10',
        ].join(' ')
      }}
    >
      {({ isActive: navIsActive }) => {
        const active = typeof matchActive === 'function' ? matchActive() : navIsActive
        return (
          <>
            <span
              className={[
                'pointer-events-none absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200',
                active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50',
              ].join(' ')}
              aria-hidden
            />
            {Icon ? (
              <span
                className={[
                  'flex h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  active ? 'text-primary dark:text-cyan-300' : 'text-gray-500 dark:text-gray-400',
                ].join(' ')}
              >
                <Icon className="h-full w-full" />
              </span>
            ) : null}
            {!collapsed ? <span className="truncate">{children}</span> : null}
          </>
        )
      }}
    </NavLink>
  )
}

export default memo(SidebarItem)
