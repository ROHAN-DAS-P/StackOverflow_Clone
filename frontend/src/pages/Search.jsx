import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QuestionCard from '../components/cards/QuestionCard'
import { questionsService } from '../services/questionsService'
import PageShell from '../components/layout/PageShell'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query])

  const performSearch = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await questionsService.search(query)
      setResults(data.questions || data.results || [])
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-600 dark:text-gray-400">
            Results for "<span className="font-semibold">{query}</span>"
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="card py-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          <p className="mb-4 text-lg">No results found</p>
          <p className="text-sm">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-5">
          {results.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
