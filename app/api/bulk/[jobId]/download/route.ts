import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: job } = await supabase
    .from('verification_jobs')
    .select('id, status')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  if (job.status !== 'completed') return NextResponse.json({ error: 'Job not completed yet' }, { status: 400 })

  const { data: results } = await supabase
    .from('verification_results')
    .select('email, status, reason, score')
    .eq('job_id', jobId)
    .order('status')

  if (!results) return NextResponse.json({ error: 'No results' }, { status: 404 })

  const header = 'email,status,reason,score\n'
  const rows = results.map(r =>
    `${r.email},${r.status},"${r.reason.replace(/"/g, '""')}",${r.score}`
  ).join('\n')

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="mailhound-${jobId.slice(0, 8)}.csv"`,
    },
  })
}
