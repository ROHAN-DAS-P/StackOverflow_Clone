import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import PageShell from '../../components/layout/PageShell'

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
      <PageShell>
        <div className="py-16 text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </PageShell>
    )
  }

  if (!user) {
    return (
      <PageShell>
        <div className="card text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {error || 'User not found'}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <div className="card mb-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <img
              src={`https://ui-avatars.com/api/?name=${user.username}&size=128`}
              alt=""
              className="h-32 w-32 rounded-full"
              width={128}
              height={128}
            />

            <div className="min-w-0 flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{user.email}</p>

              <div className="mb-4 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary dark:text-cyan-400">
                    {user.reputation || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reputation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary dark:text-cyan-400">
                    {user.questions_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary dark:text-cyan-400">
                    {user.answers_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Answers</div>
                </div>
              </div>

              {user.bio && <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <div className="card dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Badges</h3>
            <div className="space-y-2">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>
                      🏅
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{badge}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No badges yet</p>
              )}
            </div>
          </div>

          <div className="card dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 dark:text-gray-400">Last seen</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="card dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Top Tags</h3>
            <div className="flex flex-wrap gap-2">
              {user.top_tags && user.top_tags.length > 0 ? (
                user.top_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No top tags</p>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="card dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">About</h3>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{user.bio}</p>
          </div>
        )}
      </div>
    </PageShell>
  )
}
