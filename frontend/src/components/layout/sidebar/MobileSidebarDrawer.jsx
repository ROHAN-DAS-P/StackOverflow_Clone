import { memo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSidebarStore } from '../../../store/sidebarStore'
import SidebarPanel from './SidebarPanel'

/**
 * Slide-in navigation for small screens with backdrop and focus management.
 */
function MobileSidebarDrawer() {
  const mobileOpen = useSidebarStore((s) => s.mobileOpen)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)

  const onClose = () => setMobileOpen(false)

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = requestAnimationFrame(() => closeBtnRef.current?.focus())
    return () => {
      document.body.style.overflow = prev
      cancelAnimationFrame(t)
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={[
        'fixed inset-0 z-[60] md:hidden',
        'transition-opacity duration-300 ease-out',
        mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        className={[
          'absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-label="Close navigation menu"
        onClick={onClose}
      />

      <aside
        id="mobile-sidebar"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className={[
          'absolute left-0 top-0 flex h-full w-[min(88vw,288px)] flex-col',
          'border-r border-white/20 bg-white/95 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-gray-900/95',
          'transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-gray-200/80 px-3 py-3 dark:border-white/10">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Menu</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="Close menu"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        {mobileOpen ? (
          <SidebarPanel collapsed={false} onNavigate={onClose} className="min-h-0 flex-1" />
        ) : null}
      </aside>
    </div>,
    document.body,
  )
}

export default memo(MobileSidebarDrawer)
