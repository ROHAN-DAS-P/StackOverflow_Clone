import { useState } from 'react'
import { votesService } from '../../services/votesService'

export default function AnswerCard({ answer, onVote, isAccepted, onAccept, canAccept }) {
  const [isVoting, setIsVoting] = useState(false)
  
  const handleVote = async (voteType) => {
    setIsVoting(true)
    try {
      await votesService.vote(answer.id, 'answer', voteType)
      onVote?.()
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`${isAccepted ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white'} border border-gray-200 rounded-lg p-6`}>
      <div className="flex gap-4">
        {/* Voting */}
        <div className="flex flex-col items-center gap-2 text-center">
          <button
            onClick={() => handleVote('upvote')}
            disabled={isVoting}
            className="text-2xl hover:text-primary transition disabled:opacity-50"
          >
            ⬆️
          </button>
          <span className="text-lg font-semibold">{answer.votes_count || 0}</span>
          <button
            onClick={() => handleVote('downvote')}
            disabled={isVoting}
            className="text-2xl hover:text-primary transition disabled:opacity-50"
          >
            ⬇️
          </button>
          {isAccepted && (
            <div className="mt-2 text-green-600 text-sm font-semibold">✓ Accepted</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-gray-800 whitespace-pre-wrap mb-4">
            {answer.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <img 
                src={`https://ui-avatars.com/api/?name=${answer.author}`}
                alt="Author"
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <div className="font-medium text-gray-900">{answer.author}</div>
                <div className="text-gray-500 text-xs">{formatDate(answer.created_at)}</div>
              </div>
            </div>
            {canAccept && !isAccepted && (
              <button
                onClick={onAccept}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                ✓ Accept
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
