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
      className="block w-full text-center bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black text-white text-sm font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Redirecting…' : 'Buy Pack'}
    </button>
  )
}
