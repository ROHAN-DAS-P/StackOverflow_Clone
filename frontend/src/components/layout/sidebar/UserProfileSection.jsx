import { memo } from 'react'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton'

/**
 * Sticky footer block: avatar, identity, and separated logout (desktop + drawer).
 */
function UserProfileSection({ user, collapsed, onNavigate }) {
  const name = user?.username || user?.first_name || 'User'
  const email = user?.email
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a7ea4&color=fff`

  if (collapsed) {
    return (
      <div className="border-t border-gray-200/80 p-2 dark:border-white/10">
        <Link
          to={`/profile/${user?.id}`}
          onClick={onNavigate}
          className="flex justify-center rounded-lg p-2 outline-none ring-primary transition hover:bg-gray-100 focus-visible:ring-2 dark:hover:bg-white/10"
          title={`${name} profile`}
          aria-label={`${name} profile`}
        >
          <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-gray-800" width={36} height={36} />
        </Link>
        <div className="mt-2 flex justify-center">
          <LogoutButton
            onAfterLogout={onNavigate}
            iconOnly
            className="!border-0 !bg-transparent hover:!bg-red-50 dark:hover:!bg-red-950/30"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200/80 bg-gray-50/80 p-3 dark:border-white/10 dark:bg-black/20">
      <Link
        to={`/profile/${user?.id}`}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg p-2 outline-none ring-primary transition hover:bg-white/80 dark:hover:bg-white/5 focus-visible:ring-2"
        aria-label={`View profile for ${name}`}
      >
        <img src={avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white dark:ring-gray-700" width={40} height={40} />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
          {email ? (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={email}>
              {email}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="mt-3 border-t border-gray-200/60 pt-3 dark:border-white/10">
        <LogoutButton onAfterLogout={onNavigate} />
      </div>
    </div>
  )
}

export default memo(UserProfileSection)
