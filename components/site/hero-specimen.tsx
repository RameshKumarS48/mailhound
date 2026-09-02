'use client'

import { useEffect, useState } from 'react'

/* The hero's signature: a sample field report that assembles itself once on
   load — evidence rows tick in one by one, then the verdict stamp drops. It's
   clearly labelled a sample (the real, interactive verifier sits right beside
   it), so nothing here is passed off as live data. Reduced-motion renders the
   finished report immediately with no animation. */

const EVIDENCE: [string, string][] = [
  ['Syntax', 'RFC-5322 valid'],
  ['Domain', 'acmecorp.com resolves'],
  ['MX record', 'aspmx.l.google.com'],
  ['SMTP probe', 'Mailbox accepts'],
  ['Disposable', 'Not a throwaway'],
  ['Role address', 'Personal inbox'],
]

export function HeroSpecimen() {
  // step counts revealed rows; stamp lands after the last row.
  const [step, setStep] = useState(0)
  const [stamped, setStamped] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Render the finished report immediately when motion is off. Server/first
      // paint start empty to match hydration; this is the one-time correction.
      /* eslint-disable react-hooks/set-state-in-effect */
      setStep(EVIDENCE.length)
      setStamped(true)
      /* eslint-enable react-hooks/set-state-in-effect */
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    EVIDENCE.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 260 + i * 190))
    })
    timers.push(setTimeout(() => setStamped(true), 260 + EVIDENCE.length * 190 + 120))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="panel overflow-hidden" style={{ boxShadow: 'var(--shadow-panel)' }}>
      <div
        className="flex items-start justify-between gap-4 border-b border-dashed border-line px-5 py-4"
        style={{ background: 'var(--valid-bg)' }}
      >
        <div className="min-w-0">
          <p className="eyebrow">Sample · field report</p>
          <p className="mt-1 truncate font-mono text-sm text-ink">priya@acmecorp.com</p>
          <p className="mt-1 text-xs text-ink-2">
            Confidence <span className="font-mono font-semibold text-valid">98</span>/100
          </p>
        </div>
        <div
          className={`stamp shrink-0 text-center text-valid ${stamped ? 'stamp-in' : ''}`}
          style={{ opacity: stamped ? 0.94 : 0 }}
        >
          <span className="block text-base leading-none">Valid</span>
          <span className="mt-1 block text-[0.5rem] tracking-[0.2em] opacity-80">Deliverable</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="eyebrow mb-3">Evidence · 6 checks</p>
        <ul className="space-y-2">
          {EVIDENCE.map(([label, detail], i) => (
            <li
              key={label}
              className="flex items-baseline text-sm"
              style={{
                opacity: i < step ? 1 : 0,
                transform: i < step ? 'none' : 'translateY(5px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              <span className="font-mono text-ink">{label}</span>
              <span className="leader" />
              <span className="max-w-[45%] truncate text-right font-mono text-xs text-ink-2">{detail}</span>
              <span
                className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-valid"
                style={{ background: 'var(--valid-bg)' }}
              >
                ✓
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
