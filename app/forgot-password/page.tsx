'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AuthShell, AuthField } from '@/components/auth-shell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <AuthShell eyebrow="Reset requested" title="Check your email">
      <p className="text-sm leading-relaxed text-ink-2">
        If that address has an account, a reset link is on its way.
      </p>
      <Link href="/login" className="btn-ghost mt-6 w-full">Back to sign in</Link>
    </AuthShell>
  )

  return (
    <AuthShell
      eyebrow="Recover access"
      title="Reset your password"
      subtitle="We’ll email you a link to set a new one."
      footer={<Link href="/login" className="font-medium text-hound hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <button type="submit" disabled={loading || !email} className="btn-hound w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  )
}
