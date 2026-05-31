import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { queryClient } from '../../lib/queryClient'
import { queryKeys } from '../../lib/queryKeys'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'

export default function Register() {
  const navigate = useNavigate()
  const { setToken } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
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
    
    if (!formData.username || !formData.email || !formData.password || !formData.password_confirm) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      setLoading(true)
      setError('')
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
      })
      
      // Auto login after registration
      const loginData = await authService.login({
        email: formData.email,
        password: formData.password,
      })
      setToken(loginData.access, loginData.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        const messages = Object.values(errorMsg).flat()
        setError(messages[0] || 'Registration failed')
      } else {
        setError('Registration failed. Please try again.')
      }
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response) => {
    try {
      setError('')
      const data = await authService.googleLogin(response.access)
      setToken(data.access, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Google registration failed. Please try again.'
      )
      console.error('Google registration error:', err)
    }
  }

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage || 'Google authentication failed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-primary mb-2">SO</div>
            <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
            <p className="text-gray-600 mt-2">Join our community of developers</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field w-full"
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} isLoading={loading} />

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:text-secondary font-medium">
              Log in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
