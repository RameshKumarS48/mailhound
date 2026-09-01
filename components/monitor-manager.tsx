'use client'

import { useState } from 'react'

interface MonitoredDomain {
  id: string
  target: string
  label: string | null
  is_active: boolean
  last_scanned_at: string | null
  last_status: string | null
  last_listed_on: string[] | null
  created_at: string
}

export function MonitorManager({
  hasPlan,
  initialDomains,
  domainLimit,
}: {
  hasPlan: boolean
  initialDomains: MonitoredDomain[]
  domainLimit: number
}) {
  const [domains, setDomains] = useState(initialDomains)
  const [target, setTarget] = useState('')
  const [label, setLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  async function subscribe() {
    setBusy('subscribe')
    try {
      const res = await fetch('/api/dodo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: 'watch' }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setBusy(null)
    }
  }

  if (!hasPlan) {
    return (
      <div className="panel overflow-hidden">
        <div className="border-b border-dashed border-line px-6 py-4" style={{ background: 'var(--valid-bg)' }}>
          <p className="eyebrow" style={{ color: 'var(--valid)' }}>Watch · $9/mo</p>
        </div>
        <div className="px-6 py-6">
          <h2 className="display text-xl font-semibold text-ink">Put the hound on permanent watch</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-2">
            <li>• Monitor up to {domainLimit} domains or IPs around the clock</li>
            <li>• Automatic daily re-scans across every major blacklist</li>
            <li>• An email the moment a new listing appears — before it kills your delivery</li>
          </ul>
          <button onClick={subscribe} disabled={busy === 'subscribe'} className="btn-hound mt-6">
            {busy === 'subscribe' ? 'Redirecting…' : 'Start watching'}
          </button>
        </div>
      </div>
    )
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!target.trim()) return
    setAdding(true); setError('')
    try {
      const res = await fetch('/api/monitoring/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), label: label.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not add target'); return }
      setDomains((prev) => [data, ...prev])
      setTarget(''); setLabel('')
    } finally {
      setAdding(false)
    }
  }

  async function rescan(id: string) {
    setBusy(id)
    try {
      const res = await fetch(`/api/monitoring/domains/${id}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setDomains((prev) => prev.map((d) => d.id === id ? {
          ...d,
          last_scanned_at: new Date().toISOString(),
          last_status: data.listedCount > 0 ? 'listed' : 'clean',
          last_listed_on: data.listedOn,
        } : d))
      }
    } finally {
      setBusy(null)
    }
  }

  async function remove(id: string) {
    setBusy(id)
    try {
      const res = await fetch(`/api/monitoring/domains/${id}`, { method: 'DELETE' })
      if (res.ok) setDomains((prev) => prev.filter((d) => d.id !== id))
    } finally {
      setBusy(null)
    }
  }

  const atLimit = domains.length >= domainLimit

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <p className="eyebrow mb-1">Add a target</p>
        <p className="mb-4 text-sm text-ink-2">
          Watching {domains.length} of {domainLimit}. Domain or IPv4 address.
        </p>
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="domain.com or 203.0.113.7"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={adding || atLimit}
            className="h-10 flex-1 rounded-full border border-line-2 bg-paper-2 px-4 font-mono text-sm text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60"
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={adding || atLimit}
            className="h-10 rounded-full border border-line-2 bg-paper-2 px-4 font-mono text-sm text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 disabled:opacity-60 sm:w-44"
          />
          <button type="submit" disabled={adding || atLimit || !target.trim()} className="btn-hound h-10 px-5 text-sm">
            {adding ? 'Adding…' : 'Watch'}
          </button>
        </form>
        {atLimit && <p className="mt-2 text-sm text-ink-3">You’ve reached your plan’s limit of {domainLimit} targets.</p>}
        {error && <p className="mt-2 font-mono text-sm text-invalid">{error}</p>}
      </div>

      <div>
        <p className="eyebrow mb-4">Watchlist</p>
        {domains.length === 0 ? (
          <div className="panel px-5 py-10 text-center">
            <p className="text-sm text-ink-2">No targets yet. Add a domain above to start the stakeout.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {domains.map((d) => {
              const listed = d.last_status === 'listed'
              const light = d.last_status == null ? 'var(--ink-3)' : listed ? 'var(--invalid)' : 'var(--valid)'
              return (
                <div key={d.id} className="panel px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: light }} />
                      <div>
                        <span className="font-mono text-sm text-ink">{d.target}</span>
                        {d.label && <span className="ml-2 text-xs text-ink-3">{d.label}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-xs text-ink-3">
                      <span style={{ color: d.last_status == null ? 'var(--ink-3)' : light }}>
                        {d.last_status == null ? 'not yet scanned' : listed ? `listed (${d.last_listed_on?.length ?? 0})` : 'clean'}
                      </span>
                      {d.last_scanned_at && <span>{new Date(d.last_scanned_at).toLocaleDateString()}</span>}
                      <button onClick={() => rescan(d.id)} disabled={busy === d.id} className="text-hound hover:underline disabled:opacity-50">
                        {busy === d.id ? '…' : 'Rescan'}
                      </button>
                      <button onClick={() => remove(d.id)} disabled={busy === d.id} className="hover:underline disabled:opacity-50" style={{ color: 'var(--invalid)' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {listed && d.last_listed_on && d.last_listed_on.length > 0 && (
                    <p className="mt-2 pl-6 font-mono text-xs text-invalid">
                      {d.last_listed_on.join(' · ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
