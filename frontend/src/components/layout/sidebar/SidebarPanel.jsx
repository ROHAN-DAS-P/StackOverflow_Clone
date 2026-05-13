import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import SidebarItem from './SidebarItem'
import CommunityMembers from './CommunityMembers'
import TrendingTags from './TrendingTags'
import UserProfileSection from './UserProfileSection'
import {
  IconHome,
  IconQuestions,
  IconRecent,
  IconUnanswered,
  IconLogin,
} from './sidebarIcons'

/**
 * Shared navigation body: main links, trending tags, and auth footer.
 * Used by the fixed sidebar (tablet/desktop) and the mobile drawer.
 */
function SidebarPanel({ collapsed, onNavigate, className = '' }) {
  const location = useLocation()
  const { pathname, search } = location
  const params = new URLSearchParams(search)
  const tag = params.get('tag')
  const sort = params.get('sort')
  const { token, user } = useAuthStore()

  const allQuestionsMatch = () =>
    pathname === '/questions' && !tag && sort !== 'recent'

  const recentMatch = () =>
    pathname === '/questions' && sort === 'recent' && !tag

  const unansweredMatch = () => pathname === '/questions/unanswered'

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-3"
        aria-label="Main navigation"
      >
        <p
          className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${collapsed ? 'sr-only' : ''}`}
        >
          Explore
        </p>

        <SidebarItem to="/" end icon={IconHome} collapsed={collapsed} onClick={onNavigate}>
          Home
        </SidebarItem>

        <SidebarItem
          to="/questions"
          icon={IconQuestions}
          collapsed={collapsed}
          onClick={onNavigate}
          matchActive={allQuestionsMatch}
        >
          All Questions
        </SidebarItem>

        <SidebarItem
          to="/questions?sort=recent"
          icon={IconRecent}
          collapsed={collapsed}
          onClick={onNavigate}
          matchActive={recentMatch}
        >
          Recent
        </SidebarItem>

        <SidebarItem
          to="/questions/unanswered"
          icon={IconUnanswered}
          collapsed={collapsed}
          onClick={onNavigate}
          matchActive={unansweredMatch}
        >
          Unanswered
        </SidebarItem>
      </nav>

      {!collapsed ? (
        <div className="shrink-0 border-t border-gray-200/60 px-2 py-3 dark:border-white/10 space-y-4">
          {/* Community Members Section */}
          <div>
            <CommunityMembers collapsed={collapsed} onMemberClick={onNavigate} />
          </div>

          {/* Trending Tags Section */}
          <div>
            <TrendingTags collapsed={collapsed} onTagClick={onNavigate} />
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-t border-gray-200/60 px-2 py-3 dark:border-white/10 space-y-2">
          {/* Community Members - Collapsed */}
          <CommunityMembers collapsed={collapsed} onMemberClick={onNavigate} />
        </div>
      )}

      <div className="sticky bottom-0 z-10 mt-auto shrink-0 backdrop-blur-sm">
        {token && user ? (
          <UserProfileSection user={user} collapsed={collapsed} onNavigate={onNavigate} />
        ) : (
          <GuestFooter collapsed={collapsed} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  )
}

function GuestFooter({ collapsed, onNavigate }) {
  if (collapsed) {
    return (
      <div className="space-y-2 border-t border-gray-200/80 p-2 dark:border-white/10">
        <Link
          to="/auth/login"
          title="Login"
          aria-label="Login"
          onClick={onNavigate}
          className="flex justify-center rounded-lg p-2 text-primary transition hover:bg-primary/10 dark:text-cyan-400"
        >
          <IconLogin className="h-5 w-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2 border-t border-gray-200/80 bg-gray-50/80 p-3 dark:border-white/10 dark:bg-black/20">
      <Link
        to="/auth/login"
        onClick={onNavigate}
        className="block rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
      >
        Login
      </Link>
      <Link
        to="/auth/register"
        onClick={onNavigate}
        className="block rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-opacity-90"
      >
        Sign up
      </Link>
    </div>
  )
}

export default memo(SidebarPanel)
