import Link from 'next/link'
import { Reveal } from './reveal'

/* The closing "case closed" call to action, shared across marketing pages so
   the sign-off reads identically everywhere. */
export function CtaBand({
  eyebrow = 'Case closed',
  title,
  sub = '300 free verifications. No credit card. Never expire.',
  cta = 'Start free — 300 verifications',
  href = '/signup',
}: {
  eyebrow?: string
  title: React.ReactNode
  sub?: React.ReactNode
  cta?: string
  href?: string
}) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Reveal>
          <p className="eyebrow text-hound">{eyebrow}</p>
          <h2 className="display mx-auto mt-5 max-w-2xl font-semibold text-ink text-fluid-4xl">
            {title}
          </h2>
          <p className="mt-5 text-ink-2 text-fluid-md">{sub}</p>
          <Link href={href} className="btn-hound mt-8 !px-8 !py-4 text-lg">
            {cta}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
