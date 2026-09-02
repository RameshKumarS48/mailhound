'use client'

import { useEffect, useRef, useState } from 'react'

/* Counts a number up once it scrolls into view. Used sparingly on the stat
   ledger. Under reduced-motion it renders the final value immediately.
   `value` is the target number; `prefix`/`suffix`/`decimals` format it so the
   ledger keeps its "$0.005", "~2s", "99.9%" shapes. */
export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1100,
  className = '',
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Renders 0 on the server/first paint to match hydration, then jumps to
      // the final value once we know motion is off. Intentional one-time set.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return
      started.current = true
      io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(value * eased)
        if (t < 1) requestAnimationFrame(tick)
        else setDisplay(value)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
