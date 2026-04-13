import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { authService } from '../../services/authService'

export default function Profile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [id])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await authService.getProfile(id)
      setUser(data)
    } catch (err) {
      setError('Failed to load profile')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin text-2xl">⏳</div>
        <p className="text-gray-600 mt-2">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center text-gray-500">
          {error || 'User not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img 
            src={`https://ui-avatars.com/api/?name=${user.username}&size=128`}
            alt="Profile"
            className="w-32 h-32 rounded-full"
          />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-primary">{user.reputation || 0}</div>
                <div className="text-sm text-gray-600">Reputation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{user.questions_count || 0}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{user.answers_count || 0}</div>
                <div className="text-sm text-gray-600">Answers</div>
              </div>
            </div>

            {user.bio && (
              <p className="text-gray-700">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Badges</h3>
          <div className="space-y-2">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map(badge => (
                <div key={badge} className="flex items-center gap-2">
                  <span className="text-2xl">🏅</span>
                  <span className="text-gray-700">{badge}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No badges yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Member since</span>
              <span className="font-medium">
                {new Date(user.date_joined).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last seen</span>
              <span className="font-medium">
                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {user.top_tags && user.top_tags.length > 0 ? (
              user.top_tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No top tags</p>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {user.bio && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
        </div>
      )}
    </div>
  )
}
