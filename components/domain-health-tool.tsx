'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HealthStatus, HealthGrade } from '@/lib/verification/types'

interface TeaserCheck { status: HealthStatus; label: string; detail: string }
interface TeaserResult {
  domain: string
  grade: HealthGrade
  score: number
  checks: Record<string, TeaserCheck>
  remediationCount: number
  checkedAt: string
}

const statusMeta: Record<HealthStatus, { color: string; bg: string; symbol: string }> = {
  pass:    { color: 'var(--valid)',   bg: 'var(--valid-bg)',   symbol: '✓' },
  warn:    { color: 'var(--risky)',   bg: 'var(--risky-bg)',   symbol: '!' },
  fail:    { color: 'var(--invalid)', bg: 'var(--invalid-bg)', symbol: '✕' },
  unknown: { color: 'var(--ink-3)',   bg: 'var(--paper-3)',    symbol: '?' },
}

const gradeMeta: Record<HealthGrade, { color: string; bg: string; verdict: string }> = {
  A: { color: 'var(--valid)',   bg: 'var(--valid-bg)',   verdict: 'Trusted sender' },
  B: { color: 'var(--valid)',   bg: 'var(--valid-bg)',   verdict: 'Solid setup' },
  C: { color: 'var(--risky)',   bg: 'var(--risky-bg)',   verdict: 'Needs work' },
  D: { color: 'var(--risky)',   bg: 'var(--risky-bg)',   verdict: 'At risk' },
  F: { color: 'var(--invalid)', bg: 'var(--invalid-bg)', verdict: 'Failing' },
}

export function DomainHealthTool() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TeaserResult | null>(null)
  const [error, setError] = useState('')

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`/api/tools/domain-health?domain=${encodeURIComponent(domain.trim())}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Check failed'); return }
      setResult(data)
    } catch {
      setError('Check failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const grade = result ? gradeMeta[result.grade] : null
  const checks = result ? Object.entries(result.checks) : []

  return (
    <div className="w-full">
      <form onSubmit={run} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="yourdomain.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={loading}
          className="h-12 flex-1 rounded-full border border-line-2 bg-paper-2 px-5 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60"
        />
        <button type="submit" disabled={loading || !domain.trim()} className="btn-hound h-12 px-7">
          {loading ? 'Inspecting…' : 'Run inspection'}
        </button>
      </form>

      {error && <p className="mt-3 font-mono text-sm text-invalid">{error}</p>}

      {result && grade && (
        <div className="panel mt-6 overflow-hidden">
          {/* masthead — grade seal is the signature */}
          <div
            className="flex items-start justify-between gap-4 border-b border-dashed border-line px-5 py-5 sm:px-6"
            style={{ background: grade.bg }}
          >
            <div className="min-w-0">
              <p className="eyebrow">Deliverability dossier</p>
              <p className="mt-1 truncate font-mono text-sm text-ink sm:text-base">{result.domain}</p>
              <p className="mt-1 text-xs text-ink-2">
                Score <span className="font-mono font-semibold" style={{ color: grade.color }}>{result.score}</span>/100
              </p>
            </div>
            <div className="stamp stamp-in shrink-0 text-center" style={{ color: grade.color }}>
              <span className="block text-3xl leading-none">{result.grade}</span>
              <span className="mt-1 block text-[0.5rem] tracking-[0.2em] opacity-80">{grade.verdict}</span>
            </div>
          </div>

          {/* evidence ledger */}
          <div className="px-5 py-4 sm:px-6">
            <p className="eyebrow mb-3">Evidence · {checks.length} checks</p>
            <ul className="space-y-2">
              {checks.map(([key, c], i) => {
                const meta = statusMeta[c.status]
                return (
                  <li
                    key={key}
                    className="tick-in flex items-baseline text-sm"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <span className="font-mono text-ink">{c.label}</span>
                    <span className="leader" />
                    <span className="max-w-[45%] truncate text-right font-mono text-xs text-ink-2">{c.detail}</span>
                    <span
                      className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold"
                      style={{ color: meta.color, background: meta.bg }}
                    >
                      {meta.symbol}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* freemium hook */}
          <div className="border-t border-dashed border-line bg-paper-3/40 px-5 py-4 sm:px-6">
            <p className="text-sm text-ink-2">
              <span className="eyebrow mr-2">Sealed</span>
              Full DNS records
              {result.remediationCount > 0 && <> and {result.remediationCount} prioritized fixes</>}
              {' '}are in the complete case file.
            </p>
            <Link href="/signup" className="mt-3 inline-block font-medium text-hound hover:underline">
              Open the full report — free account →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
