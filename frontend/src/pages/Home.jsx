import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/cards/QuestionCard'
import { questionsService } from '../services/questionsService'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuthStore()

  useEffect(() => {
    loadTrendingQuestions()
  }, [])

  const loadTrendingQuestions = async () => {
    try {
      setLoading(true)
      const data = await questionsService.getTrending()
      setQuestions(data.results || data)
    } catch (err) {
      setError('Failed to load questions')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to StackOverflow Clone</h1>
        <p className="text-lg opacity-90 mb-6">
          Share your knowledge and help others learn. Post questions, find answers, and connect with the community.
        </p>
        {token ? (
          <Link to="/questions/create" className="btn-primary bg-white text-primary hover:bg-gray-100">
            Ask a Question
          </Link>
        ) : (
          <Link to="/auth/register" className="btn-primary bg-white text-primary hover:bg-gray-100">
            Get Started
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">1000+</div>
          <div className="text-gray-600">Questions</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">5000+</div>
          <div className="text-gray-600">Answers</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">500+</div>
          <div className="text-gray-600">Members</div>
        </div>
      </div>

      {/* Trending Questions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Trending Questions</h2>
          <Link to="/questions" className="text-primary hover:text-secondary transition font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-2">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center text-gray-500">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          <div className="space-y-4">
            {questions.slice(0, 5).map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      {!token && (
        <div className="card text-center bg-blue-50 border-blue-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to contribute?</h3>
          <p className="text-gray-600 mb-4">Join our community of developers sharing knowledge and helping each other.</p>
          <Link to="/auth/register" className="btn-primary">
            Sign Up Now
          </Link>
        </div>
      )}
    </div>
  )
}
