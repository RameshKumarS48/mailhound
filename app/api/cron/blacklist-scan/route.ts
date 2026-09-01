import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dnsblCheck } from '@/lib/verification/dnsbl'
import { sendBlacklistAlert } from '@/lib/email/send-alert'

// Daily cron (see vercel.json). Re-scans every active monitored target, records a
// scan row, and emails the owner when a NEW blacklisting appears. Guarded by the
// CRON_SECRET bearer token Vercel Cron sends.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: domains, error } = await supabase
    .from('monitored_domains')
    .select('id, user_id, target, last_listed_on')
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ error: `Failed to load monitored domains: ${error.message}` }, { status: 500 })
  }

  let scanned = 0
  let alerted = 0
  const emailCache = new Map<string, string | null>()

  for (const d of domains ?? []) {
    const result = await dnsblCheck(d.target)
    if (result.unavailable) continue // resolver/worker down — skip, don't corrupt state
    scanned++

    const previous = new Set<string>(
      Array.isArray(d.last_listed_on) ? (d.last_listed_on as string[]) : []
    )
    const current = result.listedOn
    const newListings = result.results.filter((r) => r.listed && !previous.has(r.zone))

    await supabase.from('blacklist_scans').insert({
      monitored_domain_id: d.id,
      listed_count: result.listedCount,
      total_checks: result.totalChecks,
      results: result.results,
      new_listings: newListings,
    })

    await supabase
      .from('monitored_domains')
      .update({
        last_scanned_at: new Date().toISOString(),
        last_status: result.listedCount > 0 ? 'listed' : 'clean',
        last_listed_on: current,
      })
      .eq('id', d.id)

    if (newListings.length > 0) {
      let email = emailCache.get(d.user_id)
      if (email === undefined) {
        const { data: userData } = await supabase.auth.admin.getUserById(d.user_id)
        email = userData?.user?.email ?? null
        emailCache.set(d.user_id, email)
      }
      if (email) {
        const res = await sendBlacklistAlert(
          email,
          d.target,
          newListings.map((l) => ({ zone: l.zone, txt: l.txt }))
        )
        if (res.sent) alerted++
      }
    }
  }

  return NextResponse.json({ ok: true, scanned, alerted })
}
