import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBalance } from '@/lib/credits'
import { VerifyForm } from '@/components/verify-form'
import { BulkUploadForm } from '@/components/bulk-upload-form'
import { PaymentSuccessBanner } from '@/components/payment-success-banner'
import { Wordmark } from '@/components/site-chrome'

const statusColor: Record<string, string> = {
  completed: 'var(--valid)',
  processing: 'var(--risky)',
  queued: 'var(--ink-3)',
  failed: 'var(--invalid)',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [balance, jobsResult] = await Promise.all([
    getBalance(user.id),
    supabase
      .from('verification_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const jobs = jobsResult.data ?? []

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Wordmark />
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-ink-3 sm:inline">{user.email}</span>
            <form action="/api/auth/signout" method="post">
              <button className="rounded-full border border-line-2 px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <PaymentSuccessBanner />

        <div className="grid gap-4 sm:grid-cols-3">
          {/* balance */}
          <div className="panel flex flex-col p-6">
            <p className="eyebrow">Credit balance</p>
            <p className="display mt-2 text-5xl font-semibold text-hound">
              {balance.toLocaleString()}
            </p>
            <p className="mt-1 font-mono text-xs text-ink-3">Never expires</p>
            <Link href="/pricing" className="btn-hound mt-5 w-full text-sm">
              Buy credits
            </Link>
          </div>

          {/* quick verify */}
          <div className="panel p-6 sm:col-span-2">
            <p className="eyebrow mb-4">Quick verify</p>
            <VerifyForm />
          </div>
        </div>

        {/* bulk */}
        <div className="panel p-6">
          <p className="eyebrow">Bulk verification</p>
          <h2 className="display mt-2 text-xl font-semibold text-ink">Run a list through the hound</h2>
          <p className="mt-1 mb-6 text-sm text-ink-2">
            Upload a CSV with an “email” column. Results download as a sorted CSV, verdicts and all.
          </p>
          <BulkUploadForm />
        </div>

        {/* history */}
        <div>
          <p className="eyebrow">Case log</p>
          <h2 className="display mt-2 mb-5 text-xl font-semibold text-ink">Recent jobs</h2>
          {jobs.length === 0 ? (
            <div className="panel px-5 py-10 text-center">
              <p className="text-sm text-ink-2">No jobs yet. Upload a CSV above to open your first case.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job: {
                id: string
                status: string
                total: number
                valid: number
                risky: number
                invalid: number
                created_at: string
              }) => (
                <div key={job.id} className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-4">
                    <span
                      className="font-mono text-xs font-semibold uppercase tracking-wider"
                      style={{ color: statusColor[job.status] ?? 'var(--ink-2)' }}
                    >
                      {job.status}
                    </span>
                    <span className="text-sm text-ink">{job.total.toLocaleString()} emails</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span style={{ color: 'var(--valid)' }}>{job.valid} valid</span>
                    <span style={{ color: 'var(--risky)' }}>{job.risky} risky</span>
                    <span style={{ color: 'var(--invalid)' }}>{job.invalid} invalid</span>
                    <span className="text-ink-3">{new Date(job.created_at).toLocaleDateString()}</span>
                    {job.status === 'completed' && (
                      <a href={`/api/bulk/${job.id}/download`} className="text-hound hover:underline">
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
