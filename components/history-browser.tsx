'use client'

import { useMemo, useState } from 'react'
import type { VerificationStatus } from '@/lib/verification/types'
import { statusMeta, checkLabel } from '@/lib/verification/status-meta'
import { CountUp } from '@/components/site/count-up'

/* Historical Checks browser. Reads only data already stored per verification —
   re-viewing a past verdict never spends a credit. Single checks are
   verification_results rows with job_id NULL; bulk uploads are verification_jobs
   whose per-email rows load on demand from /api/bulk/[id]/results. */

type StoredCheck = { passed: boolean; detail: string }

type SingleCheck = {
  id: string
  email: string
  status: VerificationStatus
  reason: string | null
  score: number | null
  raw_checks: Record<string, StoredCheck> | null
  created_at: string
}

type Job = {
  id: string
  status: string
  total: number
  valid: number
  risky: number
  invalid: number
  created_at: string
  completed_at: string | null
}

type BulkRow = {
  email: string
  status: VerificationStatus
  reason: string | null
  score: number | null
}

const jobStatusColor: Record<string, string> = {
  completed: 'var(--valid)',
  processing: 'var(--risky)',
  queued: 'var(--ink-3)',
  failed: 'var(--invalid)',
}

const VERDICTS: (VerificationStatus | 'all')[] = ['all', 'valid', 'risky', 'invalid']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

// A compact valid/risky/invalid chip used across both views.
function VerdictChip({ status }: { status: VerificationStatus }) {
  const meta = statusMeta[status]
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider"
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.label}
    </span>
  )
}

