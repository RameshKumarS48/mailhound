import Link from 'next/link'
import { Check } from 'lucide-react'
import { CREDIT_PACKS, WATCH_PLANS } from '@/lib/dodo'
import { BuyPackButton } from '@/components/buy-pack-button'
import { SiteNav, SiteFooter } from '@/components/site-chrome'
import { Section, SectionHeading } from '@/components/site/section'
import { Reveal } from '@/components/site/reveal'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'

/* Honest comparison: we don't name competitors with prices we can't stand
   behind. The right column is the category ("most verification tools"), and
   every figure in it is a defensible range rather than an invented number. */
const COMPARE: { feature: string; mailhound: string; others: string }[] = [
  { feature: 'Price per 1,000 emails', mailhound: '$5', others: '$8–16' },
  { feature: 'Checks run per address', mailhound: '7', others: '4–5' },
  { feature: 'Verdict on catch-all domains', mailhound: 'Real verdict', others: 'Often “unknown”' },
  { feature: 'Reason on every result', mailhound: 'Always', others: 'Rarely' },
  { feature: 'Role-address filtering', mailhound: 'Included', others: 'Sometimes' },
  { feature: 'Credits expire', mailhound: 'Never', others: 'Monthly reset' },
  { feature: 'Free tier without a card', mailhound: '300 checks', others: 'Varies' },
]

const FAQ = [
  { q: 'What exactly is one credit?', a: 'One email verification is one credit. The other tools draw from the same balance: Domain Health is 5, a blacklist check is 3, Email Finder is 10 (charged only on a verified hit). You’re never billed for a result we can’t stand behind.' },
  { q: 'Do credits expire?', a: 'Never. Buy a pack once and it sits in your balance until you use it — no monthly reset, no subscription, no “use it or lose it”.' },
  { q: 'Is there really no subscription?', a: 'Correct. Packs are one-time purchases. The only recurring option is the optional Watch plan for continuous blacklist monitoring — everything else is pay-as-you-go.' },
  { q: 'What’s your refund policy?', a: 'Unused credit packs are refundable within 14 days of purchase — email us and we’ll reverse the charge through our processor. Credits already spent on verifications aren’t refundable.' },
  { q: 'Does the API cost extra?', a: <>No. Dashboard and API share one credit balance and run the identical seven-point engine. Larger API-specific packs are on the <Link href="/developers" className="text-hound underline underline-offset-2">developers page</Link>.</> },
  { q: 'How do you sell 1,000 emails for $5?', a: 'We run our own verification infrastructure instead of reselling someone else’s, and we don’t bundle features you didn’t ask for. Per-email cost drops further as packs get larger.' },
]

export default function PricingPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-16 sm:pt-24">
        <Reveal>
          <p className="eyebrow text-hound">The rates</p>
          <h1 className="display mt-4 max-w-2xl font-semibold text-ink text-fluid-5xl">
            Pay for what you verify. Nothing you don’t.
          </h1>
          <p className="mt-5 max-w-xl text-ink-2 text-fluid-lg leading-relaxed">
            No subscriptions, no expiry, no per-seat games. Buy a pack once and
            spend it whenever. Start with 300 free verifications — no credit card.
          </p>
        </Reveal>
      </section>

      {/* Packs */}
      <Section divide={false} className="!pt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKS.map((pack, i) => {
            const featured = pack.id === 'pack_10k'
            return (
              <Reveal key={pack.id} delay={i * 55}>
                <div
                  className={`panel group relative flex h-full flex-col p-6 transition-all hover:shadow-[var(--shadow-panel)] ${
                    featured ? 'border-hound ring-1 ring-hound/25' : 'hover:border-hound'
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-2.5 left-6 rounded-full bg-hound px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-hound-ink">
                      Most popular
                    </span>
                  )}
                  <p className="eyebrow">{pack.credits.toLocaleString()} verifications</p>
                  <p className="display mt-3 text-4xl font-semibold text-ink">
                    ${(pack.price / 100).toFixed(0)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink-3">
                    ${(pack.price / pack.credits / 100).toFixed(4)} per email
                  </p>
                  <div className="mt-6">
                    <BuyPackButton packId={pack.id} />
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
        <p className="mt-8 font-mono text-xs text-ink-3">
          Every pack — 7-point engine · bulk CSV · API access · credits never expire · no monthly minimum
        </p>
      </Section>

      {/* Comparison */}
      <Section tint>
        <SectionHeading
          eyebrow="The lineup"
          title="More checks, a real verdict, half the price"
          lede="Compared against how most email-verification tools price and behave. Figures are defensible ranges — where a number would be a guess, we say so."
        />
        <Reveal className="mt-12">
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[34rem]">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-4 py-4 text-left"><span className="eyebrow">Feature</span></th>
                  <th className="px-4 py-4">
                    <span className="font-mono text-sm font-semibold text-hound">Mailhound</span>
                  </th>
                  <th className="px-4 py-4">
                    <span className="font-mono text-sm text-ink-3">Most tools</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARE.length - 1 ? 'border-b border-line' : ''}>
                    <td className="px-4 py-3.5 text-sm text-ink">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-sm font-semibold text-hound">
                      {row.mailhound}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-sm text-ink-3">
                      {row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* Watch plan — the one optional subscription */}
      <Section>
        <SectionHeading
          eyebrow="Optional add-on"
          title="Keep watch after the list is clean"
          lede="Verification is a one-time job. Reputation isn’t. Watch monitors your sending domains against major blacklists around the clock and emails you the moment one flags."
        />
        <Reveal className="mt-12">
          <div className="panel flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg">
              <div className="flex items-baseline gap-2">
                <span className="display text-4xl font-semibold text-ink">
                  ${(WATCH_PLANS[0].price / 100).toFixed(0)}
                </span>
                <span className="font-mono text-sm text-ink-3">/ month</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {[
                  `Monitor up to ${WATCH_PLANS[0].domainLimit} sending domains`,
                  'Continuous checks against major DNSBLs',
                  'Email alerts the moment a domain is listed',
                  'Cancel anytime — no annual lock-in',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-hound" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/monitoring" className="btn-hound shrink-0 self-start">
              Set up monitoring
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section tint>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Before you buy"
            title="Straight answers on credits and billing"
            lede="The questions buyers send us most, answered plainly."
          />
          <div className="lg:pt-2">
            <Faq items={FAQ} />
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Case closed"
        title="Start free. Pay only when you scale."
        sub="300 free verifications · no credit card · credits never expire"
      />

      <SiteFooter />
    </>
  )
}
