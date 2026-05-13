import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { communityMembersService } from '../../../services/communityMembersService'

/**
 * Loading skeleton for member cards
 */
function MemberSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded px-2 py-2 animate-pulse"
        >
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Individual community member card
 */
function MemberCard({ member, collapsed }) {
  const [isHovered, setIsHovered] = useState(false)

  const totalContributions = (member.questions || 0) + (member.answers || 0)

  return (
    <Link
      to={`/profile/${member.id}`}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={[
          'relative rounded-lg transition-all duration-200',
          'bg-white dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700/50',
          'hover:border-blue-400 dark:hover:border-blue-500/50',
          'hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-900/20',
          collapsed ? 'p-1.5' : 'p-2.5',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={
                member.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=random`
              }
              alt={member.username}
              className={[
                'rounded-full object-cover',
                'border border-gray-200 dark:border-gray-600',
                'transition-all duration-200',
                isHovered ? 'ring-2 ring-blue-400 dark:ring-blue-500' : '',
                collapsed ? 'h-6 w-6' : 'h-8 w-8',
              ].join(' ')}
            />
            {/* Online indicator (optional - you can toggle this) */}
            {false && (
              <div
                className={[
                  'absolute bottom-0 right-0 h-2 w-2 rounded-full',
                  'border border-white dark:border-gray-800',
                  Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400',
                ].join(' ')}
              />
            )}
          </div>

          {/* User info */}
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <h3
                  className={[
                    'font-semibold text-gray-900 dark:text-gray-100',
                    'truncate transition-colors duration-200',
                    'group-hover:text-blue-600 dark:group-hover:text-blue-400',
                  ].join(' ')}
                  title={member.username}
                >
                  {member.username}
                </h3>
                {member.is_verified && (
                  <span title="Verified member" className="text-blue-500 text-sm">
                    ✓
                  </span>
                )}
              </div>

              {/* Reputation */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {member.reputation || 0} rep
                </span>
              </div>

              {/* Contributions */}
              <div
                className={[
                  'text-xs text-gray-600 dark:text-gray-400 mt-1',
                  'flex items-center justify-between',
                ].join(' ')}
              >
                <span>{totalContributions} contributions</span>
                {isHovered && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {member.questions || 0}Q • {member.answers || 0}A
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Hover tooltip for collapsed state */}
        {collapsed && isHovered && (
          <div
            className={[
              'absolute left-full ml-2 top-0 z-50',
              'bg-gray-900 dark:bg-gray-950 text-white rounded-lg px-3 py-2',
              'text-sm whitespace-nowrap pointer-events-none',
              'border border-gray-700 dark:border-gray-600',
              'shadow-lg',
            ].join(' ')}
          >
            <p className="font-semibold">{member.username}</p>
            <p className="text-orange-300 text-xs">{member.reputation} rep</p>
            <p className="text-gray-400 text-xs">{totalContributions} contributions</p>
          </div>
        )}
      </div>
    </Link>
  )
}

/**
 * Community Members section for sidebar
 */
export function CommunityMembers({ collapsed, onMemberClick }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('reputation')
  const [showAll, setShowAll] = useState(false)

  const limit = showAll ? 20 : 6

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await communityMembersService.getActiveMembers(limit, sortBy)

        if (response.success) {
          setMembers(response.data || [])
        } else {
          setError('Failed to load community members')
          setMembers([])
        }
      } catch (err) {
        console.error('Error fetching community members:', err)
        setError('Failed to load community members')
        setMembers([])
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [sortBy, limit])

  const displayMembers = useMemo(() => {
    return members.slice(0, limit)
  }, [members, limit])

  if (collapsed) {
    // Collapsed view - just show avatars
    return (
      <div className="space-y-1">
        {loading ? (
          <MemberSkeleton />
        ) : error ? null : displayMembers.length > 0 ? (
          <div className="space-y-1">
            {displayMembers.map((member) => (
              <MemberCard key={member.id} member={member} collapsed={true} />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          Community Members
        </h3>
        {!loading && members.length > 0 && (
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        )}
      </div>

      {/* Sort controls */}
      {!loading && members.length > 0 && (
        <div className="flex gap-1 px-2">
          <button
            onClick={() => setSortBy('reputation')}
            className={[
              'text-xs px-2 py-1 rounded transition-all duration-200',
              sortBy === 'reputation'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
            ].join(' ')}
            title="Sort by reputation points"
          >
            Top
          </button>
          <button
            onClick={() => setSortBy('answers')}
            className={[
              'text-xs px-2 py-1 rounded transition-all duration-200',
              sortBy === 'answers'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
            ].join(' ')}
            title="Sort by answer count"
          >
            Helpers
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={[
              'text-xs px-2 py-1 rounded transition-all duration-200',
              sortBy === 'recent'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
            ].join(' ')}
            title="Sort by recent activity"
          >
            Active
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="px-2">
          <MemberSkeleton />
        </div>
      ) : error ? (
        <div className="px-2 py-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : displayMembers.length > 0 ? (
        <>
          {/* Members list */}
          <div className="space-y-1 px-2 max-h-96 overflow-y-auto">
            {displayMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                collapsed={collapsed}
              />
            ))}
          </div>

          {/* Show more button */}
          {members.length > 6 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className={[
                'w-full mx-2 text-xs font-semibold text-blue-600 dark:text-blue-400',
                'py-2 rounded-lg transition-all duration-200',
                'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                'border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50',
              ].join(' ')}
            >
              Show all {members.length} members →
            </button>
          )}

          {/* Show less button */}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className={[
                'w-full mx-2 text-xs font-semibold text-gray-600 dark:text-gray-400',
                'py-2 rounded-lg transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              Show less ←
            </button>
          )}
        </>
      ) : (
        <div className="px-2 py-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No active members yet
          </p>
        </div>
      )}
    </div>
  )
}

export default CommunityMembers
