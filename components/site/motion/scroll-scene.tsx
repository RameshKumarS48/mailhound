'use client'

import { useRef, useState } from 'react'
import {
  m,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react'

export type SceneStep = {
  name: string
  who: string
  desc: string
  exclusive?: boolean
}

/* A pinned, scroll-driven pipeline. A tall outer track gives the scene its
   scroll length; an inner panel sticks to the viewport while the active step
   advances with scroll progress — the left rail fills, the headline crossfades,
   and the ledger highlights the current check.

   Reduced motion (or no JS) falls back to a plain, fully-revealed list, so the
   same content is always readable without the pin. */
export function PipelineScene({ steps }: { steps: SceneStep[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const [active, setActive] = useState(0)
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.floor(v * steps.length)
    setActive(Math.max(0, Math.min(steps.length - 1, i)))
  })

  if (reduce) {
    return (
      <ol className="mt-14 space-y-6">
        {steps.map((s, i) => (
          <StaticStep key={s.name} step={s} index={i} />
        ))}
      </ol>
    )
  }

  const current = steps[active]

  return (
    <div
      ref={ref}
      className="relative mt-10"
      style={{ height: `${steps.length * 46 + 60}vh` }}
    >
      <div className="sticky top-[14vh] grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        {/* Left: the active step, spoken large */}
        <div className="lg:pt-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-ink-3">
              {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider"
              style={
                current.exclusive
                  ? { background: 'var(--hound)', color: 'var(--hound-ink)' }
                  : { background: 'var(--paper-3)', color: 'var(--ink-2)' }
              }
            >
              {current.exclusive ? 'Mailhound only' : current.who}
            </span>
          </div>
          <m.h3
            key={current.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="display mt-4 font-semibold text-ink text-fluid-3xl"
          >
            {current.name}
          </m.h3>
          <m.p
            key={`${current.name}-desc`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-4 max-w-md text-ink-2 text-fluid-md leading-relaxed"
          >
            {current.desc}
          </m.p>
        </div>

        {/* Right: the full ledger, with a filling rail and the active row lit */}
        <div className="flex gap-5">
          <div className="relative w-px shrink-0 bg-line">
            <m.div
              className="absolute inset-x-0 top-0 origin-top bg-hound"
              style={{ height: fill }}
            />
          </div>
          <ol className="flex-1 space-y-1">
            {steps.map((s, i) => {
              const on = i <= active
              return (
                <li
                  key={s.name}
                  className="rounded-lg px-3 py-2.5 transition-colors"
                  style={{
                    background: i === active ? 'var(--paper-3)' : 'transparent',
                    opacity: on ? 1 : 0.4,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs"
                      style={{ color: on ? 'var(--hound)' : 'var(--ink-3)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium text-ink">{s.name}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

function StaticStep({ step, index }: { step: SceneStep; index: number }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-x-4">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-semibold"
        style={
          step.exclusive
            ? { background: 'var(--hound)', color: 'var(--hound-ink)', borderColor: 'var(--hound)' }
            : { borderColor: 'var(--line-2)', color: 'var(--ink-2)' }
        }
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-ink">{step.name}</h3>
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider"
            style={
              step.exclusive
                ? { background: 'var(--hound)', color: 'var(--hound-ink)' }
                : { background: 'var(--paper-3)', color: 'var(--ink-2)' }
            }
          >
            {step.exclusive ? 'Mailhound only' : step.who}
          </span>
        </div>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-2">{step.desc}</p>
      </div>
    </li>
  )
}
