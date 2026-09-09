'use client'

import { m } from 'motion/react'
import { DUR, EASE_OUT } from './motion/motion-tokens'

/* One-shot scroll reveal: fades + lifts content into place the first time it
   enters the viewport, then stays put. Now part of the shared `motion` system
   (via the app-wide MotionProvider) so it honors reduced-motion centrally —
   content is visible/final with motion off; motion only enhances.

   The prop signature is unchanged from the previous IntersectionObserver
   version, so every existing call site keeps working untouched. */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  as?: React.ElementType
  className?: string
}) {
  const MotionTag = (m[as as keyof typeof m] ?? m.div) as typeof m.div

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px', amount: 0.12 }}
      transition={{ duration: DUR.slow, ease: EASE_OUT, delay: delay / 1000 }}
    >
      {children}
    </MotionTag>
  )
}
