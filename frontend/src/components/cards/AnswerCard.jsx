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
      {/* Content */}
      <p className="text-gray-800 whitespace-pre-wrap mb-6">
        {answer.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <img 
            src={`https://ui-avatars.com/api/?name=${answer.author?.username || answer.author?.first_name || 'User'}`}
            alt="Author"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm">
            <div className="font-medium text-gray-900">{answer.author?.username || answer.author?.first_name || 'Anonymous'}</div>
            <div className="text-gray-500 text-xs">{formatDate(answer.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('upvote')}
              disabled={isVoting}
              className="text-gray-600 hover:text-primary transition disabled:opacity-50"
              title="Upvote"
            >
              👍 {answer.votes_count || 0}
            </button>
            <button
              onClick={() => handleVote('downvote')}
              disabled={isVoting}
              className="text-gray-600 hover:text-primary transition disabled:opacity-50"
              title="Downvote"
            >
              👎
            </button>
          </div>
          {isAccepted && (
            <div className="text-green-600 text-sm font-semibold">✓ Accepted</div>
          )}
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
  )
}
