import { memo, useRef, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { IconLogout } from './sidebarIcons'

/**
 * Destructive action with confirmation dialog (accessible, keyboard-friendly).
 */
function LogoutButton({ onAfterLogout, className = '', iconOnly = false }) {
  const dialogRef = useRef(null)
  const dialogId = useId()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const openConfirm = () => dialogRef.current?.showModal()

  const confirmLogout = () => {
    dialogRef.current?.close()
    logout()
    onAfterLogout?.()
    navigate('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={openConfirm}
        className={[
          iconOnly
            ? 'flex h-10 w-10 items-center justify-center rounded-lg border border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            : 'flex w-full items-center justify-center gap-2 rounded-lg border border-red-200/80 bg-red-50/80 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
          'transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-sm dark:hover:bg-red-950/70',
          'outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
          className,
        ].join(' ')}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        title={iconOnly ? 'Log out' : undefined}
        aria-label={iconOnly ? 'Log out' : undefined}
      >
        <IconLogout className="h-4 w-4 shrink-0" />
        {!iconOnly ? <span>Log out</span> : null}
      </button>

      <dialog
        id={dialogId}
        ref={dialogRef}
        className="w-[min(92vw,400px)] rounded-xl border border-gray-200 bg-white p-6 shadow-2xl backdrop:bg-black/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-desc"
      >
        <h2 id="logout-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">
          Sign out?
        </h2>
        <p id="logout-dialog-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          You will need to sign in again to access your profile and post questions.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-500"
            onClick={confirmLogout}
          >
            Log out
          </button>
        </div>
      </dialog>
    </>
  )
}

export default memo(LogoutButton)
