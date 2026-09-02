import Link from 'next/link'
import { SiteNav, SiteFooter } from '@/components/site-chrome'

/* Shared shell for /privacy and /terms. Deliberately plain: a readable measure,
   a sticky section index, and honest, specific copy about how data and payments
   are actually handled. These are drafts written to be truthful, not a
   substitute for review by a qualified lawyer before launch. */

export type LegalSection = { id: string; heading: string; body: React.ReactNode }

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: React.ReactNode
  sections: LegalSection[]
}) {
  return (
    <>
      <SiteNav />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-24">
        <p className="eyebrow text-hound">Legal</p>
        <h1 className="display mt-4 font-semibold text-ink text-fluid-4xl">{title}</h1>
        <p className="mt-3 font-mono text-xs text-ink-3">Last updated {updated}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-12 lg:grid-cols-[15rem_1fr]">
          {/* Section index */}
          <nav className="hidden lg:block">
            <div className="sticky top-24">
              <p className="eyebrow mb-3">On this page</p>
              <ul className="space-y-2 border-l border-line">
                {sections.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l border-transparent pl-4 text-sm text-ink-2 transition-colors hover:border-hound hover:text-ink"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Body */}
          <div className="max-w-2xl">
            <p className="text-ink-2 text-fluid-md leading-relaxed">{intro}</p>
            <div className="mt-10 space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="display flex items-baseline gap-3 text-xl font-semibold text-ink">
                    <span className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                    {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-2 [&_a]:text-hound [&_a]:underline [&_a]:underline-offset-2">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-xl border border-dashed border-line bg-paper-2/50 p-5 text-sm text-ink-2">
              Questions about this document? Email{' '}
              <Link href="mailto:hello@mailhound.xyz" className="text-hound underline underline-offset-2">
                hello@mailhound.xyz
              </Link>
              .
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
