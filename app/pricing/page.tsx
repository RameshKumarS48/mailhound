import Link from 'next/link'
import { CREDIT_PACKS } from '@/lib/dodo'
import { BuyPackButton } from '@/components/buy-pack-button'
import { SiteNav, SiteFooter } from '@/components/site-chrome'

const COMPARE = [
  { feature: 'Price per 1K emails', mailhound: '$5', zerobounce: '$8', verifox: '$9' },
  { feature: 'Checks run', mailhound: '7', zerobounce: '4', verifox: '9' },
  { feature: 'Catch-all detection', mailhound: '✓', zerobounce: '✗', verifox: '✓' },
  { feature: 'Role address filter', mailhound: '✓', zerobounce: '✗', verifox: '✓' },
  { feature: 'Reason field on results', mailhound: '✓', zerobounce: '✗', verifox: '✗' },
  { feature: 'Credits expire?', mailhound: 'Never', zerobounce: 'Monthly', verifox: 'Never' },
  { feature: 'Free tier (no card)', mailhound: '300 credits', zerobounce: '✗', verifox: '1,000 credits' },
]

function Cell({ value, highlight }: { value: string; highlight?: boolean }) {
  const mark =
    value === '✓' ? 'var(--valid)' : value === '✗' ? 'var(--invalid)' : undefined
  return (
    <td
      className="px-4 py-3.5 text-center font-mono text-sm"
      style={{ color: highlight ? 'var(--hound)' : mark ?? 'var(--ink-2)', fontWeight: highlight ? 600 : 400 }}
    >
      {value}
    </td>
  )
}

export default function PricingPage() {
  return (
    <>
      <SiteNav />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 sm:pt-24">
        <p className="eyebrow">The rates</p>
        <h1 className="display mt-4 max-w-2xl text-5xl font-semibold text-ink">
          Simple pricing, half the price
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-2">
          No subscriptions. No expiry. Buy once, use whenever. Start free — 300
          credits, no credit card.
        </p>
      </section>

      {/* Packs */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKS.map(pack => (
            <div key={pack.id} className="panel group flex flex-col p-6">
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
          ))}
        </div>
        <p className="mt-8 font-mono text-xs text-ink-3">
          All packs — 7-point engine · bulk CSV · API access · credits never expire · no monthly minimum
        </p>
      </section>

      {/* Comparison */}
      <section className="border-t border-line bg-paper-2/50">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <p className="eyebrow">The lineup</p>
          <h2 className="display mt-4 text-3xl font-semibold text-ink">How we compare</h2>
          <div className="panel mt-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-4 py-4 text-left">
                    <span className="eyebrow">Feature</span>
                  </th>
                  <th className="px-4 py-4">
                    <span className="font-mono text-sm font-semibold text-hound">Mailhound</span>
                  </th>
                  <th className="px-4 py-4">
                    <span className="font-mono text-sm text-ink-3">ZeroBounce</span>
                  </th>
                  <th className="px-4 py-4">
                    <span className="font-mono text-sm text-ink-3">Verifox</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARE.length - 1 ? 'border-b border-line' : ''}>
                    <td className="px-4 py-3.5 text-sm text-ink">{row.feature}</td>
                    <Cell value={row.mailhound} highlight />
                    <Cell value={row.zerobounce} />
                    <Cell value={row.verifox} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="eyebrow">Case closed</p>
          <h2 className="display mx-auto mt-5 max-w-xl text-4xl font-semibold text-ink">
            Start free. Pay only when you scale.
          </h2>
          <Link href="/signup" className="btn-hound mt-8 !px-8 !py-4 text-lg">
            Start free — 300 credits
          </Link>
          <p className="mt-4 font-mono text-xs text-ink-3">
            No credit card · no monthly minimum · credits never expire
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
