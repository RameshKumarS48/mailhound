import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasActiveWatchPlan } from '@/lib/subscriptions'
import { WATCH_PLANS } from '@/lib/dodo'
import { MonitorManager } from '@/components/monitor-manager'
import { AppHeader } from '@/components/app-header'

export default async function MonitoringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [hasPlan, domainsResult] = await Promise.all([
    hasActiveWatchPlan(user.id),
    supabase
      .from('monitored_domains')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const domains = domainsResult.data ?? []

  return (
    <>
      <AppHeader email={user.email} current="/monitoring" />

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <p className="eyebrow">Continuous monitoring</p>
        <h1 className="display mt-2 mb-2 text-2xl font-semibold text-ink">Blacklist stakeout</h1>
        <p className="mb-8 text-sm text-ink-2">
          The hound re-runs your targets past every major blacklist daily and emails
          you the moment a new listing turns up.
        </p>

        <MonitorManager
          hasPlan={hasPlan}
          initialDomains={domains}
          domainLimit={WATCH_PLANS[0].domainLimit}
        />
      </main>
    </>
  )
}
