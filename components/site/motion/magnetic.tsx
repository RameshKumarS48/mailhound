'use client'

import { useRef } from 'react'
import { m, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/* Wraps a CTA so it drifts toward the pointer, then springs back on leave.
   A pointer-only flourish: touch devices never fire mousemove, and reduced
   motion short-circuits it entirely, so it degrades to a plain inline element. */
export function Magnetic({
  children,
  className = '',
  strength = 0.35,
}: {
  children: React.ReactNode
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  function onMove(e: React.MouseEvent<HTMLSpanElement>) {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <m.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`inline-flex ${className}`}
    >
      {children}
    </m.span>
  )
}
