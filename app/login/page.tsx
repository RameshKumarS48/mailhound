'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell, AuthField } from '@/components/auth-shell'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <AuthShell
      eyebrow="Case access"
      title="Sign in to Mailhound"
      subtitle={
        <>
          No account?{' '}
          <Link href="/signup" className="font-medium text-hound hover:underline">
            Start free
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p className="font-mono text-sm text-invalid">{error}</p>}
        <button type="submit" disabled={loading} className="btn-hound w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center">
          <Link href="/forgot-password" className="font-mono text-xs text-ink-3 hover:text-ink">
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
