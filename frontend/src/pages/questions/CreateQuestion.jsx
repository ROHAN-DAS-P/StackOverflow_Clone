import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questionsService } from '../../services/questionsService'

export default function CreateQuestion() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    try {
      setLoading(true)
      const data = await questionsService.create({
        title: formData.title,
        content: formData.content,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
      })
      navigate(`/questions/${data.id}`)
    } catch (err) {
      setError('Failed to create question')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ask a Question</h1>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your question?"
              className="input-field w-full"
              maxLength="300"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/300
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Details
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Provide as much detail and context as possible..."
              rows="10"
              className="input-field w-full resize-none"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Separate tags with commas (e.g., python, django, help)"
              className="input-field w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add up to 5 tags to categorize your question
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-2">Tips for a good question</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be specific and clear</li>
            <li>• Provide relevant context</li>
            <li>• Include code examples if applicable</li>
            <li>• Explain what you've already tried</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-2">Avoid common mistakes</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Don't ask too broadly</li>
            <li>• Don't spam or promote</li>
            <li>• Don't ask duplicate questions</li>
            <li>• Be respectful to others</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
