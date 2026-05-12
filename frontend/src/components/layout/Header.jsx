import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCallback, useState, useMemo, useEffect } from 'react'
import { questionsService } from '../../services/questionsService'
import SearchBarWithSuggestions from '../search/SearchBarWithSuggestions'
import { loadRecentSearches } from '../../utils/searchSuggestions'
import { useSidebarStore } from '../../store/sidebarStore'
import { IconMenu } from './sidebar/sidebarIcons'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const root = document.documentElement
    root.classList.toggle('dark')
    const next = root.classList.contains('dark')
    setIsDark(next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-gray-200 p-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? '☀' : '☾'}
    </button>
  )
}

export default function Header() {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const mobileOpen = useSidebarStore((s) => s.mobileOpen)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)
  const [searchQuery, setSearchQuery] = useState('')

  const recentPhrases = useMemo(() => loadRecentSearches(), [searchQuery])

  const fetchSuggestions = useCallback(async (q, signal) => {
    const data = await questionsService.suggestions(q, signal)
    const questions = data.questions || []
    return questions.map((question) => ({
      id: question.id,
      label: question.title,
      subtitle: question.author?.username
        ? `Asked by ${question.author.username}`
        : undefined,
      source: 'api',
    }))
  }, [])

  const handleSearchSubmit = useCallback(
    (q) => {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearchQuery('')
    },
    [navigate],
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/90 bg-white/90 shadow-sm backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/90">
      {/* Grid: left cluster | centered search | right cluster — aligns with main content column */}
      <div className="mx-auto grid w-full max-w-[1920px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:gap-4 lg:px-8 xl:px-12">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-50 md:hidden dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
            onClick={() => setMobileOpen(true)}
          >
            <IconMenu className="h-5 w-5" />
          </button>

          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 outline-none ring-primary focus-visible:ring-2"
            aria-label="StackOverflow home"
          >
            <div className="text-2xl font-bold text-primary">SO</div>
            <span className="hidden font-semibold text-gray-800 sm:inline dark:text-gray-100">
              StackOverflow
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 justify-center px-1 sm:px-4">
          <div className="w-full max-w-2xl min-w-0">
            <SearchBarWithSuggestions
              value={searchQuery}
              onChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              fetchSuggestions={fetchSuggestions}
              recentPhrases={recentPhrases}
              staticPhrases={[]}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <ThemeToggle />
          {token ? (
            <Link
              to="/questions/create"
              className="btn-primary whitespace-nowrap px-3 py-2 text-sm sm:px-4"
            >
              <span className="hidden sm:inline">Ask Question</span>
              <span className="sm:hidden" aria-hidden>
                Ask
              </span>
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="btn-outline hidden px-3 py-2 text-sm sm:inline-block dark:border-gray-600 dark:text-gray-200"
              >
                Login
              </Link>
              <Link to="/auth/register" className="btn-primary px-3 py-2 text-sm sm:px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
