import Link from 'next/link'
import { CREDIT_PACKS } from '@/lib/stripe'

const COMPARE = [
  { feature: 'Price per 1K emails', mailhound: '$5', zerobounce: '$8', verifox: '$9' },
  { feature: 'Checks run', mailhound: '7', zerobounce: '4', verifox: '9' },
  { feature: 'Catch-all detection', mailhound: '✓', zerobounce: '✗', verifox: '✓' },
  { feature: 'Role address filter', mailhound: '✓', zerobounce: '✗', verifox: '✓' },
  { feature: 'Reason field on results', mailhound: '✓', zerobounce: '✗', verifox: '✗' },
  { feature: 'Credits expire?', mailhound: 'Never', zerobounce: 'Monthly', verifox: 'Never' },
  { feature: 'Free tier (no CC)', mailhound: '300 credits', zerobounce: '✗', verifox: '1,000 credits' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-20">
        <div className="text-center space-y-4">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">← Back</Link>
          <h1 className="text-4xl font-black">Simple pricing. Half the price.</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            No subscriptions. No expiry. Buy once, use whenever.
            Start free — 300 credits, no credit card.
          </p>
        </div>

        {/* Credit packs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CREDIT_PACKS.map(pack => (
            <div key={pack.id} className="bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-4 transition-colors group">
              <div>
                <p className="text-3xl font-black">{pack.credits.toLocaleString()}</p>
                <p className="text-zinc-500 text-sm">verifications</p>
              </div>
              <div>
                <p className="text-4xl font-black">${(pack.price / 100).toFixed(0)}</p>
                <p className="text-xs text-zinc-500">${(pack.price / pack.credits / 100).toFixed(4)} per email</p>
              </div>
              <Link href="/signup">
                <span className="block text-center bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black text-white text-sm font-semibold py-3 rounded-lg transition-colors cursor-pointer">
                  Buy Pack
                </span>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-zinc-500">
          All packs: 7-point engine · Bulk CSV · API access · Credits never expire · No monthly minimum
        </p>

        {/* Comparison */}
        <div>
          <h2 className="text-2xl font-black text-center mb-8">How we compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 pr-6 text-zinc-400 font-normal">Feature</th>
                  <th className="py-3 px-4 text-amber-400 font-bold">Mailhound</th>
                  <th className="py-3 px-4 text-zinc-400 font-normal">ZeroBounce</th>
                  <th className="py-3 px-4 text-zinc-400 font-normal">Verifox</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(row => (
                  <tr key={row.feature} className="border-b border-zinc-800/50">
                    <td className="py-3 pr-6 text-zinc-300">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-amber-400 font-semibold">{row.mailhound}</td>
                    <td className="py-3 px-4 text-center text-zinc-400">{row.zerobounce}</td>
                    <td className="py-3 px-4 text-center text-zinc-400">{row.verifox}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link href="/signup">
            <span className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors cursor-pointer">
              Start Free — 300 Credits
            </span>
          </Link>
          <p className="text-sm text-zinc-500">No credit card · No monthly minimum · Credits never expire</p>
        </div>
      </div>
    </div>
  )
}
