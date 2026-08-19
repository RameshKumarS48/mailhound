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
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-700 hover:border-zinc-500'}`}
      >
        <p className="text-2xl mb-2">📂</p>
        <p className="text-zinc-400 text-sm">Drag & drop your CSV here, or <span className="text-amber-400">browse</span></p>
        <p className="mt-1 text-xs text-zinc-500">CSV · Email column auto-detected · Up to 100 emails per job</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )

  if (phase === 'uploading' || phase === 'processing') return (
    <div className="py-8 text-center space-y-3">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-zinc-400 text-sm">
        {phase === 'uploading' ? 'Uploading…' : `Verifying ${job?.total.toLocaleString() ?? '…'} emails`}
      </p>
      <p className="text-xs text-zinc-600">This usually takes under a minute</p>
    </div>
  )

  if (phase === 'completed' && job) return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-2xl font-black text-emerald-400">{job.valid.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">Valid</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-2xl font-black text-amber-400">{job.risky.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">Risky</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-2xl font-black text-red-400">{job.invalid.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">Invalid</p>
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={`/api/bulk/${job.jobId}/download`}
          className="flex-1 text-center bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-lg text-sm transition-colors"
        >
          Download Results CSV
        </a>
        <button
          onClick={reset}
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
        >
          New Upload
        </button>
      </div>
    </div>
  )

  return (
    <div className="py-6 text-center space-y-2">
      <p className="text-red-400 text-sm">Job failed. Please try again.</p>
      <button onClick={reset} className="text-xs text-zinc-500 hover:text-white transition-colors">Try again</button>
    </div>
  )
}
