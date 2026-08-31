'use client'
import { useState, useRef } from 'react'

type Phase = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

interface JobState {
  jobId: string
  total: number
  valid: number
  risky: number
  invalid: number
  status: string
}

export function BulkUploadForm() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [job, setJob] = useState<JobState | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  function startPolling(jobId: string) {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/bulk/${jobId}/status`)
        if (!res.ok) return
        const data: JobState = await res.json()
        setJob(data)
        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling()
          setPhase(data.status as Phase)
        }
      } catch { /* network blip — keep polling */ }
    }, 2000)
  }

  async function upload(file: File) {
    setPhase('uploading')
    setError('')
    setJob(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/bulk', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); setPhase('idle'); return }
      const initial: JobState = { jobId: data.jobId, total: data.total, valid: 0, risky: 0, invalid: 0, status: 'processing' }
      setJob(initial)
      setPhase('processing')
      startPolling(data.jobId)
    } catch {
      setError('Network error — please try again')
      setPhase('idle')
    }
  }

  function handleFile(file: File | undefined | null) {
    if (!file) return
    if (!file.name.match(/\.(csv|xlsx?)$/i)) { setError('Please upload a CSV or Excel file'); return }
    upload(file)
  }

  function reset() { stopPolling(); setPhase('idle'); setJob(null); setError('') }

  if (phase === 'idle') return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? 'border-hound bg-hound/5' : 'border-line-2 hover:border-ink-3'
        }`}
      >
        <svg className="mx-auto mb-3 text-ink-3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15V3m0 0L8 7m4-4 4 4" />
          <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
        </svg>
        <p className="text-sm text-ink-2">
          Drop your CSV here, or <span className="font-medium text-hound">browse</span>
        </p>
        <p className="mt-1 font-mono text-xs text-ink-3">
          CSV · email column auto-detected · up to 100 per job
        </p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-2 font-mono text-sm text-invalid">{error}</p>}

      <div className="mt-4 rounded-lg border border-line bg-paper-2 px-4 py-3">
        <p className="eyebrow mb-2">Expected format</p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-line">
                <th className="pb-1.5 pr-6 text-left font-semibold text-ink">email</th>
                <th className="pb-1.5 pr-6 text-left text-ink-3 font-normal">name <span className="opacity-60">(optional)</span></th>
                <th className="pb-1.5 text-left text-ink-3 font-normal">other columns <span className="opacity-60">(kept in output)</span></th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              <tr><td className="py-0.5 pr-6">alice@example.com</td><td className="pr-6">Alice</td><td>…</td></tr>
              <tr><td className="py-0.5 pr-6">bob@company.io</td><td className="pr-6">Bob</td><td>…</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2.5 text-xs text-ink-3">
          Column named <span className="font-mono font-medium text-ink-2">email</span> is required (case-insensitive). Accepts <span className="font-mono text-ink-2">.csv</span>, <span className="font-mono text-ink-2">.xlsx</span>, or <span className="font-mono text-ink-2">.xls</span> · up to 100,000 rows.
        </p>
      </div>
    </div>
  )

  if (phase === 'uploading' || phase === 'processing') return (
    <div className="space-y-3 py-10 text-center">
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-hound border-t-transparent" />
      <p className="text-sm text-ink-2">
        {phase === 'uploading' ? 'Uploading…' : `Working the case — ${job?.total.toLocaleString() ?? '…'} addresses`}
      </p>
      <p className="font-mono text-xs text-ink-3">This usually takes under a minute</p>
    </div>
  )

  if (phase === 'completed' && job) return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <Tally n={job.valid} label="Valid" color="var(--valid)" bg="var(--valid-bg)" />
        <Tally n={job.risky} label="Risky" color="var(--risky)" bg="var(--risky-bg)" />
        <Tally n={job.invalid} label="Invalid" color="var(--invalid)" bg="var(--invalid-bg)" />
      </div>
      <div className="flex gap-2">
        <a href={`/api/bulk/${job.jobId}/download`} className="btn-hound flex-1 text-sm">
          Download results CSV
        </a>
        <button onClick={reset} className="btn-ghost text-sm">New upload</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-2 py-6 text-center">
      <p className="font-mono text-sm text-invalid">Job failed. Please try again.</p>
      <button onClick={reset} className="font-mono text-xs text-ink-3 hover:text-ink">Try again</button>
    </div>
  )
}

function Tally({ n, label, color, bg }: { n: number; label: string; color: string; bg: string }) {
  return (
    <div className="rounded-lg border p-4" style={{ background: bg, borderColor: color }}>
      <p className="display text-3xl font-semibold" style={{ color }}>{n.toLocaleString()}</p>
      <p className="eyebrow mt-1">{label}</p>
    </div>
  )
}
