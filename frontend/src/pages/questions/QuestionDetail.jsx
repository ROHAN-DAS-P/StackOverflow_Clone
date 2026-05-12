import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AnswerCard from '../../components/cards/AnswerCard'
import { questionsService } from '../../services/questionsService'
import { answersService } from '../../services/answersService'
import { useAuthStore } from '../../store/authStore'

export default function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuestion()
  }, [id])

  const loadQuestion = async () => {
    try {
      setLoading(true)
      const data = await questionsService.getById(id)
      setQuestion(data)
      
      const answersData = await answersService.getByQuestion(id)
      setAnswers(answersData.results || answersData)
    } catch (err) {
      setError('Failed to load question')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/auth/login')
      return
    }

    if (!answerContent.trim()) {
      setError('Answer cannot be empty')
      return
    }

    try {
      setSubmitting(true)
      await answersService.create({
        question: id,
        content: answerContent,
      })
      setAnswerContent('')
      loadQuestion()
    } catch (err) {
      setError('Failed to submit answer')
      console.error('Error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin text-2xl">⏳</div>
        <p className="text-gray-600 mt-2">Loading question...</p>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center text-gray-500">
          Question not found
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Question */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">{question.title}</h1>
          {user?.id === question.author_id && (
            <div className="flex gap-2">
              <Link 
                to={`/questions/${id}/edit`}
                className="btn-outline"
              >
                Edit
              </Link>
              <button className="btn-outline text-red-600">Delete</button>
            </div>
          )}
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <p className="text-gray-800 whitespace-pre-wrap mb-6">
          {question.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <img 
              src={`https://ui-avatars.com/api/?name=${question.author?.username || question.author?.first_name || 'User'}`}
              alt="Author"
              className="w-8 h-8 rounded-full"
            />
            <div className="text-sm">
              <div className="font-medium text-gray-900">{question.author?.username || question.author?.first_name || 'Anonymous'}</div>
              <div className="text-gray-500 text-xs">
                {new Date(question.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-lg font-semibold">{question.votes_count || 0}</div>
              <div className="text-xs text-gray-500">votes</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{answers.length}</div>
              <div className="text-xs text-gray-500">answers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      {answers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
          <div className="space-y-4">
            {answers.map(answer => (
              <AnswerCard 
                key={answer.id}
                answer={answer}
                isAccepted={answer.is_accepted}
                onVote={loadQuestion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Answer Form */}
      {user ? (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Write your answer here..."
              rows="8"
              className="input-field w-full mb-4 resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card text-center bg-blue-50 border-blue-200">
          <p className="text-gray-700 mb-4">Please log in to post an answer</p>
          <Link to="/auth/login" className="btn-primary">
            Log In
          </Link>
        </div>
      )}
    </div>
  )
}
