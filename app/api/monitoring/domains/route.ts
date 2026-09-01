import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasActiveWatchPlan } from '@/lib/subscriptions'
import { WATCH_PLANS } from '@/lib/dodo'

const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/

function normalizeTarget(raw: string): string | null {
  const t = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
  if (IPV4_RE.test(t)) {
    return t.split('.').every((o) => Number(o) <= 255) ? t : null
  }
  return DOMAIN_RE.test(t) ? t : null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('monitored_domains')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await hasActiveWatchPlan(user.id))) {
    return NextResponse.json(
      { error: 'An active Watch subscription is required to monitor domains.' },
      { status: 402 }
    )
  }

  const body = await req.json().catch(() => null)
  const target = normalizeTarget(body?.target ?? '')
  if (!target) return NextResponse.json({ error: 'Enter a valid domain or IPv4 address.' }, { status: 400 })
  const label = typeof body?.label === 'string' ? body.label.trim().slice(0, 60) : null

  const limit = WATCH_PLANS[0].domainLimit
  const { count } = await supabase
    .from('monitored_domains')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if ((count ?? 0) >= limit) {
    return NextResponse.json({ error: `Your plan monitors up to ${limit} targets.` }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('monitored_domains')
    .insert({ user_id: user.id, target, label: label || null })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You are already watching that target.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
