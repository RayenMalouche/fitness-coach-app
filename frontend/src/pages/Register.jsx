// Register — pick a side of the track: athlete or coach.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { EntryLayout, Field, FormError } from '../components/track/entry-layout'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

const ROLES = [
  { value: 'CLIENT', title: 'Athlete', note: 'I want coaching' },
  { value: 'COACH', title: 'Coach', note: 'I run the sessions' },
]

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'CLIENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    const { name, email, password, role } = formData
    const result = await register({ name, email, password, role })
    if (result.success) {
      navigate(result.user.role === 'COACH' ? '/coach' : '/client')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <EntryLayout headline="Get set." sub="Register as an athlete or a coach. Athletes join the start list once their coach approves them.">
      <p className="label">Registration desk</p>
      <h2 className="headline mt-1 text-4xl">Enter the meet</h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <FormError>{error}</FormError>

        <fieldset>
          <legend className="label mb-2 !text-ink">I am</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className={cn(
                  'cursor-pointer border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tartan',
                  formData.role === role.value ? 'border-tartan bg-lane' : 'border-ink/15 hover:border-ink/40',
                )}
              >
                <input type="radio" name="role" value={role.value} checked={formData.role === role.value} onChange={handleChange} className="sr-only" />
                <span className="headline block text-2xl">{role.title}</span>
                <span className="text-sm text-cinder">{role.note}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field id="name" name="name" label="Full name" required autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Jane Runner" />
        <Field id="email" name="email" label="Email" type="email" required autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="password"
            name="password"
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="6+ characters"
          />
          <Field
            id="confirmPassword"
            name="confirmPassword"
            label="Again"
            type="password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        {formData.role === 'CLIENT' && (
          <p className="flex items-stretch bg-lane text-sm">
            <span className="w-1.5 shrink-0 bg-flag" aria-hidden />
            <span className="px-4 py-3">Your coach approves new athletes before you can book sessions.</span>
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-go w-full">
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-cinder">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-ink underline decoration-tartan decoration-2 underline-offset-4">
          Sign in
        </Link>
      </p>
    </EntryLayout>
  )
}
