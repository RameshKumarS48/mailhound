'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ZoneRow { zone: string; listed: boolean; type: 'ip' | 'domain' }
interface TeaserResult {
  target: string
  ips: string[]
  listedCount: number
  totalChecks: number
  listedOn: string[]
  results: ZoneRow[]
  checkedAt: string
}

export function BlacklistTool() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TeaserResult | null>(null)
  const [error, setError] = useState('')

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!target.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`/api/tools/blacklist?target=${encodeURIComponent(target.trim())}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Check failed'); return }
      setResult(data)
    } catch {
      setError('Check failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const clean = result ? result.listedCount === 0 : false
  const headBg = result ? (clean ? 'var(--valid-bg)' : 'var(--invalid-bg)') : undefined
  const headColor = clean ? 'var(--valid)' : 'var(--invalid)'

  return (
    <div className="w-full">
      <form onSubmit={run} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="domain.com or 203.0.113.7"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={loading}
          className="h-12 flex-1 rounded-full border border-line-2 bg-paper-2 px-5 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60"
        />
        <button type="submit" disabled={loading || !target.trim()} className="btn-hound h-12 px-7">
          {loading ? 'Scanning…' : 'Run the stakeout'}
        </button>
      </form>

      {error && <p className="mt-3 font-mono text-sm text-invalid">{error}</p>}

      {result && (
        <div className="panel mt-6 overflow-hidden">
          {/* verdict header */}
          <div className="border-b border-dashed border-line px-5 py-4 sm:px-6" style={{ background: headBg }}>
            <p className="eyebrow">Stakeout log</p>
            <p className="mt-1 font-mono text-sm text-ink">{result.target}</p>
            <p className="mt-1 text-sm font-medium" style={{ color: headColor }}>
              {clean
                ? `Clean across all ${result.totalChecks} lists`
                : `Listed on ${result.listedCount} of ${result.totalChecks} lists`}
            </p>
            {result.ips.length > 0 && (
              <p className="mt-1 font-mono text-xs text-ink-3">IPs · {result.ips.join(', ')}</p>
            )}
          </div>

          {/* watchlist board — one status light per zone */}
          <ul className="divide-y divide-line">
            {result.results.map((r, i) => (
              <li
                key={`${r.zone}-${i}`}
                className="tick-in flex items-center gap-3 px-5 py-2.5 sm:px-6"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: r.listed ? 'var(--invalid)' : 'var(--valid)',
                    boxShadow: r.listed ? '0 0 0 3px var(--invalid-bg)' : '0 0 0 3px var(--valid-bg)',
                  }}
                />
                <span className="flex-1 font-mono text-sm text-ink">{r.zone}</span>
                <span className="font-mono text-[0.7rem] uppercase tracking-wider" style={{ color: r.listed ? 'var(--invalid)' : 'var(--ink-3)' }}>
                  {r.type} · {r.listed ? 'listed' : 'clear'}
                </span>
              </li>
            ))}
          </ul>

          {/* monitoring hook */}
          <div className="border-t border-dashed border-line bg-paper-3/40 px-5 py-4 sm:px-6">
            <p className="text-sm text-ink-2">
              A blacklist snapshot goes stale the moment you close this tab. Put the
              hound on watch and get an email the instant a new listing appears.
            </p>
            <Link href="/monitoring" className="mt-3 inline-block font-medium text-hound hover:underline">
              Set up continuous monitoring →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
