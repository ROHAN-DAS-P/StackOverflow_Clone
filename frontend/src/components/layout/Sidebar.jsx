import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-6">
      <nav className="space-y-2">
        <Link
          to="/"
          className={`block px-4 py-2 rounded-md transition ${
            isActive('/') 
              ? 'bg-primary text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          🏠 Home
        </Link>
        
        <Link
          to="/questions"
          className={`block px-4 py-2 rounded-md transition ${
            isActive('/questions') 
              ? 'bg-primary text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          ❓ All Questions
        </Link>
        
        <div className="pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">Navigation</h3>
          
          <Link
            to="/questions"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Featured
          </Link>
          
          <Link
            to="/questions"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Recent
          </Link>
          
          <Link
            to="/questions"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Unanswered
          </Link>
        </div>

        <div className="pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2 px-4">
            {['React', 'Django', 'JavaScript', 'Python'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
