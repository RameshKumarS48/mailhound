import Link from 'next/link'
import { VerifyForm } from '@/components/verify-form'
import { SiteNav, SiteFooter } from '@/components/site-chrome'
import { CREDIT_PACKS } from '@/lib/dodo'

// The engine runs as an ordered pipeline with early-exit, so the numbering
// here is real: it's the sequence a suspect address is walked through.
const CHECKS = [
  { name: 'Syntax validation', who: 'All tools', desc: 'Every typo, missing @, and broken format caught before any network call.' },
  { name: 'Domain existence', who: 'All tools', desc: 'Confirm the domain is live and resolving — not just syntactically plausible.' },
  { name: 'MX record lookup', who: 'All tools', desc: 'Verify the domain has mail exchange records configured and accepting connections.' },
  { name: 'SMTP handshake', who: 'Most tools', desc: 'Knock on the mail server and confirm this exact mailbox exists right now.' },
  { name: 'Disposable detection', who: 'Few tools', desc: 'Flag throwaway addresses from 10,000+ known temporary email providers.' },
  { name: 'Role address filter', who: 'Few tools', desc: 'Identify generic inboxes — info@, admin@, support@ — that drag down engagement.' },
  { name: 'Catch-all detection', who: 'Mailhound', desc: 'Detect domains that accept every address and return a verdict — not a shrug marked "unknown".' },
]

const EXHIBITS = [
  {
    tag: 'Exhibit A',
    charge: 'The reputation killer',
    title: 'Bounces quietly tank your sender score',
    desc: 'Gmail, Outlook, and Yahoo track bounce rate closely. Once it climbs past 2%, the inbox starts trusting you less — and your team doesn’t notice until campaigns stop performing.',
    finding: '2% bounce rate = ISP throttling begins',
  },
  {
    tag: 'Exhibit B',
    charge: 'The gray zone',
    title: '"Unknown" leaves you choosing blind',
    desc: 'Catch-all domains accept every address, valid or not. Other tools return "unknown" and hand the decision back to you. Mailhound returns an actual verdict.',
    finding: '20–40% of B2B lists land here',
  },
  {
    tag: 'Exhibit C',
    charge: 'The ghost budget',
    title: 'Invalid addresses burn budget twice',
    desc: 'You pay for the send. You pay again in corrupted analytics that make the next campaign repeat the same mistake.',
    finding: 'Up to 25% of list spend wasted',
  },
]

const CASE_STATS = [
  { value: '99.9%', label: 'Accuracy' },
  { value: '~2s', label: 'Per verdict' },
  { value: '$0.005', label: 'Per email · 1K pack' },
  { value: 'Never', label: 'Credits expire' },
]

