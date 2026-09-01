'use client'

import { useEffect, useState } from 'react'

/* Sticky documentation table of contents with scroll-spy. The active section
   is derived from an IntersectionObserver over the anchor targets, so the rail
   tracks the reader without hijacking scroll or touching the URL. */

export function DocsToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const sections = items
      .map(i => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24">
        <p className="eyebrow mb-3">On this page</p>
        <ul className="space-y-1 border-l border-line">
          {items.map(i => {
            const on = active === i.id
            return (
              <li key={i.id}>
                <a
                  href={`#${i.id}`}
                  className={`-ml-px block border-l pl-4 py-1 text-sm transition-colors ${
                    on
                      ? 'border-hound font-medium text-hound'
                      : 'border-transparent text-ink-2 hover:border-ink-3 hover:text-ink'
                  }`}
                >
                  {i.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
