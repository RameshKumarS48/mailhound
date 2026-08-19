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
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
      <p className="text-emerald-400 text-sm font-medium">
        Payment successful — credits have been added to your account.
      </p>
      <button onClick={() => setShow(false)} className="text-emerald-600 hover:text-emerald-400 text-lg leading-none ml-4">
        ×
      </button>
    </div>
  )
}
