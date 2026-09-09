'use client'

import Link from 'next/link'
import { useAuthed } from '@/components/site/use-authed'

/* Auth-aware CTA for the public site header. Logged-in visitors get a route to
   their dashboard instead of the "Log in / Start free" pair, so clicking a
   Solutions/tool link from a signed-in session no longer lands them on a header
   that looks logged out. */
export function NavCta() {
  const authed = useAuthed()

  if (authed) {
    return (
      <Link href="/home" className="btn-hound ml-1 !px-4 !py-2 text-sm">
        Dashboard
      </Link>
    )
  }

  return (
    <>
      <Link
        href="/login"
        className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
      >
        Log in
      </Link>
      <Link href="/signup" className="btn-hound ml-1 !px-4 !py-2 text-sm">
        Start free
      </Link>
    </>
  )
}
