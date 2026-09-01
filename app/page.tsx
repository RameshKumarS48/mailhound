import Link from 'next/link'
import { VerifyForm } from '@/components/verify-form'
import { SiteNav, SiteFooter } from '@/components/site-chrome'
import { Section, SectionHeading } from '@/components/site/section'
import { Reveal } from '@/components/site/reveal'
import { CountUp } from '@/components/site/count-up'
import { HeroSpecimen } from '@/components/site/hero-specimen'
import { ProofStrip, TrustBand } from '@/components/site/trust-band'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
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

const FAQ = [
  { q: 'What counts as one credit?', a: 'One email verification is one credit. Domain Health is 5, a blacklist check is 3, and Email Finder is 10 — but Finder only charges on a verified hit. Nothing is charged for a result we can’t stand behind.' },
  { q: 'Do credits expire?', a: 'No. Buy a pack once and the credits sit in your balance until you use them — no monthly reset, no subscription, no “use it or lose it”.' },
  { q: 'How is this half the price of ZeroBounce?', a: 'We run our own verification infrastructure instead of reselling, and we don’t bundle features you didn’t ask for. A 1,000-email pack is $5 — $0.005 per address — and it gets cheaper per email as packs get larger.' },
  { q: 'What’s the difference between “risky” and “invalid”?', a: 'Invalid means the mailbox was rejected — do not send. Risky means it’s technically reachable but carries a flag (a role inbox, a catch-all domain, or a low-confidence signal) so you can decide with the reason in hand.' },
  { q: 'Is there an API?', a: <>Yes — one Bearer-authenticated endpoint runs the full seven-point engine on every request, sharing the same credit balance as the dashboard. See the <Link href="/docs" className="text-hound underline underline-offset-2">API docs</Link>.</> },
  { q: 'Do you store the lists I upload?', a: 'We verify your addresses and return the results. We don’t sell, seed, or reuse your list. Payment and card handling are fully off-loaded to our processor.' },
]

export default function Home() {
  return (
    <>
      <SiteNav />

      {/* Hero — the intake desk. The product's one trick is front and center. */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pt-20">
        <div className="grid items-start gap-8 lg:gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Case file · email deliverability</p>
            <h1 className="display mt-5 font-semibold text-ink text-fluid-5xl">
              Every dead inbox,{' '}
              <em className="not-italic text-hound" style={{ fontStyle: 'italic' }}>
                sniffed out
              </em>{' '}
              before you hit send.
            </h1>
            <p className="mt-6 max-w-lg text-ink-2 text-fluid-lg leading-relaxed">
              A seven-point engine that returns a real verdict — deliverable, risky,
              or dead — never a shrug. Half the price of ZeroBounce, and your credits
              never expire.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-hound">
                Start free — 300 verifications
              </Link>
              <Link href="/pricing" className="btn-ghost">
                See the rates
              </Link>
            </div>

            <div className="mt-6">
              <ProofStrip items={['No credit card', 'Credits never expire', 'Never returns “unknown”']} />
            </div>

            {/* case-stats ledger — not a row of big glowing numbers */}
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-y-4 border-t border-line pt-6 sm:grid-cols-4">
              <Stat value={<CountUp value={7} />} label="Checks · every address" borderR />
              <Stat value="~2s" label="Per verdict" borderR />
              <Stat value="$0.005" label="Per email · 1K pack" borderR />
              <Stat value="Never" label="Credits expire" />
            </dl>
          </div>

          {/* intake + specimen report */}
          <div className="space-y-4">
            <div className="panel p-1.5" style={{ boxShadow: 'var(--shadow-panel)' }}>
              <div className="rounded-[calc(var(--radius-lg)-0.35rem)] border border-line bg-paper px-5 py-6 sm:px-7 sm:py-8">
                <div className="mb-5 flex items-center justify-between">
                  <p className="eyebrow">Submit a suspect address</p>
                  <span className="eyebrow text-hound">Free · no account</span>
                </div>
                <VerifyForm />
                <p className="mt-5 border-t border-dashed border-line pt-4 font-mono text-xs leading-relaxed text-ink-3">
                  Single checks are on the house. Sign up for 300 free verifications and bulk CSV — no card, no expiry.
                </p>
              </div>
            </div>

            <HeroSpecimen />
          </div>
        </div>
      </section>

      {/* The charges */}
      <Section tint>
        <SectionHeading
          eyebrow="The charges"
          title="Three ways bad email is costing you right now"
          lede="Every unverified send nudges your sender score toward throttling. Once Gmail starts filtering you, even your good addresses stop landing."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {EXHIBITS.map((x, i) => (
            <Reveal key={x.tag} delay={i * 80} className="h-full">
              <article className="panel flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-panel)]">
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
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Chain of custody — the 7-check pipeline */}
      <Section>
        <SectionHeading
          eyebrow="Chain of custody"
          title="Seven checks, run in order, every one explained"
          lede="Most tools stop at four or five. Each address is walked through all seven — and the moment one fails, you get the exact reason why."
        />
        <ol className="mt-14 space-y-0">
          {CHECKS.map((c, i) => {
            const exclusive = c.who === 'Mailhound'
            return (
              <li key={c.name} className="group grid grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3.5rem_1fr]">
                {/* spine */}
                <div className="flex flex-col items-center">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-transform group-hover:scale-110"
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
      </Section>

      {/* Data handling — honest trust */}
      <Section tint>
        <SectionHeading
          eyebrow="Handled with care"
          title="Serious about your list and your sender reputation"
          lede="No fine print games. Here’s exactly how your data and payments are handled."
        />
        <div className="mt-12">
          <TrustBand />
        </div>
      </Section>

      {/* Rates */}
      <Section id="pricing">
        <SectionHeading
          eyebrow="The rates"
          title="Buy once, use whenever. No subscriptions, no expiry."
          lede="Start with 300 free verifications — no credit card. Every pack runs the full seven-point engine and bulk CSV."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKS.map((pack, i) => (
            <Reveal key={pack.id} delay={i * 60}>
              <div className="panel group flex flex-col p-6 transition-all hover:border-hound hover:shadow-[var(--shadow-panel)]">
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
            </Reveal>
          ))}
        </div>
        <p className="mt-8 font-mono text-xs text-ink-3">
          All packs — 7-point engine · bulk CSV · credits never expire · no monthly minimums
        </p>
      </Section>

      {/* FAQ */}
      <Section tint>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Before you ask"
            title="The questions buyers actually send us"
            lede="Straight answers on credits, pricing, and how the verdict is reached."
          />
          <div className="lg:pt-2">
            <Faq items={FAQ} />
          </div>
        </div>
      </Section>

      <CtaBand title="Stop bleeding deliverability on dead inboxes." />

      <SiteFooter />
    </>
  )
}

function Stat({
  value,
  label,
  borderR = false,
}: {
  value: React.ReactNode
  label: string
  borderR?: boolean
}) {
  return (
    <div className={borderR ? 'sm:border-r sm:border-line' : ''}>
      <dt className="font-mono text-lg font-semibold text-ink">{value}</dt>
      <dd className="eyebrow mt-1">{label}</dd>
    </div>
  )
}
