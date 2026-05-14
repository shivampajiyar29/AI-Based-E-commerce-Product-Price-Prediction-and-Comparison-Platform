import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../utils/api'
import { Brain, Loader2 } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
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
          <h2 className="text-lg font-semibold mb-5 text-center">Create an account</h2>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'username', label: 'Username',  type: 'text',     placeholder: 'johndoe' },
              { key: 'email',    label: 'Email',     type: 'email',    placeholder: 'you@example.com' },
              { key: 'password', label: 'Password',  type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type={type} required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
