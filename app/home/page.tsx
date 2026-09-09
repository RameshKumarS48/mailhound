import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBalance } from '@/lib/credits'
import { VerifyForm } from '@/components/verify-form'
import { AppHeader } from '@/components/app-header'
import { CountUp } from '@/components/site/count-up'
import { Reveal } from '@/components/site/reveal'
import { SOLUTION_GROUPS } from '@/components/site/solutions'

const statusColor: Record<string, string> = {
  completed: 'var(--valid)',
  processing: 'var(--risky)',
  queued: 'var(--ink-3)',
  failed: 'var(--invalid)',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [balance, jobsResult] = await Promise.all([
    getBalance(user.id),
    supabase
      .from('verification_jobs')
      .select('id,status,total,valid,risky,invalid,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const jobs = jobsResult.data ?? []
  const firstName = user.email?.split('@')[0] ?? 'there'

  return (
    <>
      <AppHeader email={user.email} current="/home" />

      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        {/* Welcome + balance + quick verify */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="panel flex h-full flex-col justify-between p-8">
              <div>
                <p className="eyebrow text-hound">Case room</p>
                <h1 className="display mt-3 font-semibold text-ink text-fluid-2xl">
                  Welcome back, <span className="text-hound">{firstName}</span>.
                </h1>
                <p className="mt-3 max-w-lg text-ink-2 leading-relaxed">
                  Every surface is one tab away — verify a single address, scrub a whole
                  list, grade a domain, or set a blacklist watch. Pick up where you left off
                  below.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn-hound text-sm">Open Verify workspace</Link>
                <Link href="/monitoring" className="btn-ghost text-sm">Blacklist monitoring</Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel flex h-full flex-col p-8">
              <p className="eyebrow">Credit balance</p>
              <p className="display mt-2 text-5xl font-semibold text-hound">
                <CountUp value={balance} />
              </p>
              <p className="mt-1 font-mono text-xs text-ink-3">Never expires</p>
              <Link href="/pricing" className="btn-hound mt-auto w-full text-sm">
                Buy credits
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Quick verify */}
        <Reveal>
          <div className="panel p-6 sm:p-8">
            <p className="eyebrow mb-4">Quick verify</p>
            <VerifyForm />
          </div>
        </Reveal>

        {/* Solutions grid */}
        <div>
          <p className="eyebrow text-hound">Everything you can run</p>
          <h2 className="display mt-3 mb-6 font-semibold text-ink text-fluid-xl">Your toolkit</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {SOLUTION_GROUPS.map((group, gi) => (
              <Reveal key={group.title} delay={gi * 70}>
                <div className="panel flex h-full flex-col p-6">
                  <p className="eyebrow">{group.title}</p>
                  <p className="mt-2 text-sm text-ink-3">{group.blurb}</p>
                  <div className="mt-5 flex flex-col divide-y divide-line border-t border-line">
                    {group.items.map(item => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="group/item flex items-start justify-between gap-3 py-3"
                      >
                        <span>
                          <span className="block text-sm font-medium text-ink transition-colors group-hover/item:text-hound">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-ink-3">
                            {item.desc}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-ink-3 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-hound"
                        >
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-hound">Case log</p>
              <h2 className="display mt-3 font-semibold text-ink text-fluid-xl">Recent activity</h2>
            </div>
            {jobs.length > 0 && (
              <Link href="/dashboard" className="text-sm text-hound hover:underline">
                View all →
              </Link>
            )}
          </div>

          <div className="mt-6">
            {jobs.length === 0 ? (
              <div className="panel px-5 py-12 text-center">
                <p className="text-sm text-ink-2">
                  No cases opened yet. Run a verification above or{' '}
                  <Link href="/dashboard" className="text-hound hover:underline">upload a list</Link>.
                </p>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
