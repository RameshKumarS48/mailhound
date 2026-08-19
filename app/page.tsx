import Link from 'next/link'
import { VerifyForm } from '@/components/verify-form'
import { CREDIT_PACKS } from '@/lib/dodo'

const CHECKS = [
  { name: 'Syntax Validation', who: 'All tools', desc: 'Every typo, missing @, and broken format caught before any network call.' },
  { name: 'Domain Existence', who: 'All tools', desc: 'Confirm the domain is live and resolving — not just syntactically plausible.' },
  { name: 'MX Record Lookup', who: 'All tools', desc: 'Verify the domain has mail exchange records configured and accepting connections.' },
  { name: 'SMTP Handshake', who: 'Most tools', desc: 'Knock on the mail server and confirm this exact mailbox exists right now.' },
  { name: 'Disposable Detection', who: 'Few tools', desc: 'Flag throwaway addresses from 10,000+ known temporary email providers.' },
  { name: 'Role Address Filter', who: 'Few tools', desc: 'Identify generic inboxes — info@, admin@, support@ — that drag down engagement.' },
  { name: 'Catch-All Detection', who: 'Mailhound', desc: 'Detect domains that accept every address and flag the risk — not leave it as "unknown".' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold tracking-tight">Mailhound</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/mx-lookup" className="text-sm text-zinc-400 hover:text-white transition-colors">Free Tools</Link>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Login</Link>
            <Link href="/signup">
              <span className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block">
                Get Started Free
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm text-amber-400">
            <span>🐾</span> 300 free credits — no credit card
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
            Email Verification<br />
            <span className="text-amber-400">That Pays for Itself</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            7-point engine. Real verdicts, not &quot;unknown.&quot; Half the price of the competition.
            Stop bleeding deliverability on dead inboxes.
          </p>
          <VerifyForm />
          <p className="text-sm text-zinc-500">
            No account needed for single checks · 300 free credits on signup · Credits never expire
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-800/60 px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '99.9%', label: 'Accuracy Rate' },
            { value: '2s', label: 'Avg Verification' },
            { value: '$0.005', label: 'Per Email (1K pack)' },
            { value: '∞', label: 'Credit Expiry' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-amber-400">{s.value}</p>
              <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problems */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">Three enemies destroying your list</h2>
          <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">
            Every unverified send nudges your sender score toward throttling. Once Gmail starts filtering you, even your good addresses stop landing.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                tag: '01 — REPUTATION KILLER',
                title: 'Bounces quietly tank your sender score',
                desc: 'Gmail, Outlook, and Yahoo track bounce rate closely. Once it climbs past 2%, the inbox starts trusting you less — and your team doesn\'t notice until campaigns stop performing.',
                stat: '2% bounce rate = ISP throttling starts',
              },
              {
                tag: '02 — THE GRAY ZONE',
                title: '"Unknown" leaves you choosing blind',
                desc: 'Catch-all domains accept every address, valid or not. Other tools return "unknown" and hand the decision back to you. Mailhound returns an actual verdict.',
                stat: '20–40% of B2B lists land here',
              },
              {
                tag: '03 — GHOST BUDGET',
                title: 'Invalid addresses burn budget twice',
                desc: 'You pay for the send. You pay again in corrupted analytics that make the next campaign repeat the same mistake.',
                stat: 'Up to 25% of list spend wasted',
              },
            ].map(p => (
              <div key={p.tag} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-mono text-amber-500 uppercase tracking-widest">{p.tag}</p>
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-sm text-zinc-400">{p.desc}</p>
                <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">{p.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engine */}
      <section className="px-6 py-24 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">7 checks. Zero guesswork.</h2>
            <p className="text-zinc-400">While competitors run 4–5 checks, Mailhound runs 7 and tells you exactly why an address fails.</p>
          </div>
          <div className="space-y-3">
            {CHECKS.map((c, i) => (
              <div key={c.name} className="flex items-start gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <span className="text-amber-500 font-mono text-sm w-5 shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold">{c.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      c.who === 'Mailhound'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>{c.who}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-black">Simple pricing. No subscriptions. No expiry.</h2>
          </div>
          <p className="text-center text-zinc-400 mb-12">
            Buy once, use whenever. Start with 300 free credits — no credit card.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREDIT_PACKS.map(pack => (
              <div key={pack.id} className="bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 transition-colors group">
                <p className="text-2xl font-black">{pack.credits.toLocaleString()}</p>
                <p className="text-zinc-500 text-sm mb-4">verifications</p>
                <p className="text-3xl font-black text-white">${(pack.price / 100).toFixed(0)}</p>
                <p className="text-xs text-zinc-500 mb-6">${(pack.price / pack.credits / 100).toFixed(4)} per email</p>
                <Link href="/signup">
                  <span className="block text-center bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer">
                    Buy Pack
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500 mt-8">
            All packs: 7-point engine · Bulk CSV · Credits never expire · No monthly minimums
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-zinc-800/60">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-black">Stop bleeding deliverability.</h2>
          <p className="text-zinc-400">300 free credits. No credit card. Setup in 60 seconds.</p>
          <Link href="/signup">
            <span className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors cursor-pointer">
              Start Free — 300 Credits
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span>🐕</span>
            <span className="font-semibold text-zinc-300">Mailhound</span>
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/mx-lookup" className="hover:text-white transition-colors">MX Lookup</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          <p>© 2026 Mailhound. Credits never expire.</p>
        </div>
      </footer>
    </div>
  )
}
