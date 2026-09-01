'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TeaserResult {
  domain: string
  name: string
  email: string | null
  pattern: string | null
  confidence: string
  verified: boolean
  alternativeCount: number
  checkedAt: string
}

export function EmailFinderTool() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TeaserResult | null>(null)
  const [error, setError] = useState('')

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !domain.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const q = new URLSearchParams({ firstName: firstName.trim(), lastName: lastName.trim(), domain: domain.trim() })
      const res = await fetch(`/api/tools/email-finder?${q}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Search failed'); return }
      setResult(data)
    } catch {
      setError('Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const located = result?.email != null
  // The public teaser never SMTP-verifies, so the case is always a best guess —
  // rendered as a COLD TRAIL card that the verified search (signup) closes out.
  const stampColor = located ? 'var(--risky)' : 'var(--ink-3)'
  const stampLabel = located ? 'COLD TRAIL' : 'NO LEAD'
  const stampBg = located ? 'var(--risky-bg)' : 'var(--paper-3)'

  return (
    <div className="w-full">
      <form onSubmit={run} className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
          className="h-12 rounded-full border border-line-2 bg-paper-2 px-5 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading}
          className="h-12 rounded-full border border-line-2 bg-paper-2 px-5 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60"
        />
        <input
          type="text"
          placeholder="company.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={loading}
          className="h-12 rounded-full border border-line-2 bg-paper-2 px-5 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60 sm:col-span-2"
        />
        <button
          type="submit"
          disabled={loading || !firstName.trim() || !domain.trim()}
          className="btn-hound h-12 sm:col-span-2"
        >
          {loading ? 'On the trail…' : 'Track down the address'}
        </button>
      </form>

      {error && <p className="mt-3 font-mono text-sm text-invalid">{error}</p>}

      {result && (
        <div className="panel mt-6 overflow-hidden">
          {/* APB / person-of-interest card */}
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-line px-5 py-5 sm:px-6" style={{ background: stampBg }}>
            <div className="min-w-0">
              <p className="eyebrow">All-points bulletin</p>
              <p className="mt-1 truncate font-medium text-ink">{result.name || '—'}</p>
              <p className="truncate font-mono text-xs text-ink-2">@{result.domain}</p>
            </div>
            <div className="stamp stamp-in shrink-0" style={{ color: stampColor }}>
              {stampLabel}
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            {located ? (
              <>
                <p className="eyebrow">Most likely address</p>
                <p className="mt-1.5 font-mono text-lg text-ink break-all">{result.email}</p>
                {result.pattern && (
                  <p className="mt-1 font-mono text-xs text-ink-3">pattern · {result.pattern}</p>
                )}
                <div className="mt-4 rounded-md border border-dashed border-line bg-paper-3/40 px-4 py-3">
                  <p className="text-sm text-ink-2">
                    This is a <span className="font-medium text-risky">pattern guess</span> — not yet
                    knocked on. A verified search confirms the mailbox is live
                    {result.alternativeCount > 0 && <> and unlocks {result.alternativeCount} ranked alternatives</>}.
                  </p>
                  <Link href="/signup" className="mt-3 inline-block font-medium text-hound hover:underline">
                    Run a verified search — free account →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-ink-2">
                  No common pattern fit this name and domain. A verified search
                  probes the mail server directly to close the case.
                </p>
                <Link href="/signup" className="mt-3 inline-block font-medium text-hound hover:underline">
                  Run a verified search — free account →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
