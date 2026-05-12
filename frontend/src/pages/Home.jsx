import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import QuestionCard from '../components/cards/QuestionCard'
import { questionsService } from '../services/questionsService'
import { statsService } from '../services/statsService'
import { useAuthStore } from '../store/authStore'
import PageShell from '../components/layout/PageShell'
import AnimatedStat from '../components/home/AnimatedStat'
import { queryKeys } from '../lib/queryKeys'

export default function Home() {
  const { token } = useAuthStore()

  const {
    data: trendingQuestions = [],
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: queryKeys.trending,
    queryFn: async () => {
      const data = await questionsService.getTrending()
      const list = data.results ?? data ?? []
      return Array.isArray(list) ? list : []
    },
    staleTime: 60_000,
  })

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => statsService.get(),
    staleTime: 20_000,
  })

  return (
    <PageShell>
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white shadow-lg sm:p-10 lg:p-12">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl">
          Welcome to StackOverflow Clone
        </h1>
        <p className="mb-6 max-w-3xl text-lg opacity-90 lg:text-xl">
          Share your knowledge and help others learn. Post questions, find answers, and connect
          with the community.
        </p>
        {token ? (
          <Link
            to="/questions/create"
            className="btn-primary inline-block bg-white text-primary hover:bg-gray-100"
          >
            Ask a Question
          </Link>
        ) : (
          <Link
            to="/auth/register"
            className="btn-primary inline-block bg-white text-primary hover:bg-gray-100"
          >
            Get Started
          </Link>
        )}
      </div>

      <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6" aria-live="polite">
        {statsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card h-28 animate-pulse bg-gray-200/80 dark:bg-gray-800/80"
                aria-hidden
              />
            ))}
          </>
        ) : statsError ? (
          <div className="card col-span-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Stats could not be loaded.
          </div>
        ) : (
          <>
            <div className="card text-center transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
              <div className="text-3xl font-bold text-primary dark:text-cyan-400">
                <AnimatedStat value={stats?.questions ?? 0} />
              </div>
              <div className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                Questions
              </div>
            </div>
            <div className="card text-center transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
              <div className="text-3xl font-bold text-primary dark:text-cyan-400">
                <AnimatedStat value={stats?.answers ?? 0} />
              </div>
              <div className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                Answers
              </div>
            </div>
            <div className="card text-center transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
              <div className="text-3xl font-bold text-primary dark:text-cyan-400">
                <AnimatedStat value={stats?.members ?? 0} />
              </div>
              <div className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                Members
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mb-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
            Trending Questions
          </h2>
          <Link
            to="/questions"
            className="font-medium text-primary transition hover:text-secondary dark:text-cyan-400"
          >
            View All →
          </Link>
        </div>

        {trendingLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin text-2xl">⏳</div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        ) : trendingError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Failed to load questions
          </div>
        ) : trendingQuestions.length === 0 ? (
          <div className="card text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-1 xl:gap-5">
            {trendingQuestions.slice(0, 5).map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>

      {!token && (
        <div className="card border-blue-200 bg-blue-50 text-center dark:border-blue-900 dark:bg-blue-950/30">
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Ready to contribute?
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Join our community of developers sharing knowledge and helping each other.
          </p>
          <Link to="/auth/register" className="btn-primary">
            Sign Up Now
          </Link>
        </div>
      )}
    </PageShell>
  )
}
