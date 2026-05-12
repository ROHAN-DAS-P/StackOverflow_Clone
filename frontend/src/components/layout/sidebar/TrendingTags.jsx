import { memo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTrendingTags } from '../../../hooks/useTrendingTags'
import { IconTag } from './sidebarIcons'

/**
 * Tag chips under "Trending tags"; order updates from `useTrendingTags` (API + fallback).
 */
function TrendingTags({ collapsed, onTagClick }) {
  const { tags } = useTrendingTags()
  const location = useLocation()

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 px-1 py-2" aria-hidden />
    )
  }

  return (
    <div className="px-2 pt-1">
      <div className="mb-2 flex items-center gap-2 px-2">
        <IconTag className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Trending tags
        </h3>
      </div>
      <ul className="flex flex-wrap gap-2" role="list" aria-label="Trending tags">
        {tags.map((name) => {
          const to = `/questions?tag=${encodeURIComponent(name)}`
          const tagParam = new URLSearchParams(location.search).get('tag')
          const active =
            location.pathname === '/questions' &&
            tagParam &&
            tagParam.toLowerCase() === name.toLowerCase()
          return (
            <li key={name}>
              <NavLink
                to={to}
                onClick={onTagClick}
                className={[
                  'inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                  'transition-all duration-200 ease-out',
                  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900',
                  active
                    ? 'border-primary bg-primary/15 text-primary dark:border-cyan-500/50 dark:bg-primary/20 dark:text-cyan-200'
                    : 'border-gray-200/80 bg-white/60 text-gray-700 hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10',
                ].join(' ')}
              >
                <span className="truncate">{name}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default memo(TrendingTags)
