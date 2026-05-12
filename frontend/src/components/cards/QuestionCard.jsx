import { Link } from 'react-router-dom'

export default function QuestionCard({ question }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="card hover:shadow-md transition">
      <div className="flex gap-4">
        {/* Stats */}
        <div className="flex flex-col items-center gap-2 text-center min-w-fit">
          <div className="flex gap-2">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-600">{question.votes_count || 0}</div>
              <div className="text-xs text-gray-500">votes</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-600">{question.answers_count || 0}</div>
              <div className="text-xs text-gray-500">answers</div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-gray-700">{question.views || 0}</div>
            <div className="text-xs text-gray-500">views</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Link 
            to={`/questions/${question.id}`}
            className="text-lg font-semibold text-primary hover:text-secondary transition line-clamp-2"
          >
            {question.title}
          </Link>
          
          <p className="text-gray-700 text-sm mt-2 line-clamp-2">
            {question.content}
          </p>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {question.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-600">
              asked {formatDate(question.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <img 
                src={`https://ui-avatars.com/api/?name=${question.author?.username || question.author?.first_name || 'User'}`}
                alt="Author"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-700 font-medium">{question.author?.username || question.author?.first_name || 'Anonymous'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
