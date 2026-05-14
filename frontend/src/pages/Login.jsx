import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../utils/api'
import { Brain, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // FastAPI OAuth2 expects form data
      const formData = new FormData()
      formData.append('username', form.email)
      formData.append('password', form.password)
      const { data } = await login(formData)
      localStorage.setItem('token', data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Brain size={24} className="text-brand-500" />
          <span className="text-xl font-semibold">PriceSense</span>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-5 text-center">Login to your account</h2>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
