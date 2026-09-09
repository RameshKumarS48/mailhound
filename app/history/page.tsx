import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { HistoryBrowser } from '@/components/history-browser'

export const metadata = {
  title: 'Historical Checks — Mailhound',
  description: 'Every address you have verified, kept on file. Re-open any past result without spending another credit.',
}

const SINGLE_LIMIT = 200

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [singlesResult, singleCountResult, jobsResult] = await Promise.all([
    // Single checks are verification_results rows with no parent job.
    supabase
      .from('verification_results')
      .select('id, email, status, reason, score, raw_checks, created_at')
      .eq('user_id', user.id)
      .is('job_id', null)
      .order('created_at', { ascending: false })
      .limit(SINGLE_LIMIT),
    // Exact count so the "checks on file" stat is accurate beyond the loaded page.
    supabase
      .from('verification_results')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('job_id', null),
    // Bulk jobs (summaries); per-row results load on demand via /api/bulk/[id]/results.
    supabase
      .from('verification_jobs')
      .select('id, status, total, valid, risky, invalid, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <>
      <AppHeader email={user.email} current="/history" />

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <p className="eyebrow text-hound">The case files</p>
        <h1 className="display mt-2 mb-2 text-2xl font-semibold text-ink">Historical checks</h1>
        <p className="mb-8 text-sm text-ink-2">
          Every address you&rsquo;ve run stays on file. Re-open any verdict here — reviewing
          a past result never costs a credit.
        </p>

        <HistoryBrowser
          initialSingles={singlesResult.data ?? []}
          singleTotal={singleCountResult.count ?? (singlesResult.data?.length ?? 0)}
          initialJobs={jobsResult.data ?? []}
        />
      </main>
    </>
  )
}
