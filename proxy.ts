import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/* Next.js 16 renamed the `middleware` convention to `proxy` (same behaviour,
   Node.js runtime by default). This refreshes the Supabase session on page
   navigations and guards the signed-in surfaces.

   Note: the matcher deliberately excludes `/api/*`. Route handlers already call
   `getUser()` themselves (and can persist refreshed cookies), so letting proxy
   also refresh on every parallel API call caused concurrent refreshes to race
   on Supabase's rotating refresh token — the main driver of random logouts. */

const PROTECTED = ['/home', '/dashboard', '/developers/dashboard', '/monitoring']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && PROTECTED.some(p => request.nextUrl.pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirect = NextResponse.redirect(url)
    // Carry over any auth cookies refreshed on this request so a token rotated
    // here isn't dropped by the fresh redirect response.
    supabaseResponse.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie))
    return redirect
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, and static assets.
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
