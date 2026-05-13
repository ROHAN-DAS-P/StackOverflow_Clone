import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { communityMembersService } from '../../services/communityMembersService'

/**
 * User Profile Page Component
 */
export function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const profile = await communityMembersService.getMemberProfile(userId)
        setUser(profile)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'User not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The user profile you're looking for doesn't exist or couldn't be loaded.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with back button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title="Go back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Community Member Profile
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-12">
            <div className="flex items-end gap-6">
              <img
                src={
                  user.profile_picture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=128&background=random`
                }
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-white">{user.username}</h2>
                  {user.is_verified && (
                    <span
                      title="Verified member"
                      className="text-yellow-300 text-2xl"
                    >
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-blue-100">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Profile Body */}
          <div className="p-6 space-y-6">
            {/* Bio */}
            {user.bio && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Bio
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Reputation */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
                  Reputation
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {user.reputation || 0}
                </p>
              </div>

              {/* Questions */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                  Questions
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {user.questions || 0}
                </p>
              </div>

              {/* Answers */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">
                  Answers
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {user.answers || 0}
                </p>
              </div>

              {/* Contributions */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                  Contributions
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {(user.questions || 0) + (user.answers || 0)}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
                Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Member Since */}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Member Since
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                      : 'N/A'}
                  </p>
                </div>

                {/* Last Active */}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Last Active
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {user.last_active
                      ? (() => {
                        const date = new Date(user.last_active)
                        const now = new Date()
                        const diff = now - date
                        const minutes = Math.floor(diff / 60000)
                        const hours = Math.floor(diff / 3600000)
                        const days = Math.floor(diff / 86400000)

                        if (minutes < 1) return 'Just now'
                        if (minutes < 60) return `${minutes}m ago`
                        if (hours < 24) return `${hours}h ago`
                        if (days < 30) return `${days}d ago`
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      })()}
                    </p>
                </div>

                {/* Role */}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Role
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                    {user.role || 'Member'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {Math.random() > 0.5 ? 'Active' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium">
                View Questions
              </button>
              <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium">
                View Answers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
