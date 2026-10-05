import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useHardwareStore } from '../context/useHardwareStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, demoCredentials, hasSupabase } = useHardwareStore()
  const [form, setForm] = useState({ email: 'admin@hardware.local', password: 'admin123' })
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

    const result = await login(form.email, form.password)
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
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          {hasSupabase ? (
            <p className="status-note success">Supabase backend configuration detected.</p>
          ) : (
            <p className="status-note warning">Demo mode active. Local data storage is enabled for development.</p>
          )}

          {error ? <p className="status-note error">{error}</p> : null}

          <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Demo users</h4>
          <ul>
            {demoCredentials.map((entry) => (
              <li key={entry.email}>
                <strong>{entry.email}</strong>
                <span>{entry.password}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
