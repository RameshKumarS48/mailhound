'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { VerificationResult } from '@/lib/verification/types'

const statusColors = {
  valid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  risky: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  invalid: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const checkLabel: Record<string, string> = {
  syntax: 'Syntax',
  domain: 'Domain',
  mx: 'MX Record',
  smtp: 'SMTP',
  disposable: 'Disposable',
  role: 'Role Address',
  catchAll: 'Catch-All',
}

export function VerifyForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Verification failed'); return }
      setResult(data)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleVerify} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter any email address..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-12 text-base"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="h-12 px-6 bg-amber-500 hover:bg-amber-400 text-black font-semibold shrink-0"
        >
          {loading ? 'Checking…' : 'Verify'}
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Result for</p>
              <p className="font-mono text-white">{result.email}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[result.status]}`}>
                {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
              </span>
              <p className="text-xs text-zinc-500 mt-1">Score: {result.score}/100</p>
            </div>
          </div>

          <p className="text-sm text-zinc-300 bg-zinc-800/60 rounded-lg px-3 py-2">
            <span className="text-zinc-500">Reason: </span>{result.reason}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(result.checks).map(([key, check]) => (
              check.detail !== 'Skipped' && (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className={check.passed ? 'text-emerald-400' : 'text-red-400'}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <span className="text-zinc-400">{checkLabel[key]}:</span>
                  <span className="text-zinc-300 truncate">{check.detail}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
