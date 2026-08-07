'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">← Mailhound</Link>
          <h1 className="text-3xl font-black mt-4">Free MX Record Lookup</h1>
          <p className="text-zinc-400 mt-2">
            Check which mail servers are configured to receive email for any domain. No account needed.
          </p>
        </div>

        <form onSubmit={lookup} className="flex gap-2">
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? 'Looking up…' : 'Lookup'}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {records !== null && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-sm text-zinc-400">
                MX records for <span className="text-white font-mono">{domain}</span>
              </p>
            </div>
            {records.length === 0 ? (
              <p className="px-4 py-6 text-zinc-500 text-sm">No MX records found for this domain.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="text-left px-4 py-2 text-zinc-500 font-normal">Priority</th>
                    <th className="text-left px-4 py-2 text-zinc-500 font-normal">Mail Server</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="border-t border-zinc-800/50">
                      <td className="px-4 py-3 text-amber-400 font-mono">{r.priority}</td>
                      <td className="px-4 py-3 font-mono text-white">{r.exchange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 text-sm text-zinc-400 space-y-2">
          <p className="font-semibold text-zinc-300">What are MX records?</p>
          <p>MX (Mail Exchange) records tell the internet which servers handle email for a domain. A domain with no MX records cannot receive email — which means any address on that domain is invalid.</p>
          <p className="pt-2">
            <Link href="/signup" className="text-amber-400 hover:underline">
              Verify full email addresses →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
