'use client'

import { useEffect, useRef, useState } from 'react'

/* One-shot scroll reveal. Fades + lifts content into place the first time it
   enters the viewport, then stays put. Dependency-free (IntersectionObserver)
   to keep the marketing bundle tiny, and fully disabled under reduced-motion:
   content is visible from the first paint, motion only enhances. */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  as?: React.ElementType
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Reveal must render hidden on the server and first client paint (to match
      // hydration), then show once we know motion is off — the sync set here is
      // the intended, one-time correction.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(14px)',
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
