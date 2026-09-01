import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dnsblCheck } from '@/lib/verification/dnsbl'

// DELETE — stop watching a target (owner only; RLS enforces ownership).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('monitored_domains')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// POST — manual re-scan now. Verify ownership via the session client, then write
// the scan + status update with the admin client (blacklist_scans has no client
// insert policy — writes are service-role only).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: domain, error: findErr } = await supabase
    .from('monitored_domains')
    .select('id, target, last_listed_on')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (findErr || !domain) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await dnsblCheck(domain.target)
  if (result.unavailable) {
    return NextResponse.json(
      { error: 'Blacklist lookup is temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    )
  }

  const previous = new Set<string>(
    Array.isArray(domain.last_listed_on) ? (domain.last_listed_on as string[]) : []
  )
  const newListings = result.results.filter((r) => r.listed && !previous.has(r.zone))

  const admin = createAdminClient()
  await admin.from('blacklist_scans').insert({
    monitored_domain_id: domain.id,
    listed_count: result.listedCount,
    total_checks: result.totalChecks,
    results: result.results,
    new_listings: newListings,
  })
  await admin
    .from('monitored_domains')
    .update({
      last_scanned_at: new Date().toISOString(),
      last_status: result.listedCount > 0 ? 'listed' : 'clean',
      last_listed_on: result.listedOn,
    })
    .eq('id', domain.id)

  return NextResponse.json({
    ok: true,
    listedCount: result.listedCount,
    totalChecks: result.totalChecks,
    listedOn: result.listedOn,
    newListings: newListings.map((l) => l.zone),
  })
}
