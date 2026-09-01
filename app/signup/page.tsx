'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell, AuthField } from '@/components/auth-shell'
import { analytics } from '@/lib/analytics'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    analytics.track('signup_started', { email })

    const check = await fetch('/api/auth/validate-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!check.ok) {
      const { error: msg } = await check.json()
      setError(msg ?? 'Email not allowed')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    analytics.track('signup_completed', { email })
    setDone(true)
  }

  if (done) {
    return (
      <AuthShell
        eyebrow="Awaiting confirmation"
        title="Check your email"
      >
        <p className="text-sm leading-relaxed text-ink-2">
          We sent a confirmation link to{' '}
          <span className="font-mono text-ink">{email}</span>. Click it to activate
          your account and claim your 300 free verifications.
        </p>
        <p className="mt-5 border-t border-dashed border-line pt-4 font-mono text-xs text-ink-3">
          No email in a few minutes? Check spam, or{' '}
          <Link href="/login" className="text-hound hover:underline">try signing in</Link>.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Open a case"
      title="Start verifying for free"
      subtitle="300 free verifications · no credit card · never expire"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-hound hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
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
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="font-mono text-sm text-invalid">{error}</p>}
        <button type="submit" disabled={loading} className="btn-hound w-full">
          {loading ? 'Creating account…' : 'Create free account'}
        </button>
      </form>
    </AuthShell>
  )
}
