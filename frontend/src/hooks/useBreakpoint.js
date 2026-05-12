import { useState, useEffect } from 'react'

/**
 * Tracks coarse viewport bucket for responsive sidebar behavior.
 * sm: &lt;768, md: 768–1023, lg: ≥1024
 */
export function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    if (typeof window === 'undefined') return 'sm'
    const w = window.innerWidth
    if (w >= 1024) return 'lg'
    if (w >= 768) return 'md'
    return 'sm'
  })

  useEffect(() => {
    const upd = () => {
      const w = window.innerWidth
      if (w >= 1024) setBp('lg')
      else if (w >= 768) setBp('md')
      else setBp('sm')
    }
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  return bp
}
