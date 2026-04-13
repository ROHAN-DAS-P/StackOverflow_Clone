import { useEffect, useState } from 'react'
import QuestionCard from '../../components/cards/QuestionCard'
import { questionsService } from '../../services/questionsService'

export default function QuestionsList() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    loadQuestions()
  }, [page, sortBy])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await questionsService.getAll(page)
      setQuestions(data.results || data)
      const count = data.count || questions.length
      setTotalPages(Math.ceil(count / 20))
    } catch (err) {
      setError('Failed to load questions')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="answers">Most Answers</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="text-gray-600 mt-2">Loading questions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          No questions found. Be the first to ask!
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {questions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-md ${
                      page === p
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
