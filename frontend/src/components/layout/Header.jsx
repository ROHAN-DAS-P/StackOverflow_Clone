import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCallback, useState, useMemo } from 'react'
import { questionsService } from '../../services/questionsService'
import SearchBarWithSuggestions from '../search/SearchBarWithSuggestions'
import { loadRecentSearches } from '../../utils/searchSuggestions'

export default function Header() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const recentPhrases = useMemo(() => loadRecentSearches(), [searchQuery])

  /**
   * Loads suggestion rows from the API (database-backed question titles only).
   * AbortSignal cancels in-flight requests when the user keeps typing.
   */
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">SO</div>
            <span className="hidden sm:inline text-gray-700 font-semibold">
              StackOverflow
            </span>
          </Link>

          {/* Search — suggestions are DB + optional on-page strings + recent (localStorage). */}
          <div className="flex-1 max-w-md">
            <SearchBarWithSuggestions
              value={searchQuery}
              onChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              fetchSuggestions={fetchSuggestions}
              recentPhrases={recentPhrases}
              staticPhrases={[]}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <>
                <Link
                  to="/questions/create"
                  className="btn-primary hidden sm:inline-block"
                >
                  Ask Question
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-primary transition">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user?.username || user?.first_name || 'User'}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium">
                      {user?.username || user?.first_name || 'User'}
                    </span>
                  </button>
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <Link
                      to={`/profile/${user?.id}`}
                      className="block px-4 py-2 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="btn-outline hidden sm:inline-block"
                >
                  Login
                </Link>
                <Link to="/auth/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
