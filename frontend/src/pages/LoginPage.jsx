import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { Alert, Button, Field, Input } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // The backend identifies you by PHONE. There is no username login.
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // api.js redirects here with ?expired=1 when a token stops working.
  const expired = searchParams.get('expired') === '1'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(phone, password)
      navigate('/')
    } catch (err) {
      setError(err.text || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Log in to LMS</h1>
        </div>

        {expired && (
          <Alert kind="error">Your session expired. Please log in again.</Alert>
        )}
        <Alert kind="error">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Phone number">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01711110001"
              autoComplete="tel"
              required
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
