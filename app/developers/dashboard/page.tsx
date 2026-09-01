import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBalance } from '@/lib/credits'
import { listApiKeys } from '@/lib/api-keys'
import { ApiKeyManager } from '@/components/api-key-manager'
import { AppHeader } from '@/components/app-header'
import { CountUp } from '@/components/site/count-up'

export default async function DeveloperDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [balance, keys] = await Promise.all([
    getBalance(user.id),
    listApiKeys(user.id),
  ])

  return (
    <>
      <AppHeader email={user.email} current="/developers/dashboard" />

      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="panel flex flex-col p-6">
            <p className="eyebrow">Credit balance</p>
            <p className="display mt-2 text-5xl font-semibold text-hound">
              <CountUp value={balance} />
            </p>
            <p className="mt-1 font-mono text-xs text-ink-3">Shared — web + API</p>
            <Link href="/developers#pricing" className="btn-hound mt-5 w-full text-sm">
              Buy API credits
            </Link>
          </div>

          <div className="panel p-6 sm:col-span-2">
            <p className="eyebrow mb-1">API endpoint</p>
            <p className="mb-3 text-sm text-ink-2">Authenticate with your key in the Authorization header.</p>
            <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] px-4 py-3 font-mono text-xs leading-relaxed text-[#e8e8e8]">
{`GET https://mailhound.xyz/api/v1/verify?email=...
Authorization: Bearer mhk_your_key_here`}
            </pre>
            <Link href="/docs" className="mt-3 inline-block font-mono text-xs text-hound hover:underline">
              Full API reference →
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow">API keys</p>
          <h2 className="display mt-2 mb-6 text-xl font-semibold text-ink">Manage your keys</h2>
          <ApiKeyManager initialKeys={keys} />
        </div>
      </main>
    </>
  )
}