export default function Home() {
  return (
    <>
      <SiteNav />

      {/* Hero — the intake desk. The product's one trick is front and center. */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Case file · email deliverability</p>
            <h1 className="display mt-5 text-[2.9rem] font-semibold text-ink sm:text-[3.8rem]">
              Every dead inbox,{' '}
              <em className="not-italic text-hound" style={{ fontStyle: 'italic' }}>
                sniffed out
              </em>{' '}
              before you hit send.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              A seven-point engine that returns a real verdict — deliverable, risky,
              or dead — never a shrug. Half the price of ZeroBounce, and your credits
              never expire.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-hound">
                Start free — 300 credits
              </Link>
              <Link href="/pricing" className="btn-ghost">
                See the rates
              </Link>
            </div>

            {/* case-stats ledger — not a row of big glowing numbers */}
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-y-4 border-t border-line pt-6 sm:grid-cols-4">
              {CASE_STATS.map((s, i) => (
                <div key={s.label} className={i < CASE_STATS.length - 1 ? 'sm:border-r sm:border-line' : ''}>
                  <dt className="font-mono text-lg font-semibold text-ink">{s.value}</dt>
                  <dd className="eyebrow mt-1">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* intake + specimen report */}
          <div className="space-y-4">
            <div className="panel p-1.5 shadow-[0_1px_0_var(--line-2)]">
              <div className="rounded-[calc(var(--radius-lg)-0.35rem)] border border-line bg-paper px-5 py-6 sm:px-7 sm:py-8">
                <div className="mb-5 flex items-center justify-between">
                  <p className="eyebrow">Submit a suspect address</p>
                  <span className="eyebrow text-hound">Free · no account</span>
                </div>
                <VerifyForm />
                <p className="mt-5 border-t border-dashed border-line pt-4 font-mono text-xs leading-relaxed text-ink-3">
                  Single checks are on the house. Sign up for 300 free credits and bulk CSV — no card, no expiry.
                </p>
              </div>
            </div>

            <SpecimenReport />
          </div>
        </div>
      </section>

      {/* The charges */}
      <section className="border-t border-line bg-paper-2/50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">The charges</p>
            <h2 className="display mt-4 text-4xl font-semibold text-ink">
              Three ways bad email is costing you right now
            </h2>
            <p className="mt-4 text-ink-2">
              Every unverified send nudges your sender score toward throttling. Once
              Gmail starts filtering you, even your good addresses stop landing.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {EXHIBITS.map(x => (
              <article key={x.tag} className="panel flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-hound">{x.tag}</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-3">{x.charge}</span>
                </div>
                <h3 className="display mt-4 text-xl font-semibold leading-tight text-ink">{x.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{x.desc}</p>
                <p className="mt-5 border-t border-dashed border-line pt-3 font-mono text-xs text-invalid">
                  {x.finding}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Chain of custody — the 7-check pipeline */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">Chain of custody</p>
            <h2 className="display mt-4 text-4xl font-semibold text-ink">
              Seven checks, run in order, every one explained
            </h2>
            <p className="mt-4 text-ink-2">
              Most tools stop at four or five. Each address is walked through all
              seven — and the moment one fails, you get the exact reason why.
            </p>
          </div>

          <ol className="mt-14 space-y-0">
            {CHECKS.map((c, i) => {
              const exclusive = c.who === 'Mailhound'
              return (
                <li
                  key={c.name}
                  className="group grid grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3.5rem_1fr]"
                >
                  {/* spine */}
                  <div className="flex flex-col items-center">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold"
                      style={
                        exclusive
                          ? { background: 'var(--hound)', color: 'var(--hound-ink)', borderColor: 'var(--hound)' }
                          : { borderColor: 'var(--line-2)', color: 'var(--ink-2)' }
                      }
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {i < CHECKS.length - 1 && <span className="w-px flex-1 bg-line" />}
                  </div>
                  {/* content */}
                  <div className={`min-w-0 pb-8 ${i === 0 ? '' : 'pt-1'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-ink">{c.name}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider"
                        style={
                          exclusive
                            ? { background: 'var(--hound)', color: 'var(--hound-ink)' }
                            : { background: 'var(--paper-3)', color: 'var(--ink-2)' }
                        }
                      >
                        {exclusive ? 'Mailhound only' : c.who}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-2">{c.desc}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Rates */}
      <section id="pricing" className="border-t border-line bg-paper-2/50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">The rates</p>
            <h2 className="display mt-4 text-4xl font-semibold text-ink">
              Buy once, use whenever. No subscriptions, no expiry.
            </h2>
            <p className="mt-4 text-ink-2">
              Start with 300 free credits — no credit card. Every pack runs the full
              seven-point engine and bulk CSV.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CREDIT_PACKS.map(pack => (
              <div key={pack.id} className="panel group flex flex-col p-6 transition-colors hover:border-hound">
                <p className="eyebrow">{pack.credits.toLocaleString()} verifications</p>
                <p className="display mt-3 text-4xl font-semibold text-ink">
                  ${(pack.price / 100).toFixed(0)}
                </p>
                <p className="mt-1 font-mono text-xs text-ink-3">
                  ${(pack.price / pack.credits / 100).toFixed(4)} per email
                </p>
                <Link
                  href="/signup"
                  className="btn-ghost mt-6 w-full transition-colors group-hover:border-hound group-hover:bg-hound group-hover:text-hound-ink"
                >
                  Buy pack
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 font-mono text-xs text-ink-3">
            All packs — 7-point engine · bulk CSV · credits never expire · no monthly minimums
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="eyebrow">Case closed</p>
          <h2 className="display mx-auto mt-5 max-w-2xl text-4xl font-semibold text-ink sm:text-5xl">
            Stop bleeding deliverability on dead inboxes.
          </h2>
          <p className="mt-5 text-ink-2">300 free credits. No credit card. Set up in about a minute.</p>
          <Link href="/signup" className="btn-hound mt-8 !px-8 !py-4 text-lg">
            Start free — 300 credits
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}

// A static example of a returned verdict — shows the signature stamp and
// evidence ledger at rest, so the hero previews the product's one trick.
const SPECIMEN_EVIDENCE: [string, string, boolean][] = [
  ['Syntax', 'RFC-5322 valid', true],
  ['Domain', 'acmecorp.com resolves', true],
  ['MX record', 'aspmx.l.google.com', true],
  ['SMTP probe', 'Mailbox accepts', true],
  ['Disposable', 'Not a throwaway', true],
  ['Role address', 'Personal inbox', true],
]

function SpecimenReport() {
  return (
    <div className="panel overflow-hidden">
      <div
        className="flex items-start justify-between gap-4 border-b border-dashed border-line px-5 py-4"
        style={{ background: 'var(--valid-bg)' }}
      >
        <div className="min-w-0">
          <p className="eyebrow">Specimen · field report</p>
          <p className="mt-1 truncate font-mono text-sm text-ink">priya@acmecorp.com</p>
          <p className="mt-1 text-xs text-ink-2">
            Confidence <span className="font-mono font-semibold text-valid">98</span>/100
          </p>
        </div>
        <div className="stamp shrink-0 text-center text-valid">
          <span className="block text-base leading-none">Valid</span>
          <span className="mt-1 block text-[0.5rem] tracking-[0.2em] opacity-80">Deliverable</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="eyebrow mb-3">Evidence · 6 checks</p>
        <ul className="space-y-2">
          {SPECIMEN_EVIDENCE.map(([label, detail]) => (
            <li key={label} className="flex items-baseline text-sm">
              <span className="font-mono text-ink">{label}</span>
              <span className="leader" />
              <span className="max-w-[45%] truncate text-right font-mono text-xs text-ink-2">{detail}</span>
              <span
                className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-valid"
                style={{ background: 'var(--valid-bg)' }}
              >
                ✓
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
