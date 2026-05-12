/**
 * Client-side helpers for search autocomplete: relevance ranking and
 * case-insensitive highlight segments (no network, no AI).
 */

/** Minimum characters before we call the search API (matches backend). */
export const SUGGESTION_MIN_QUERY_LENGTH = 2

/** Default debounce delay (ms) — balances responsiveness vs request churn. */
export const SUGGESTION_DEBOUNCE_MS = 280

/**
 * Score a text label for how well it matches `query` (higher = better).
 * Used to rank suggestions after the API returns candidates.
 *
 * - Earliest substring match ranks higher
 * - Matches at the start of the string or after whitespace rank higher
 */
export function scoreLabelMatch(label, query) {
  const q = query.trim().toLowerCase()
  const text = label.toLowerCase()
  if (!q || !text) return -1

  const idx = text.indexOf(q)
  if (idx === -1) return -1

  let score = 1000 - Math.min(idx, 500)
  if (idx === 0) score += 300
  const prev = idx > 0 ? text[idx - 1] : ' '
  if (prev === ' ' || prev === '\n' || prev === '\t') score += 150

  return score
}

/**
 * Sort suggestion items by relevance (best first). Items with no substring
 * match are dropped (defensive if mixed sources slip in).
 */
export function rankSuggestionItems(items, query, getLabel = (x) => x.label) {
  return items
    .map((item) => ({
      item,
      score: scoreLabelMatch(getLabel(item), query),
    }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

/**
 * Split `text` into parts for rendering: matched runs use the original casing
 * from `text` at each case-insensitive match position.
 */
export function getHighlightParts(text, query) {
  const q = query.trim()
  if (!text || !q) {
    return [{ text, highlight: false }]
  }

  const lowerText = text.toLowerCase()
  const lowerQ = q.toLowerCase()
  const parts = []
  let i = 0

  while (i < text.length) {
    const found = lowerText.indexOf(lowerQ, i)
    if (found === -1) {
      parts.push({ text: text.slice(i), highlight: false })
      break
    }
    if (found > i) {
      parts.push({ text: text.slice(i, found), highlight: false })
    }
    parts.push({
      text: text.slice(found, found + q.length),
      highlight: true,
    })
    i = found + q.length
  }

  return parts.length ? parts : [{ text, highlight: false }]
}

/**
 * Deduplicate by lowercase label, keeping the first occurrence (API order wins).
 */
export function dedupeByLabel(items, getLabel = (x) => x.label) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    const key = getLabel(item).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

/**
 * Optional: simple fuzzy bonus — boosts score if all query chars appear in order.
 * Does not filter alone; use after substring match or for extra ranking only.
 */
export function fuzzySubsequenceMatch(text, query) {
  const t = text.toLowerCase()
  const q = query.trim().toLowerCase()
  if (!q) return true
  let ti = 0
  for (let qi = 0; qi < q.length; qi++) {
    ti = t.indexOf(q[qi], ti)
    if (ti === -1) return false
    ti++
  }
  return true
}

/** Recent searches localStorage (optional enhancement). */
const RECENT_KEY = 'stackoverflow_clone_recent_searches'
const RECENT_MAX = 8

export function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((s) => typeof s === 'string').slice(0, RECENT_MAX)
      : []
  } catch {
    return []
  }
}

export function pushRecentSearch(term) {
  const t = term.trim()
  if (!t) return
  const prev = loadRecentSearches().filter((s) => s.toLowerCase() !== t.toLowerCase())
  prev.unshift(t)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(prev.slice(0, RECENT_MAX)))
  } catch {
    /* ignore quota */
  }
}
