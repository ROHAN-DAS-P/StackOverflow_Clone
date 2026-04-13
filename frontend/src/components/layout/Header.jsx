import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'

export default function Header() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

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
            <span className="hidden sm:inline text-gray-700 font-semibold">StackOverflow</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search questions, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full"
            />
          </form>

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
                      src={`https://ui-avatars.com/api/?name=${user.username}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium">{user.username}</span>
                  </button>
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <Link to={`/profile/${user.id}`} className="block px-4 py-2 hover:bg-gray-50">
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
                <Link to="/auth/login" className="btn-outline hidden sm:inline-block">
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
