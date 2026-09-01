'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/* Dark code panel with a copy button — table-stakes credibility for a
   developer audience. Optional language tabs let one block hold cURL / Node /
   Python side by side (used on /developers and /docs). Copy feedback flips to
   a checkmark for ~1.5s: sub-100ms, visible, honest. */

export type CodeSample = { label: string; code: string }

export function CodeBlock({
  samples,
  caption,
  className = '',
}: {
  samples: CodeSample[]
  caption?: string
  className?: string
}) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const current = samples[active]

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked — no-op, the code stays selectable */
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#26312f] bg-[#0f1513] ${className}`}
      style={{ boxShadow: 'var(--shadow-raise)' }}
    >
      <div className="flex items-center justify-between border-b border-[#26312f] px-3 py-2">
        <div className="flex items-center gap-1">
          {samples.length > 1 ? (
            samples.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActive(i)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                  i === active
                    ? 'bg-[#1d2624] text-[#e7f0ed]'
                    : 'text-[#7f8c88] hover:text-[#c7d2ce]'
                }`}
              >
                {s.label}
              </button>
            ))
          ) : (
            <span className="px-1.5 font-mono text-xs text-[#7f8c88]">{caption ?? current.label}</span>
          )}
        </div>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-[#7f8c88] transition-colors hover:text-[#e7f0ed]"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[0.82rem] leading-relaxed">
        <code className="font-mono text-[#d7e2de]">{current.code}</code>
      </pre>
    </div>
  )
}
