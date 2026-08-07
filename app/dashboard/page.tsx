import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBalance } from '@/lib/credits'

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

  const statusColors = {
    completed: 'text-emerald-400',
    processing: 'text-amber-400',
    queued: 'text-zinc-400',
    failed: 'text-red-400',
  } as const

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold">Mailhound</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <form action="/api/auth/signout" method="post">
              <button className="text-sm text-zinc-500 hover:text-white transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* Credit balance */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:col-span-1">
            <p className="text-sm text-zinc-500 mb-1">Credit Balance</p>
            <p className="text-4xl font-black text-amber-400">{balance.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">Never expires</p>
            <Link href="/pricing" className="mt-4 inline-block bg-zinc-800 hover:bg-amber-500 hover:text-black text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Buy Credits
            </Link>
          </div>

          {/* Quick verify */}
          <div className="sm:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <p className="text-sm text-zinc-400 mb-4 font-medium">Quick Verify</p>
            <QuickVerifyForm />
          </div>
        </div>

        {/* Bulk upload */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-lg">Bulk Verification</h2>
              <p className="text-sm text-zinc-400">Upload a CSV with an &quot;email&quot; column. Results download as a clean sorted file.</p>
            </div>
          </div>
          <BulkUploadForm />
        </div>

        {/* Job history */}
        <div>
          <h2 className="font-bold text-lg mb-4">Recent Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-zinc-500 text-sm">No jobs yet. Upload a CSV above to get started.</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job: {
                id: string
                status: keyof typeof statusColors
                total: number
                valid: number
                risky: number
                invalid: number
                created_at: string
              }) => (
                <div key={job.id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium capitalize ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                    <span className="text-sm text-zinc-400">{job.total.toLocaleString()} emails</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="text-emerald-400">{job.valid} valid</span>
                    <span className="text-amber-400">{job.risky} risky</span>
                    <span className="text-red-400">{job.invalid} invalid</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Client components inlined for simplicity
function QuickVerifyForm() {
  return (
    <div id="quick-verify-placeholder" className="text-zinc-500 text-sm">
      {/* Replaced by VerifyForm client component — connect in follow-up */}
      <p>Single email verification form loads here. See <code className="text-zinc-400">components/verify-form.tsx</code>.</p>
    </div>
  )
}

function BulkUploadForm() {
  return (
    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500 text-sm">
      <p className="text-2xl mb-2">📂</p>
      <p>Drag & drop your CSV here, or <span className="text-amber-400 cursor-pointer">browse</span></p>
      <p className="mt-1 text-xs">CSV or Excel · Any size · Email column auto-detected</p>
      {/* Full drag-and-drop upload wired in follow-up */}
    </div>
  )
}
