import Link from 'next/link'
import { VerifyForm } from '@/components/verify-form'
import { SiteNav, SiteFooter } from '@/components/site-chrome'
import { Section, SectionHeading } from '@/components/site/section'
import { CountUp } from '@/components/site/count-up'
import { HeroSpecimen } from '@/components/site/hero-specimen'
import { ProofStrip, TrustBand } from '@/components/site/trust-band'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
import { StaggerGroup, StaggerItem } from '@/components/site/motion/stagger'
import { PipelineScene, type SceneStep } from '@/components/site/motion/scroll-scene'
import { Marquee } from '@/components/site/motion/marquee'
import { Magnetic } from '@/components/site/motion/magnetic'
import { CREDIT_PACKS } from '@/lib/dodo'

// The engine runs as an ordered pipeline with early-exit, so the sequence here
// is real: it's the order a single address is walked through.
const CHECKS: SceneStep[] = [
  { name: 'Syntax validation', who: 'All tools', desc: 'Every typo, missing @, and broken format is caught before any network call.' },
  { name: 'Domain existence', who: 'All tools', desc: 'Confirm the domain is live and resolving — not just syntactically plausible.' },
  { name: 'MX record lookup', who: 'All tools', desc: 'Verify the domain has mail-exchange records configured and accepting connections.' },
  { name: 'SMTP handshake', who: 'Most tools', desc: 'Open a connection to the mail server and confirm the mailbox exists, where the provider allows it.' },
  { name: 'Disposable detection', who: 'Few tools', desc: 'Flag throwaway addresses from 10,000+ known temporary email providers.' },
  { name: 'Role address filter', who: 'Few tools', desc: 'Identify generic inboxes — info@, admin@, support@ — that quietly drag down engagement.' },
  { name: 'Catch-all detection', who: 'Mailhound', desc: 'Detect domains that accept every address and return a verdict — not a shrug marked "unknown".', exclusive: true },
]

// The seven checks, run as a marquee of plain capability facts (never fake logos).
const CHECK_TICKER = [
  'Syntax', 'Domain', 'MX record', 'SMTP handshake', 'Disposable', 'Role address', 'Catch-all',
]

const REASONS = [
  {
    kicker: 'Sender reputation',
    title: 'Bounces quietly erode your sender score',
    desc: 'Gmail, Outlook, and Yahoo watch bounce rate closely. Past roughly 2% the inbox starts trusting you less — and teams rarely notice until campaigns stop landing.',
    stat: '~2% bounce rate → throttling begins',
  },
  {
    kicker: 'The gray zone',
    title: '“Unknown” makes you decide blind',
    desc: 'Catch-all domains accept every address, valid or not. Most tools return “unknown” and hand the call back to you. Mailhound returns an actual verdict with the reason.',
    stat: '20–40% of B2B lists are catch-all',
  },
  {
    kicker: 'Wasted spend',
    title: 'Invalid addresses cost you twice',
    desc: 'You pay to send to an address that never existed. Then you pay again in skewed analytics that push the next campaign to repeat the mistake.',
    stat: 'Every invalid = a send + dirty data',
  },
]

const FAQ = [
  { q: 'What counts as one credit?', a: 'One email verification is one credit. Domain Health is 5, a blacklist check is 3, and Email Finder is 10 — but Finder only charges on a verified hit. Nothing is charged for a result we can’t stand behind.' },
  { q: 'Do credits expire?', a: 'No. Buy a pack once and the credits sit in your balance until you use them — no monthly reset, no subscription, no “use it or lose it”.' },
  { q: 'How is this half the price of ZeroBounce?', a: 'We run our own verification infrastructure instead of reselling, and we don’t bundle features you didn’t ask for. A 1,000-email pack is $5 — $0.005 per address — and it gets cheaper per email as packs get larger.' },
  { q: 'What’s the difference between “risky” and “invalid”?', a: 'Invalid means the mailbox was rejected — do not send. Risky means it’s technically reachable but carries a flag (a role inbox, a catch-all domain, or a low-confidence signal), so you can decide with the reason in hand.' },
  { q: 'Is there an API?', a: <>Yes — one Bearer-authenticated endpoint runs the full seven checks on every request, sharing the same credit balance as the dashboard. See the <Link href="/docs" className="text-hound underline underline-offset-2">API docs</Link>.</> },
  { q: 'Do you store the lists I upload?', a: 'We verify your addresses and return the results. We don’t sell, seed, or reuse your list. Payment and card handling are fully off-loaded to our processor.' },
]

