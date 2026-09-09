import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* PKCE code-exchange endpoint. Supabase email links (signup confirmation,
   password recovery) arrive with a `?code=` that must be swapped for a session
   server-side before the user lands on a protected page — without this the
   session never establishes and proxy bounces them to /login (which reads as
   being "logged out" right after signing up or resetting a password). */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code, or the exchange failed — send them to sign in.
  return NextResponse.redirect(`${origin}/login`)
}
