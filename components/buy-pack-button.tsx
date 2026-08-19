'use client'
import { useState } from 'react'

export function BuyPackButton({ packId }: { packId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/dodo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      if (res.status === 401) {
        window.location.href = '/signup'
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="btn-ghost w-full transition-colors group-hover:border-hound group-hover:bg-hound group-hover:text-hound-ink disabled:opacity-50"
    >
      {loading ? 'Redirecting…' : 'Buy pack'}
    </button>
  )
}
