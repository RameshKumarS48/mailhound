import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteNav, SiteFooter } from '@/components/site-chrome'

/* Shared chrome for the four free tools so they share one header rhythm,
   field-note treatment, and cross-linking. The interactive body is passed as
   children (each tool is its own client component). */

const TOOLS: { href: string; name: string; blurb: string }[] = [
  { href: '/mx-lookup', name: 'MX Lookup', blurb: 'See a domain’s mail servers' },
  { href: '/domain-health', name: 'Domain Health', blurb: 'Grade SPF, DKIM & DMARC' },
  { href: '/blacklist', name: 'Blacklist Check', blurb: 'Scan the major DNSBLs' },
  { href: '/email-finder', name: 'Email Finder', blurb: 'Track down a work email' },
]

export function ToolPage({
  current,
  title,
  intro,
  children,
  fieldNote,
}: {
  current: string
  title: string
  intro: React.ReactNode
  children: React.ReactNode
  fieldNote: { body: React.ReactNode; ctaHref: string; ctaLabel: string }
}) {
  const others = TOOLS.filter(t => t.href !== current)

  return (
    <>
      <SiteNav />

      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <p className="eyebrow text-hound">Free tool · no account</p>
        <h1 className="display mt-4 font-semibold text-ink text-fluid-4xl">{title}</h1>
        <p className="mt-4 text-ink-2 text-fluid-md leading-relaxed">{intro}</p>

        <div className="mt-8">{children}</div>

        <div className="panel mt-10 p-6">
          <p className="eyebrow">Field note</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{fieldNote.body}</p>
          <Link
            href={fieldNote.ctaHref}
            className="mt-4 inline-flex items-center gap-1.5 font-medium text-hound transition-colors hover:text-hound-2"
          >
            {fieldNote.ctaLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Cross-links to the rest of the toolkit */}
      <section className="border-t border-line bg-paper-2/50">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="eyebrow text-hound">More free tools</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {others.map(t => (
              <Link
                key={t.href}
                href={t.href}
                className="panel group flex flex-col p-5 transition-all hover:border-hound hover:shadow-[var(--shadow-panel)]"
              >
                <span className="flex items-center justify-between font-semibold text-ink">
                  {t.name}
                  <ArrowRight size={15} className="text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-hound" />
                </span>
                <span className="mt-1 text-sm text-ink-2">{t.blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
