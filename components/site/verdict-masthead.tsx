'use client'

import { useEffect, useState } from 'react'

/* The result card's masthead — shared by the hero's sample report and the live
   verifier so both read identically. The score is the focal point: a large
   Fraunces numeral in the verdict color, backed by a meter that fills to that
   score. The pressed stamp stays the categorical seal; the number is the
   measurement beside it. Color only appears where it carries the verdict. */

export function VerdictMasthead({
  eyebrow,
  email,
  score,
  label,
  verdict,
  color,
  bg,
  stamped = true,
}: {
  eyebrow: string
  email: string
  score: number
  label: string
  verdict: string
  color: string
  bg: string
  stamped?: boolean
}) {
  // Animate the meter fill on reveal (once), letting motion show the score
  // landing. Reduced-motion snaps via the global transition override.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const pct = Math.max(0, Math.min(100, score))
  const fill = stamped && ready ? pct : 0

  return (
    <div
      className="border-b border-dashed border-line px-5 py-5 sm:px-6"
      style={{ background: bg }}
    >
      {/* specimen + seal */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <p className="mt-1.5 truncate font-mono text-[0.95rem] text-ink sm:text-base">{email}</p>
        </div>
        <div
          className={`stamp shrink-0 text-center ${stamped ? 'stamp-in' : ''}`}
          style={{ color, opacity: stamped ? 0.94 : 0 }}
        >
          <span className="block text-base leading-none">{label}</span>
          <span className="mt-1 block text-[0.5rem] tracking-[0.2em] opacity-80">{verdict}</span>
        </div>
      </div>

      {/* measured confidence */}
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="display text-5xl font-semibold leading-none" style={{ color }}>
            {score}
          </span>
          <span className="font-mono text-sm text-ink-3">/100</span>
          <span className="eyebrow ml-auto self-center">Confidence</span>
        </div>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Confidence score"
        >
          <span
            className="block h-full rounded-full"
            style={{
              width: `${fill}%`,
              background: color,
              transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
