import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import {
  SUGGESTION_DEBOUNCE_MS,
  SUGGESTION_MIN_QUERY_LENGTH,
  rankSuggestionItems,
  dedupeByLabel,
} from '../utils/searchSuggestions'

/**
 * Debounced search suggestions: loads matches from `fetchSuggestions`, merges
 * optional static phrases from the page, ranks client-side, exposes keyboard
 * navigation index. Abort-safe to avoid stale updates.
 */
export function useSearchSuggestions({
  query,
  fetchSuggestions,
  staticPhrases = [],
  recentPhrases = [],
  debounceMs = SUGGESTION_DEBOUNCE_MS,
  minLength = SUGGESTION_MIN_QUERY_LENGTH,
  maxResults = 8,
}) {
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [apiItems, setApiItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const itemsRef = useRef([])

  // Debounce raw input → debouncedQuery (reduces API calls while typing).
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, debounceMs)
    return () => clearTimeout(t)
  }, [query, debounceMs])

  // Phrases already present on the page — merged with API results, same ranking.
  const recentItems = useMemo(() => {
    const q = debouncedQuery
    if (q.length < minLength) return []
    const lower = q.toLowerCase()
    return recentPhrases
      .filter((s) => typeof s === 'string' && s.trim())
      .filter((s) => s.toLowerCase().includes(lower))
      .map((label, i) => ({
        id: `recent-${i}-${label.slice(0, 24)}`,
        label: label.trim(),
        source: 'recent',
      }))
  }, [debouncedQuery, minLength, recentPhrases])

  const staticItems = useMemo(() => {
    const q = debouncedQuery
    if (q.length < minLength) return []
    const lower = q.toLowerCase()
    return staticPhrases
      .filter((s) => typeof s === 'string' && s.trim())
      .filter((s) => s.toLowerCase().includes(lower))
      .map((label, i) => ({
        id: `static-${i}-${label.slice(0, 24)}`,
        label: label.trim(),
        source: 'local',
      }))
  }, [debouncedQuery, minLength, staticPhrases])

  useEffect(() => {
    if (debouncedQuery.length < minLength) {
      setApiItems([])
      setLoading(false)
      setFetchError(false)
      setActiveIndex(-1)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    setLoading(true)
    setFetchError(false)
    setApiItems([])

    ;(async () => {
      let next = []
      try {
        next = await fetchSuggestions(debouncedQuery, controller.signal)
      } catch (e) {
        if (e.name === 'AbortError' || controller.signal.aborted) return
        if (!cancelled) {
          setFetchError(true)
          next = []
        }
      }

      if (cancelled || controller.signal.aborted) return

      setApiItems(Array.isArray(next) ? next : [])
      setLoading(false)
      setActiveIndex(-1)
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedQuery, minLength, fetchSuggestions])

  const items = useMemo(() => {
    const merged = dedupeByLabel(
      [...apiItems, ...recentItems, ...staticItems],
      (x) => x.label,
    )
    return rankSuggestionItems(merged, debouncedQuery, (x) => x.label).slice(
      0,
      maxResults,
    )
  }, [apiItems, recentItems, staticItems, debouncedQuery, maxResults])

  itemsRef.current = items

  useEffect(() => {
    setActiveIndex((i) => {
      if (items.length === 0) return -1
      if (i >= items.length) return items.length - 1
      return i
    })
  }, [items])

  const resetActive = useCallback(() => setActiveIndex(-1), [])

  const moveActive = useCallback((delta) => {
    setActiveIndex((idx) => {
      const list = itemsRef.current
      const len = list.length
      if (len === 0) return -1
      if (idx < 0) {
        return delta > 0 ? 0 : len - 1
      }
      return (idx + delta + len) % len
    })
  }, [])

  return {
    debouncedQuery,
    items,
    loading,
    fetchError,
    activeIndex,
    moveActive,
    resetActive,
  }
}
