import { useEffect, useState, useMemo, useLayoutEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import QuestionCard from '../../components/cards/QuestionCard'
import { questionsService } from '../../services/questionsService'
import PageShell from '../../components/layout/PageShell'
import { queryKeys } from '../../lib/queryKeys'

function normalizeListResponse(data) {
  const list = data?.results ?? data ?? []
  const arr = Array.isArray(list) ? list : []
  const count = typeof data?.count === 'number' ? data.count : arr.length
  return { list: arr, count }
}

export default function QuestionsList() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const isUnanswered = location.pathname === '/questions/unanswered'
  const tag = searchParams.get('tag') || ''
  const sortFromUrl = searchParams.get('sort') || ''

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    if (sortFromUrl === 'recent') setSortBy('recent')
  }, [sortFromUrl])

  const listFilters = useMemo(
    () => ({ page, tag, mode: isUnanswered ? 'unanswered' : 'all' }),
    [page, tag, isUnanswered],
  )

  useLayoutEffect(() => {
    setPage(1)
  }, [tag, isUnanswered, sortFromUrl])

  const {
    data: rawData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.questionsList(listFilters),
    queryFn: async () => {
      if (isUnanswered) {
        return questionsService.getUnanswered(page)
      }
      return questionsService.getAll(page, '', tag)
    },
  })

  const { list: questions, count } = useMemo(
    () => normalizeListResponse(rawData ?? {}),
    [rawData],
  )

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / 20)), [count])

  const pageTitle = useMemo(() => {
    if (isUnanswered) return 'Unanswered Questions'
    if (tag) return `Questions tagged [${tag}]`
    if (sortFromUrl === 'recent') return 'Recent Questions'
    return 'All Questions'
  }, [isUnanswered, tag, sortFromUrl])

  const onSortChange = (e) => {
    const v = e.target.value
    setSortBy(v)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (v === 'recent') next.set('sort', 'recent')
        else next.delete('sort')
        if (tag) next.set('tag', tag)
        return next
      },
      { replace: true },
    )
  }

  const sortedQuestions = useMemo(() => {
    const q = [...questions]
    switch (sortBy) {
      case 'popular':
        return q.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
      case 'answers':
        return q.sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0))
      default:
        return q.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        )
    }
  }, [questions, sortBy])

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">{pageTitle}</h1>
        {!isUnanswered ? (
          <select
            value={sortBy}
            onChange={onSortChange}
            className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            aria-label="Sort questions"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="answers">Most Answers</option>
          </select>
        ) : null}
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          Failed to load questions
        </div>
      ) : sortedQuestions.length === 0 ? (
        <div className="card py-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          No questions found. Be the first to ask!
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 lg:gap-5">
            {sortedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
              >
                Previous
              </button>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-md px-3 py-2 ${
                      page === p
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
