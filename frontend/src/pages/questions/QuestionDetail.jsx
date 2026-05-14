import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AnswerCard from '../../components/cards/AnswerCard'
import QuestionStats from '../../components/stats/QuestionStats'
import { questionsService } from '../../services/questionsService'
import { answersService } from '../../services/answersService'
import { useAuthStore } from '../../store/authStore'
import PageShell from '../../components/layout/PageShell'
import { queryKeys } from '../../lib/queryKeys'

function normalizeAnswers(data) {
  if (Array.isArray(data)) return data
  return data?.results || data?.data || []
}

export default function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [answerContent, setAnswerContent] = useState('')
  const [formError, setFormError] = useState('')

  const questionQuery = useQuery({
    queryKey: queryKeys.question(id),
    queryFn: () => questionsService.getById(id),
    enabled: Boolean(id),
  })

  const answersQuery = useQuery({
    queryKey: queryKeys.answers(id),
    queryFn: async () => {
      const data = await answersService.getByQuestion(id)
      return normalizeAnswers(data)
    },
    enabled: Boolean(id),
  })

  const voteQuestionMutation = useMutation({
    mutationFn: (voteType) => questionsService.vote(id, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.question(id) })
    },
  })

  const postAnswerMutation = useMutation({
    mutationFn: (content) =>
      answersService.create({
        question_id: id,
        content,
      }),
    onSuccess: () => {
      setAnswerContent('')
      setFormError('')
      queryClient.invalidateQueries({ queryKey: queryKeys.answers(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.question(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
      queryClient.invalidateQueries({ queryKey: queryKeys.trending })
      queryClient.invalidateQueries({ queryKey: ['questions', 'list'] })
    },
    onError: () => {
      setFormError('Failed to submit answer')
    },
  })

  const question = questionQuery.data
  const answers = answersQuery.data ?? []
  const loading = questionQuery.isLoading || answersQuery.isLoading

  const invalidateThread = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.answers(id) })
    queryClient.invalidateQueries({ queryKey: queryKeys.question(id) })
  }

  const handleSubmitAnswer = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/auth/login')
      return
    }
    if (!answerContent.trim()) {
      setFormError('Answer cannot be empty')
      return
    }
    setFormError('')
    postAnswerMutation.mutate(answerContent.trim())
  }

  const handleVoteQuestion = (voteType) => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    voteQuestionMutation.mutate(voteType)
  }

  if (loading) {
    return (
      <PageShell>
        <div className="py-16 text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </PageShell>
    )
  }

  if (questionQuery.isError || !question) {
    return (
      <PageShell>
        <div className="card text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          Question not found
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl xl:max-w-5xl">
        <div className="card mb-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <h1 className="flex-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {question.title}
            </h1>
            {user?.id === question.author_id && (
              <div className="flex gap-2">
                <Link to={`/questions/${id}/edit`} className="btn-outline dark:border-gray-600">
                  Edit
                </Link>
                <button type="button" className="btn-outline text-red-600 dark:border-gray-600">
                  Delete
                </button>
              </div>
            )}
          </div>

          {question.tags && question.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mb-6 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{question.content}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${question.author?.username || question.author?.first_name || 'User'}`}
                alt=""
                className="h-8 w-8 rounded-full"
                width={32}
                height={32}
              />
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {question.author?.username || question.author?.first_name || 'Anonymous'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(question.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleVoteQuestion('downvote')}
                className="text-gray-600 transition hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
                title="Downvote"
              >
                👎
              </button>
              <QuestionStats
                votes={question.votes_count || 0}
                answers={question.answers_count || 0}
                layout="compact"
                variant="minimal"
                interactive={true}
                onVoteClick={handleVoteQuestion}
              />
              <button
                type="button"
                onClick={() => handleVoteQuestion('upvote')}
                className="text-gray-600 transition hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
                title="Upvote"
              >
                👍
              </button>
            </div>
          </div>
        </div>

        {answers.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            <div className="space-y-4">
              {answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  isAccepted={answer.is_accepted}
                  onVote={invalidateThread}
                />
              ))}
            </div>
          </div>
        )}

        {user ? (
          <div className="card dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Your Answer</h2>
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your answer here..."
                rows={8}
                className="input-field mb-4 w-full resize-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <button
                type="submit"
                disabled={postAnswerMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {postAnswerMutation.isPending ? 'Submitting...' : 'Post Answer'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card border-blue-200 bg-blue-50 text-center dark:border-blue-900 dark:bg-blue-950/30">
            <p className="mb-4 text-gray-700 dark:text-gray-300">Please log in to post an answer</p>
            <Link to="/auth/login" className="btn-primary">
              Log In
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  )
}
