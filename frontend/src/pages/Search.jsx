import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QuestionCard from '../components/cards/QuestionCard'
import { questionsService } from '../services/questionsService'

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
      // Extract questions array from response
      setResults(data.questions || data.results || [])
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-600">
            Results for "<span className="font-semibold">{query}</span>"
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="text-gray-600 mt-2">Searching...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          <p className="text-lg mb-4">No results found</p>
          <p className="text-sm">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  )
}
