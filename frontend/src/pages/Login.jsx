// Login — the entry desk.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { EntryLayout, Field, FormError } from '../components/track/entry-layout'
import { useAuth } from '../context/AuthContext'

const DEMO = [
  { role: 'Coach', email: 'coach@example.com' },
  { role: 'Athlete', email: 'client@example.com' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      navigate(result.user.role === 'COACH' ? '/coach' : '/client')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  const demoList = (
    <div className="bg-ink/90 p-4 text-lane">
      <p className="label !text-lane/60">Demo start list · password123</p>
      <ul className="mt-2 space-y-1.5">
        {DEMO.map((d) => (
          <li key={d.email}>
            <button
              type="button"
              onClick={() => {
                setEmail(d.email)
                setPassword('password123')
              }}
              className="flex w-full items-baseline justify-between gap-4 text-left font-mono text-sm hover:text-flag"
            >
              <span>{d.role}</span>
              <span className="text-lane/70">{d.email}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <EntryLayout headline="On your marks." sub="Sign in to your coaching track — sessions, laps, fuel and photo finishes." aside={demoList}>
      <p className="label">Entry desk</p>
      <h2 className="headline mt-1 text-4xl">Sign in</h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <FormError>{error}</FormError>
        <Field id="email" label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Field
          id="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <button type="submit" disabled={loading} className="btn-go w-full">
          {loading ? 'Getting set…' : 'Go'}
        </button>
      </form>

      <p className="mt-6 text-cinder">
        New here?{' '}
        <Link to="/register" className="font-semibold text-ink underline decoration-tartan decoration-2 underline-offset-4">
          Register for the meet
        </Link>
      </p>

      <div className="mt-8 lg:hidden">{demoList}</div>
    </EntryLayout>
  )
}
