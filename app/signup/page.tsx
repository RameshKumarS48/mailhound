'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <span className="text-5xl">🐾</span>
          <h1 className="text-2xl font-black">Check your email</h1>
          <p className="text-zinc-400">
            We sent a confirmation link to <span className="text-white">{email}</span>.
            Click it to activate your account and claim your 300 free credits.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl">🐕</Link>
          <h1 className="text-2xl font-black mt-4">Start verifying for free</h1>
          <p className="text-zinc-400 text-sm mt-2">
            300 free credits · No credit card · Credits never expire
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Free Account'}
          </button>
          <p className="text-xs text-zinc-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
