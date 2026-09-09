'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/* Client-side auth state for the public nav, so the header shows the right CTA
   (Dashboard vs Log in / Start free) without forcing every marketing/tool page
   to render dynamically on the server. Returns `null` until known — callers
   treat that as "assume logged out" to match the server-rendered anonymous
   markup, then swap once resolved. */
export function useAuthed(): boolean | null {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthed(!!data.user)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return authed
}
