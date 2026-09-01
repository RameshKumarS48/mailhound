'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

/* Accessible mobile menu. The old CSS-only nav hid Tools and Developers on
   small screens entirely — mobile users could not reach them. This exposes the
   full link set, traps nothing the user can't escape (Esc + overlay close),
   locks body scroll while open, and closes on navigation. */

const TOOLS: [string, string][] = [
  ['MX Lookup', '/mx-lookup'],
  ['Domain Health', '/domain-health'],
  ['Blacklist Check', '/blacklist'],
  ['Email Finder', '/email-finder'],
]

export function MobileNav({ authed = false }: { authed?: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-3"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-line bg-paper px-6 py-6">
          <p className="eyebrow">Free tools</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TOOLS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="panel px-3 py-2.5 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col divide-y divide-line border-y border-line">
            <Link href="/developers" className="py-3.5 text-ink">Developers</Link>
            <Link href="/docs" className="py-3.5 text-ink">API Docs</Link>
            <Link href="/pricing" className="py-3.5 text-ink">Pricing</Link>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {authed ? (
              <Link href="/dashboard" className="btn-hound w-full">Dashboard</Link>
            ) : (
              <>
                <Link href="/signup" className="btn-hound w-full">Start free — 300 verifications</Link>
                <Link href="/login" className="btn-ghost w-full">Log in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
