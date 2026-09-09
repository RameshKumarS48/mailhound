'use client'

import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'
import { DUR, EASE_OUT } from './motion-tokens'

/* One motion context for the whole app.

   - LazyMotion + `domAnimation` loads only the ~15-25KB DOM animation + gesture
     bundle (not the full library), keeping the marketing JS budget in check.
   - `strict` makes the build fail if any component uses the full `motion.*`
     components instead of the lightweight `m.*` ones — an enforced budget guard.
   - MotionConfig reducedMotion="user" auto-reduces transform/layout animations
     to instant for people who ask, so every primitive downstream inherits the
     "content is always final, motion only enhances" contract. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: DUR.base, ease: EASE_OUT }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
