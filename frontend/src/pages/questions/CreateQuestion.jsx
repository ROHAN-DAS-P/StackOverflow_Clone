import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsService } from '../../services/questionsService'
import PageShell from '../../components/layout/PageShell'
import { queryKeys } from '../../lib/queryKeys'

export default function CreateQuestion() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  })
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: (payload) => questionsService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
      queryClient.invalidateQueries({ queryKey: queryKeys.trending })
      queryClient.invalidateQueries({ queryKey: ['questions', 'list'] })
      navigate(`/questions/${data.id}`)
    },
    onError: () => {
      setError('Failed to create question')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Ask a Question</h1>

        <div className="card dark:border-gray-700 dark:bg-gray-900">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What's your question?"
                className="input-field w-full dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                maxLength="300"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.title.length}/300
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Body
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Describe your question in detail..."
                rows={12}
                className="input-field w-full resize-y dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="python, django, rest (comma-separated)"
                className="input-field w-full dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add up to 5 tags to categorize your question
              </p>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {createMutation.isPending ? 'Posting...' : 'Post Your Question'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
