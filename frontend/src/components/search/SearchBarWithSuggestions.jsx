import {
  memo,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react'
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions'
import {
  getHighlightParts,
  pushRecentSearch,
  SUGGESTION_MIN_QUERY_LENGTH,
} from '../../utils/searchSuggestions'

/**
 * Renders label text with the current query highlighted (case-insensitive).
 */
const HighlightedLabel = memo(function HighlightedLabel({ text, query }) {
  const parts = useMemo(() => getHighlightParts(text, query), [text, query])
  return (
    <span className="break-words text-left">
      {parts.map((p, i) =>
        p.highlight ? (
          <mark
            key={i}
            className="bg-amber-200 text-gray-900 font-semibold rounded px-0.5"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  )
})

const SuggestionRow = memo(function SuggestionRow({
  active,
  label,
  highlightQuery,
  subtitle,
  onPick,
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={`w-full text-left px-4 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors ${
        active ? 'bg-primary/10' : 'hover:bg-gray-50'
      }`}
      onMouseDown={(e) => {
        // Keep focus on the input so the field does not blur before click runs.
        e.preventDefault()
      }}
      onClick={() => onPick(label)}
    >
      <div className="font-medium text-gray-900">
        <HighlightedLabel text={label} query={highlightQuery} />
      </div>
      {subtitle ? (
        <div className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</div>
      ) : null}
    </button>
  )
})

/**
 * Header / toolbar search field with debounced autocomplete from `fetchSuggestions`
 * plus optional `staticPhrases` (copy already on the page). No AI: only provided strings.
 */
function SearchBarWithSuggestions({
  value,
  onChange,
  onSearchSubmit,
  fetchSuggestions,
  staticPhrases = [],
  recentPhrases = [],
  placeholder = 'Search questions, tags...',
  inputClassName = 'input-field w-full',
  trackRecent = true,
}) {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const {
    debouncedQuery,
    items,
    loading,
    fetchError,
    activeIndex,
    moveActive,
    resetActive,
  } = useSearchSuggestions({
    query: value,
    fetchSuggestions,
    staticPhrases,
    recentPhrases,
  })

  const trimmed = value.trim()
  const awaitingDebounce =
    trimmed.length >= SUGGESTION_MIN_QUERY_LENGTH &&
    trimmed !== debouncedQuery.trim()

  const showPanel =
    panelOpen && trimmed.length >= SUGGESTION_MIN_QUERY_LENGTH

  // While the user is still typing, do not show stale rows (highlights vs input would disagree).
  const displayItems = awaitingDebounce ? [] : items

  // Do not keep a keyboard selection while the debounced query lags the input.
  useEffect(() => {
    if (awaitingDebounce) resetActive()
  }, [awaitingDebounce, resetActive])

  // Close when input is cleared.
  useEffect(() => {
    if (value.trim().length < SUGGESTION_MIN_QUERY_LENGTH) {
      setPanelOpen(false)
      resetActive()
    }
  }, [value, resetActive])

  // Click outside closes the list (mousedown so we run before blur).
  useEffect(() => {
    const onDocDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setPanelOpen(false)
        resetActive()
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [resetActive])

  const pickSuggestion = useCallback(
    (label) => {
      onChange(label)
      setPanelOpen(false)
      resetActive()
      if (trackRecent) pushRecentSearch(label)
      requestAnimationFrame(() => inputRef.current?.focus())
    },
    [onChange, resetActive, trackRecent],
  )

  const onFormSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const q = value.trim()
      if (!q) return
      if (showPanel && activeIndex >= 0 && displayItems[activeIndex]) {
        pickSuggestion(displayItems[activeIndex].label)
        return
      }
      if (trackRecent) pushRecentSearch(q)
      onSearchSubmit(q)
    },
    [
      value,
      showPanel,
      activeIndex,
      displayItems,
      pickSuggestion,
      onSearchSubmit,
      trackRecent,
    ],
  )

  const onKeyDown = useCallback(
    (e) => {
      if (!showPanel || trimmed.length < SUGGESTION_MIN_QUERY_LENGTH) {
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setPanelOpen(false)
        resetActive()
        return
      }

      if (awaitingDebounce) {
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        moveActive(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        moveActive(-1)
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && displayItems[activeIndex]) {
          e.preventDefault()
          pickSuggestion(displayItems[activeIndex].label)
        }
      }
    },
    [
      showPanel,
      trimmed,
      awaitingDebounce,
      moveActive,
      activeIndex,
      displayItems,
      pickSuggestion,
      resetActive,
    ],
  )

  const showSearchingRow =
    (loading || awaitingDebounce) && displayItems.length === 0

  const showEmptyMessage =
    !loading &&
    !awaitingDebounce &&
    displayItems.length === 0 &&
    trimmed.length >= SUGGESTION_MIN_QUERY_LENGTH

  return (
    <div ref={rootRef} className="relative w-full">
      <form onSubmit={onFormSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (trimmed.length >= SUGGESTION_MIN_QUERY_LENGTH) {
              setPanelOpen(true)
            }
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls="search-suggestions-listbox"
          className={inputClassName}
        />
      </form>

      {showPanel ? (
        <div
          id="search-suggestions-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto"
        >
          {showSearchingRow ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
          ) : null}

          {displayItems.map((item, index) => (
            <SuggestionRow
              key={item.id}
              active={index === activeIndex}
              label={item.label}
              highlightQuery={debouncedQuery}
              subtitle={
                item.source === 'recent'
                  ? 'Recent search'
                  : item.source === 'local'
                    ? 'On this page'
                    : item.subtitle || undefined
              }
              onPick={pickSuggestion}
            />
          ))}

          {showEmptyMessage ? (
            <div
              className={`px-4 py-3 text-sm text-gray-500 ${
                showSearchingRow ? '' : 'border-t border-gray-100'
              }`}
            >
              No suggestions found
              {fetchError ? (
                <span className="block text-xs text-gray-400 mt-1">
                  Search is temporarily unavailable.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default memo(SearchBarWithSuggestions)
export { HighlightedLabel, SuggestionRow }
