import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { questionsService } from '../services/questionsService'
import { queryKeys } from '../lib/queryKeys'

/** Canonical trending tag labels (tie-breaker when scores match). */
export const TRENDING_TAG_NAMES = [
  'React',
  'Django',
  'JavaScript',
  'Python',
  'Node.js',
  'Next.js',
  'AI',
  'MongoDB',
]

/**
 * Trending tag order from the same cached `/questions/trending/` query as Home (no duplicate fetches).
 */
export function useTrendingTags() {
  const { data: questions = [], isLoading } = useQuery({
    queryKey: queryKeys.trending,
    queryFn: async () => {
      const data = await questionsService.getTrending()
      const list = data.results ?? data ?? []
      return Array.isArray(list) ? list : []
    },
    staleTime: 60_000,
  })

  const tags = useMemo(() => {
    const freq = {}
    for (const q of questions) {
      for (const raw of q.tags || []) {
        const t = String(raw).trim()
        if (!t) continue
        freq[t] = (freq[t] || 0) + 1
      }
    }
    const scored = TRENDING_TAG_NAMES.map((name) => {
      const keys = Object.keys(freq)
      const hit = keys.find((k) => k.toLowerCase() === name.toLowerCase())
      return { name, score: hit ? freq[hit] : 0 }
    })
    scored.sort(
      (a, b) =>
        b.score - a.score ||
        TRENDING_TAG_NAMES.indexOf(a.name) - TRENDING_TAG_NAMES.indexOf(b.name),
    )
    return scored.map((s) => s.name)
  }, [questions])

  return { tags, loading: isLoading }
}
