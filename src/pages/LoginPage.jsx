import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useHardwareStore } from '../context/useHardwareStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useHardwareStore()
  const [form, setForm] = useState({ name: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await login(form.name.trim(), form.password)
    setIsSubmitting(false)

    if (result.ok) {
      navigate('/')
      return
    }

    setError(result.message)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon large">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="eyebrow">Secure access</p>
            <h2>Hardware Hub</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input
              type="text"
              name="name"
              autoComplete="username"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error ? <p className="status-note error">{error}</p> : null}

          <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
