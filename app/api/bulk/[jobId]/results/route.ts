import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* Per-email results for one bulk job, as JSON, for the in-UI drill-down on the
   history page. Mirrors the CSV download route but paginated so the payload
   stays small on large lists. Owner-scoped via user_id + RLS. */

const MAX_LIMIT = 200

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Confirm the job belongs to this user before reading its rows.
  const { data: job } = await supabase
    .from('verification_jobs')
    .select('id, status, total')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const offset = Math.max(0, Number(req.nextUrl.searchParams.get('offset')) || 0)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 50),
  )

  const { data: results, count } = await supabase
    .from('verification_results')
    .select('email, status, reason, score, raw_checks', { count: 'exact' })
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .order('status')
    .range(offset, offset + limit - 1)

  return NextResponse.json({
    jobId,
    status: job.status,
    total: count ?? job.total ?? 0,
    offset,
    limit,
    results: results ?? [],
  })
}
