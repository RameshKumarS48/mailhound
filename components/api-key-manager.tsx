'use client'

import { useState } from 'react'

type ApiKey = {
  id: string
  key_prefix: string
  name: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [reveal, setReveal] = useState<{ key: string; name: string } | null>(null)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true); setError('')
    try {
      const res = await fetch('/api/developers/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create key'); return }
      setReveal({ key: data.key, name: data.name })
      setKeys(prev => [{ ...data, key: undefined }, ...prev])
      setName('')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(keyId: string) {
    const res = await fetch(`/api/developers/keys/${keyId}`, { method: 'DELETE' })
    if (res.ok) {
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: false } : k))
    }
  }

  async function handleCopy() {
    if (!reveal) return
    await navigator.clipboard.writeText(reveal.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <p className="eyebrow mb-1">Generate API key</p>
        <p className="mb-4 text-sm text-ink-2">Give it a name so you remember where it's used.</p>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Production app"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            required
            className="h-10 flex-1 rounded-full border border-line-2 bg-paper-2 px-4 font-mono text-sm text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25"
          />
          <button type="submit" disabled={creating || !name.trim()} className="btn-hound h-10 px-5 text-sm">
            {creating ? 'Generating…' : 'Generate key'}
          </button>
        </form>
        {error && <p className="mt-2 font-mono text-sm" style={{ color: 'var(--invalid)' }}>{error}</p>}
      </div>

      {reveal && (
        <div className="panel overflow-hidden border-2" style={{ borderColor: 'var(--hound)' }}>
          <div className="border-b border-dashed border-line px-5 py-3" style={{ background: 'var(--valid-bg)' }}>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--valid)' }}>
              Key generated — copy it now
            </p>
            <p className="mt-0.5 text-xs text-ink-2">This is the only time it will be shown. We do not store it.</p>
          </div>
          <div className="px-5 py-4">
            <p className="mb-2 eyebrow">{reveal.name}</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 overflow-x-auto rounded-lg border border-line bg-paper-2 px-4 py-2.5 font-mono text-sm text-ink">
                {reveal.key}
              </code>
              <button onClick={handleCopy} className="btn-ghost shrink-0 px-4 py-2 text-sm">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="border-t border-line px-5 py-3 text-right">
            <button onClick={() => setReveal(null)} className="font-mono text-xs text-ink-3 hover:text-ink">
              I've saved it — dismiss
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="eyebrow mb-4">Your keys</p>
        {keys.length === 0 ? (
          <div className="panel px-5 py-10 text-center">
            <p className="text-sm text-ink-2">No keys yet. Generate one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map(k => (
              <div key={k.id} className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-4">
                  <span
                    className="font-mono text-xs font-semibold uppercase tracking-wider"
                    style={{ color: k.is_active ? 'var(--valid)' : 'var(--ink-3)' }}
                  >
                    {k.is_active ? 'Active' : 'Revoked'}
                  </span>
                  <span className="text-sm text-ink">{k.name}</span>
                  <code className="hidden font-mono text-xs text-ink-3 sm:inline">
                    {k.key_prefix}…
                  </code>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs text-ink-3">
                  {k.last_used_at && (
                    <span>Last used {new Date(k.last_used_at).toLocaleDateString()}</span>
                  )}
                  {k.is_active && (
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="font-mono text-xs hover:underline"
                      style={{ color: 'var(--invalid)' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
