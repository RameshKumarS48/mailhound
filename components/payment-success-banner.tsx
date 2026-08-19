'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function PaymentSuccessBanner() {
  const params = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (params.get('success') === '1') {
      setShow(true)
      // Clean the URL without reloading
      router.replace('/dashboard', { scroll: false })
    }
  }, [params, router])

  if (!show) return null

  return (
    <div
      className="flex items-center justify-between rounded-lg border px-4 py-3"
      style={{ background: 'var(--valid-bg)', borderColor: 'var(--valid)' }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--valid)' }}>
        Payment received — your credits have been added.
      </p>
      <button
        onClick={() => setShow(false)}
        className="ml-4 text-lg leading-none"
        style={{ color: 'var(--valid)' }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
