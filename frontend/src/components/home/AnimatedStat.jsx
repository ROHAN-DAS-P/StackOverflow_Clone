import { useEffect, useState, useRef, memo } from 'react'

/**
 * Animates a number from 0 to `value` on mount/update for stat cards.
 */
function AnimatedStat({ value, durationMs = 700, className = '' }) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const startRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    const to = Math.max(0, Number(value) || 0)
    if (from === to) {
      setDisplay(to)
      return
    }
    startRef.current = null
    let frame

    const tick = (now) => {
      if (startRef.current == null) startRef.current = now
      const t = Math.min(1, (now - startRef.current) / durationMs)
      const eased = 1 - (1 - t) ** 2
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = to
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, durationMs])

  return <span className={className}>{display.toLocaleString()}</span>
}

export default memo(AnimatedStat)
