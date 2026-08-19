'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteNav, SiteFooter } from '@/components/site-chrome'

interface MXRecord { exchange: string; priority: number }

export default function MXLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<MXRecord[] | null>(null)
  const [error, setError] = useState('')

  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true); setError(''); setRecords(null)
    try {
      const res = await fetch(`/api/tools/mx-lookup?domain=${encodeURIComponent(domain.trim())}`)
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setRecords(data.records)
    } catch {
      setError('Lookup failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SiteNav />

      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <p className="eyebrow">Free tool · no account</p>
        <h1 className="display mt-4 text-4xl font-semibold text-ink">MX record lookup</h1>
        <p className="mt-3 text-ink-2">
          See which mail servers are configured to receive email for any domain —
          the first thing the hound checks before it knocks.
        </p>

        <form onSubmit={lookup} className="mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            className="h-12 flex-1 rounded-full border border-line-2 bg-paper-2 px-5 font-mono text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25"
          />
          <button type="submit" disabled={loading || !domain.trim()} className="btn-hound h-12 px-7">
            {loading ? 'Looking up…' : 'Look up'}
          </button>
        </form>

        {error && <p className="mt-3 font-mono text-sm text-invalid">{error}</p>}

        {records !== null && (
          <div className="panel mt-6 overflow-hidden">
            <div className="border-b border-dashed border-line px-5 py-3">
              <p className="eyebrow">
                MX records · <span className="font-mono text-ink">{domain}</span>
              </p>
            </div>
            {records.length === 0 ? (
              <p className="px-5 py-8 text-sm text-ink-2">
                No MX records found — this domain can’t receive email, so any address on it is invalid.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-5 py-2.5 text-left"><span className="eyebrow">Priority</span></th>
                    <th className="px-5 py-2.5 text-left"><span className="eyebrow">Mail server</span></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className={i < records.length - 1 ? 'border-b border-line' : ''}>
                      <td className="px-5 py-3 font-mono text-sm text-hound">{r.priority}</td>
                      <td className="px-5 py-3 font-mono text-sm text-ink">{r.exchange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="panel mt-10 p-6">
          <p className="eyebrow">Field note</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            MX (Mail Exchange) records tell the internet which servers handle email
            for a domain. A domain with no MX records can’t receive email — which
            means every address on it is dead on arrival.
          </p>
          <Link href="/signup" className="mt-4 inline-block font-medium text-hound hover:underline">
            Verify full email addresses →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
