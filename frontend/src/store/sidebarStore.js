import { create } from 'zustand'

const COLLAPSED_KEY = 'sidebar_collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * UI state for responsive sidebar: mobile overlay drawer and tablet collapsed rail.
 */
export const useSidebarStore = create((set, get) => ({
  mobileOpen: false,
  collapsed: readCollapsed(),

  setMobileOpen: (open) => set({ mobileOpen: Boolean(open) }),

  toggleMobile: () => set({ mobileOpen: !get().mobileOpen }),

  setCollapsed: (collapsed) => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
    set({ collapsed: Boolean(collapsed) })
  },

  toggleCollapsed: () => {
    const next = !get().collapsed
    get().setCollapsed(next)
  },
}))