export default function Home() {
  return (
    <>
      <SiteNav />

      {/* Hero — the live verifier and a sample result are the centerpiece. */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <div className="grid items-start gap-8 lg:gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0">
            <p className="eyebrow">Email deliverability</p>
            <h1 className="display mt-5 font-semibold text-ink text-fluid-5xl">
              Know which emails will land,{' '}
              <em className="text-hound">before</em> you hit send.
            </h1>
            <p className="mt-6 max-w-lg text-ink-2 text-fluid-lg leading-relaxed">
              Seven checks on every address return a real verdict — deliverable,
              risky, or do-not-send — with the reason in plain language. Half the
              price of ZeroBounce, and your credits never expire.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link href="/signup" className="btn-hound">
                  Start free — 300 verifications
                </Link>
              </Magnetic>
              <Link href="/pricing" className="btn-ghost">
                See pricing
              </Link>
            </div>

            <div className="mt-6">
              <ProofStrip items={['No credit card', 'Credits never expire', 'Never returns “unknown”']} />
            </div>

            {/* case-stats ledger — quiet numbers, not a row of glowing figures */}
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-y-4 border-t border-line pt-6 sm:grid-cols-4">
              <Stat value={<CountUp value={7} />} label="Checks · every address" borderR />
              <Stat value="~2s" label="Per verdict" borderR />
              <Stat value="$0.005" label="Per email · 1K pack" borderR />
              <Stat value="Never" label="Credits expire" />
            </dl>
          </div>

          {/* intake + sample result */}
          <div className="min-w-0 space-y-4">
            <div className="panel p-1.5" style={{ boxShadow: 'var(--shadow-panel)' }}>
              <div className="rounded-[calc(var(--radius-lg)-0.35rem)] border border-line bg-paper px-5 py-6 sm:px-7 sm:py-8">
                <div className="mb-5 flex items-center justify-between">
                  <p className="eyebrow">Verify an address</p>
                  <span className="eyebrow text-hound">Free · no account</span>
                </div>
                <VerifyForm />
                <p className="mt-5 border-t border-dashed border-line pt-4 font-mono text-xs leading-relaxed text-ink-3">
                  Single checks are free. Sign up for 300 verifications and bulk CSV — no card, no expiry.
                </p>
              </div>
            </div>

            <HeroSpecimen />
          </div>
        </div>
      </section>

      {/* Proof — the seven real checks, on a quiet ticker (no fabricated logos) */}
      <div className="border-y border-line bg-paper-2/50 py-4">
        <Marquee
          items={CHECK_TICKER.map((c) => (
            <span key={c} className="flex items-center gap-2 px-2 font-mono text-sm text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-hound" aria-hidden />
              {c}
            </span>
          ))}
        />
      </div>

      {/* Why it matters */}
      <Section tint>
        <SectionHeading
          eyebrow="Why it matters"
          title="Three ways unverified email quietly costs you"
          lede="Every unverified send nudges your sender score toward throttling. Once Gmail starts filtering you, even your good addresses stop landing."
        />
        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-3">
          {REASONS.map((r) => (
            <StaggerItem key={r.title} className="h-full">
              <article className="panel flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-panel)]">
                <span className="eyebrow text-hound">{r.kicker}</span>
                <h3 className="display mt-4 text-xl font-semibold leading-tight text-ink">{r.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{r.desc}</p>
                <p className="mt-5 border-t border-dashed border-line pt-3 font-mono text-xs text-ink-3">
                  {r.stat}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* How the verdict is reached — the pinned pipeline */}
      <Section>
        <SectionHeading
          eyebrow="How the verdict is reached"
          title="Seven checks, run in order, every one explained"
          lede="Most tools stop at four or five. Each address is walked through all seven — and the moment one fails, you get the exact reason why."
        />
        <PipelineScene steps={CHECKS} />
      </Section>

      {/* Data handling — honest trust */}
      <Section tint>
        <SectionHeading
          eyebrow="Handled with care"
          title="Serious about your list and your sender reputation"
          lede="No fine-print games. Here’s exactly how your data and payments are handled."
        />
        <div className="mt-12">
          <TrustBand />
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section id="pricing">
        <SectionHeading
          eyebrow="Pricing"
          title="Buy once, use whenever. No subscriptions, no expiry."
          lede="Start with 300 free verifications — no credit card. Every pack runs the full seven checks and bulk CSV."
        />
        <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <StaggerItem key={pack.id}>
              <div className="panel group flex h-full flex-col p-6 transition-all hover:border-hound hover:shadow-[var(--shadow-panel)]">
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
            </StaggerItem>
          ))}
        </StaggerGroup>
        <p className="mt-8 font-mono text-xs text-ink-3">
          All packs — 7 checks · bulk CSV · credits never expire · no monthly minimums
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

      <CtaBand title="Send to addresses that actually exist." />

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
