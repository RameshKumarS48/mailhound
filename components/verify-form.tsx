'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VerificationResult } from '@/lib/verification/types'
import { analytics } from '@/lib/analytics'

const statusMeta: Record<
  VerificationResult['status'],
  { label: string; verdict: string; color: string; bg: string }
> = {
  valid:   { label: 'Valid',   verdict: 'Deliverable',        color: 'var(--valid)',   bg: 'var(--valid-bg)' },
  risky:   { label: 'Risky',   verdict: 'Proceed with care',  color: 'var(--risky)',   bg: 'var(--risky-bg)' },
  invalid: { label: 'Invalid', verdict: 'Do not send',        color: 'var(--invalid)', bg: 'var(--invalid-bg)' },
}

const checkLabel: Record<string, string> = {
  syntax: 'Syntax',
  domain: 'Domain',
  mx: 'MX record',
  smtp: 'SMTP probe',
  disposable: 'Disposable',
  role: 'Role address',
  catchAll: 'Catch-all',
}

export function VerifyForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
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
      analytics.track('email_verified', { status: data.status, score: data.score })
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const meta = result ? statusMeta[result.status] : null
  const checks = result
    ? Object.entries(result.checks).filter(([, c]) => c.detail !== 'Skipped')
    : []

  return (
    <div className="w-full">
      <form onSubmit={handleVerify} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-3">
            @
          </span>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            className="h-13 w-full rounded-full border border-line-2 bg-paper-2 py-3.5 pl-9 pr-4 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60"
          />
        </div>
        <button type="submit" disabled={loading || !email.trim()} className="btn-hound h-13 shrink-0 px-7">
          {loading ? 'Sniffing…' : 'Run the hound'}
        </button>
      </form>

      {error && (
        <p className="mt-3 font-mono text-sm" style={{ color: 'var(--invalid)' }}>{error}</p>
      )}

      {result && meta && (
        <div className="panel mt-4 overflow-hidden">
          {/* masthead */}
          <div
            className="flex items-start justify-between gap-4 border-b border-dashed border-line px-5 py-4 sm:px-6"
            style={{ background: meta.bg }}
          >
            <div className="min-w-0">
              <p className="eyebrow">Field report</p>
              <p className="mt-1 truncate font-mono text-sm text-ink sm:text-base">{result.email}</p>
              <p className="mt-1 text-xs text-ink-2">
                Confidence <span className="font-mono font-semibold" style={{ color: meta.color }}>{result.score}</span>/100
              </p>
            </div>
            <div className="stamp stamp-in shrink-0 text-center" style={{ color: meta.color }}>
              <span className="block text-base leading-none">{meta.label}</span>
              <span className="mt-1 block text-[0.5rem] tracking-[0.2em] opacity-80">{meta.verdict}</span>
            </div>
          </div>

          {/* verdict note */}
          <div className="border-b border-line px-5 py-3 sm:px-6">
            <p className="text-sm leading-relaxed text-ink-2">
              <span className="eyebrow mr-2">Verdict</span>
              {result.reason}
            </p>
          </div>

          {/* evidence ledger */}
          {!compact && (
            <div className="px-5 py-4 sm:px-6">
              <p className="eyebrow mb-3">Evidence · {checks.length} checks</p>
              <ul className="space-y-2">
                {checks.map(([key, check], i) => (
                  <li
                    key={key}
                    className="tick-in flex items-baseline text-sm"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <span className="font-mono text-ink">{checkLabel[key] ?? key}</span>
                    <span className="leader" />
                    <span className="max-w-[45%] truncate text-right font-mono text-xs text-ink-2">
                      {check.detail}
                    </span>
                    <span
                      className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold"
                      style={{
                        color: check.passed ? 'var(--valid)' : 'var(--invalid)',
                        background: check.passed ? 'var(--valid-bg)' : 'var(--invalid-bg)',
                      }}
                    >
                      {check.passed ? '✓' : '✕'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
