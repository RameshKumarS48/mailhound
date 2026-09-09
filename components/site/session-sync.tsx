'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* Mounted once in the root layout. Two jobs:
   1. Keeps a browser Supabase client alive on every page so the access token
      auto-refreshes while a tab is open (previously nothing kept the session
      warm between navigations, so idle tokens silently expired).
   2. Re-renders server components on auth transitions so the UI never shows a
      stale signed-in/out state. */
export function SessionSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return null
}
