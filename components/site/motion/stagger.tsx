'use client'

import { m } from 'motion/react'
import { DUR, EASE_OUT } from './motion-tokens'

/* Declarative stagger for grids and lists. Wrap a group in <StaggerGroup> and
   each child in <StaggerItem>; the group orchestrates a cascade as it scrolls
   into view — replacing hand-tuned `delay={i * 80}` chains. Under reduced
   motion the MotionProvider collapses the transforms; content still fades in. */

const groupVariants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
}

export function StaggerGroup({
  children,
  className = '',
  stagger = 0.08,
  once = true,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  once?: boolean
}) {
  return (
    <m.div
      className={className}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '0px 0px -8% 0px' }}
      variants={groupVariants}
    >
      {children}
    </m.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <m.div className={className} variants={itemVariants}>
      {children}
    </m.div>
  )
}
