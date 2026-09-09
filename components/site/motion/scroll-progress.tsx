'use client'

import { m, useScroll, useSpring } from 'motion/react'

/* A thin reading-progress bar pinned to the very top edge of the viewport.
   Scroll-linked (not autonomous motion), spring-smoothed so it glides rather
   than snaps. Decorative, so it's aria-hidden. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  })

  return (
    <m.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-hound"
      style={{ scaleX }}
    />
  )
}
