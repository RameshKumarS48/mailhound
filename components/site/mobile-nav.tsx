'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { SOLUTION_GROUPS } from '@/components/site/solutions'
import { useAuthed } from '@/components/site/use-authed'

/* Accessible mobile menu. The old CSS-only nav hid Solutions and Developers on
   small screens entirely — mobile users could not reach them. This exposes the
   full grouped link set, traps nothing the user can't escape (Esc + overlay
   close), locks body scroll while open, and closes on navigation.

   Two modes:
   - Marketing (default): resolves auth client-side so a signed-in visitor sees
     a Dashboard link instead of Start free / Log in.
   - App: pass `appNav` (the signed-in tabs) to render them plus a Sign out
     action — this is the *only* navigation signed-in users had on mobile
     before, which was nothing. */

export function MobileNav({
  appNav,
}: {
  appNav?: { href: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const authedState = useAuthed()
  const isApp = !!appNav
  const authed = isApp || authedState === true

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
    <div>
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
          {isApp && (
            <div className="mb-6 flex flex-col divide-y divide-line border-y border-line">
              {appNav.map(item => {
                const on = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={on ? 'page' : undefined}
                    className={`py-3.5 ${on ? 'font-medium text-ink' : 'text-ink-2'}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}

          <p className="eyebrow mb-4">Solutions</p>
          <div className="space-y-5">
            {SOLUTION_GROUPS.map(group => (
              <div key={group.title}>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{group.title}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {group.items.map(item => (
                    <Link
                      key={`${group.title}-${item.label}`}
                      href={item.href}
                      className="panel px-3 py-2.5 text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col divide-y divide-line border-y border-line">
            <Link href="/developers" className="py-3.5 text-ink">Developers</Link>
            <Link href="/docs" className="py-3.5 text-ink">API Docs</Link>
            <Link href="/pricing" className="py-3.5 text-ink">Pricing</Link>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {isApp ? (
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="btn-ghost w-full">Sign out</button>
              </form>
            ) : authed ? (
              <Link href="/home" className="btn-hound w-full">Dashboard</Link>
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