// Evidence ledger rebuilt from stored raw_checks — mirrors the live verify form.
function EvidenceLedger({ raw }: { raw: Record<string, StoredCheck> | null }) {
  const checks = raw
    ? Object.entries(raw).filter(([, c]) => c && c.detail !== 'Skipped')
    : []
  if (checks.length === 0) {
    return <p className="px-5 py-4 font-mono text-xs text-ink-3 sm:px-6">No evidence was stored for this check.</p>
  }
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="eyebrow mb-3">Evidence · {checks.length} checks</p>
      <ul className="space-y-2">
        {checks.map(([key, check]) => (
          <li key={key} className="flex items-baseline text-sm">
            <span className="font-mono text-ink">{checkLabel[key] ?? key}</span>
            <span className="leader" />
            <span className="max-w-[45%] truncate text-right font-mono text-xs text-ink-2">
              {check.detail}
            </span>
            <span
              className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold"
              style={{
                color: check.passed ? 'var(--valid)' : 'var(--invalid)',
                background: check.passed ? 'var(--valid-bg)' : 'var(--invalid-bg)',
              }}
            >
              {check.passed ? '✓' : '✕'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HistoryBrowser({
  initialSingles,
  singleTotal,
  initialJobs,
}: {
  initialSingles: SingleCheck[]
  singleTotal: number
  initialJobs: Job[]
}) {
  const [tab, setTab] = useState<'single' | 'bulk'>('single')
  const [query, setQuery] = useState('')
  const [verdict, setVerdict] = useState<VerificationStatus | 'all'>('all')
  const [openSingle, setOpenSingle] = useState<string | null>(null)

  // Bulk drill-down: cache per-job rows so re-expanding doesn't refetch.
  const [openJob, setOpenJob] = useState<string | null>(null)
  const [jobRows, setJobRows] = useState<Record<string, BulkRow[]>>({})
  const [jobLoading, setJobLoading] = useState<string | null>(null)
  const [jobError, setJobError] = useState<Record<string, string>>({})

  // Headline tallies: bulk job summaries are exact; single verdicts are counted
  // over the loaded page (bulk dominates volume, so this stays representative).
  const stats = useMemo(() => {
    const t = { total: 0, valid: 0, risky: 0, invalid: 0 }
    for (const j of initialJobs) {
      t.total += j.total || 0
      t.valid += j.valid || 0
      t.risky += j.risky || 0
      t.invalid += j.invalid || 0
    }
    for (const s of initialSingles) {
      t[s.status] += 1
    }
    t.total += singleTotal
    return t
  }, [initialJobs, initialSingles, singleTotal])

  const filteredSingles = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialSingles.filter(s =>
      (verdict === 'all' || s.status === verdict) &&
      (q === '' || s.email.toLowerCase().includes(q)),
    )
  }, [initialSingles, query, verdict])

  async function toggleJob(jobId: string) {
    if (openJob === jobId) { setOpenJob(null); return }
    setOpenJob(jobId)
    if (jobRows[jobId] || jobLoading === jobId) return
    setJobLoading(jobId)
    setJobError(prev => ({ ...prev, [jobId]: '' }))
    try {
      const res = await fetch(`/api/bulk/${jobId}/results?limit=200`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not load results')
      setJobRows(prev => ({ ...prev, [jobId]: data.results ?? [] }))
    } catch (err) {
      setJobError(prev => ({ ...prev, [jobId]: err instanceof Error ? err.message : 'Could not load results' }))
    } finally {
      setJobLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* stat ledger */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="On file" value={stats.total} color="var(--hound)" />
        <StatCard label="Valid" value={stats.valid} color="var(--valid)" />
        <StatCard label="Risky" value={stats.risky} color="var(--risky)" />
        <StatCard label="Invalid" value={stats.invalid} color="var(--invalid)" />
      </div>

      {/* tab toggle */}
      <div className="flex items-center gap-2">
        <TabButton active={tab === 'single'} onClick={() => setTab('single')}>
          Single checks
        </TabButton>
        <TabButton active={tab === 'bulk'} onClick={() => setTab('bulk')}>
          Bulk uploads
        </TabButton>
      </div>

      {tab === 'single' ? (
        <div className="space-y-4">
          {/* controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Search by email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-10 flex-1 rounded-full border border-line-2 bg-paper-2 px-4 font-mono text-sm text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25"
            />
            <div className="flex gap-1.5">
              {VERDICTS.map(v => (
                <button
                  key={v}
                  onClick={() => setVerdict(v)}
                  className="rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors"
                  style={
                    verdict === v
                      ? { borderColor: 'var(--hound)', background: 'var(--hound)', color: 'var(--paper)' }
                      : { borderColor: 'var(--line-2)', color: 'var(--ink-2)' }
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {initialSingles.length === 0 ? (
            <EmptyState>
              No single checks yet. Every address you verify from the dashboard or the API lands
              here — review any of them again for free.
            </EmptyState>
          ) : filteredSingles.length === 0 ? (
            <EmptyState>No checks match your search.</EmptyState>
          ) : (
            <div className="space-y-2">
              {filteredSingles.map(s => {
                const open = openSingle === s.id
                return (
                  <div key={s.id} className="panel overflow-hidden">
                    <button
                      onClick={() => setOpenSingle(open ? null : s.id)}
                      className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-left"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <VerdictChip status={s.status} />
                        <span className="truncate font-mono text-sm text-ink">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs text-ink-3">
                        {s.score != null && <span>{s.score}/100</span>}
                        <span>{fmtDate(s.created_at)}</span>
                        <span className="text-ink-2">{open ? '▾' : '▸'}</span>
                      </div>
                    </button>
                    {open && (
                      <div className="border-t border-line">
                        {s.reason && (
                          <div className="border-b border-line px-5 py-3 sm:px-6">
                            <p className="text-sm leading-relaxed text-ink-2">
                              <span className="eyebrow mr-2">Verdict</span>
                              {s.reason}
                            </p>
                          </div>
                        )}
                        <EvidenceLedger raw={s.raw_checks} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {initialJobs.length === 0 ? (
            <EmptyState>
              No bulk uploads yet. Run a CSV through the hound from the dashboard and each job
              will appear here, drillable down to every address.
            </EmptyState>
          ) : (
            initialJobs.map(job => {
              const open = openJob === job.id
              const rows = jobRows[job.id]
              return (
                <div key={job.id} className="panel overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-4">
                      <span
                        className="font-mono text-xs font-semibold uppercase tracking-wider"
                        style={{ color: jobStatusColor[job.status] ?? 'var(--ink-2)' }}
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
                      <button
                        onClick={() => toggleJob(job.id)}
                        className="text-hound hover:underline"
                      >
                        {open ? 'Hide' : 'View results'}
                      </button>
                      {job.status === 'completed' && (
                        <a href={`/api/bulk/${job.id}/download`} className="text-hound hover:underline">
                          Download
                        </a>
                      )}
                    </div>
                  </div>

                  {open && (
                    <div className="border-t border-line">
                      {jobLoading === job.id ? (
                        <p className="px-5 py-4 font-mono text-xs text-ink-3">Loading results…</p>
                      ) : jobError[job.id] ? (
                        <p className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--invalid)' }}>
                          {jobError[job.id]}
                        </p>
                      ) : rows && rows.length > 0 ? (
                        <BulkResults rows={rows} total={job.total} />
                      ) : (
                        <p className="px-5 py-4 font-mono text-xs text-ink-3">No per-email results stored.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// Searchable per-email table for one expanded bulk job.
function BulkResults({ rows, total }: { rows: BulkRow[]; total: number }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return needle ? rows.filter(r => r.email.toLowerCase().includes(needle)) : rows
  }, [rows, q])

  return (
    <div className="px-5 py-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Filter these addresses…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="h-9 flex-1 rounded-full border border-line-2 bg-paper-2 px-4 font-mono text-sm text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25"
        />
        <span className="shrink-0 font-mono text-xs text-ink-3">
          {rows.length < total ? `${rows.length} of ${total.toLocaleString()}` : `${total.toLocaleString()} rows`}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {filtered.map((r, i) => (
          <li key={`${r.email}-${i}`} className="flex items-center justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <VerdictChip status={r.status} />
              <span className="truncate font-mono text-sm text-ink">{r.email}</span>
            </div>
            {r.reason && (
              <span className="hidden max-w-[45%] truncate text-right font-mono text-xs text-ink-3 sm:inline">
                {r.reason}
              </span>
            )}
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-3 font-mono text-xs text-ink-3">No addresses match your filter.</p>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="panel p-4">
      <p className="eyebrow">{label}</p>
      <p className="display mt-1 text-3xl font-semibold" style={{ color }}>
        <CountUp value={value} />
      </p>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
      style={
        active
          ? { borderColor: 'var(--hound)', background: 'var(--hound)', color: 'var(--paper)' }
          : { borderColor: 'var(--line-2)', color: 'var(--ink-2)' }
      }
    >
      {children}
    </button>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel px-5 py-12 text-center">
      <p className="mx-auto max-w-md text-sm text-ink-2">{children}</p>
    </div>
  )
}
