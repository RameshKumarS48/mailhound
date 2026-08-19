'use client'
import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-sm">
        <span className="text-5xl">📬</span>
        <h1 className="text-2xl font-black">Check your email</h1>
        <p className="text-zinc-400">If that address has an account, a reset link is on its way.</p>
        <Link href="/login" className="block text-amber-400 hover:underline text-sm">Back to login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl">🐕</Link>
          <h1 className="text-2xl font-black mt-4">Reset your password</h1>
          <p className="text-zinc-400 text-sm mt-2">We&apos;ll email you a link to set a new one.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <p className="text-center text-sm text-zinc-500">
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
