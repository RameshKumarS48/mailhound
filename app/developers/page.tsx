import Link from 'next/link'
import { API_PACKS } from '@/lib/dodo'
import { BuyPackButton } from '@/components/buy-pack-button'
import { SiteNav, SiteFooter } from '@/components/site-chrome'
import { Section, SectionHeading } from '@/components/site/section'
import { Reveal } from '@/components/site/reveal'
import { CodeBlock, type CodeSample } from '@/components/site/code-block'
import { CtaBand } from '@/components/site/cta-band'

const FEATURES = [
  {
    label: 'One endpoint, zero setup',
    body: 'A single GET request returns a full verdict. No SDK required — works with any HTTP client in any language.',
  },
  {
    label: 'Shared credit pool',
    body: 'Credits bought here work in the dashboard too. One balance, no silos, no separate billing.',
  },
  {
    label: 'A real verdict, not “unknown”',
    body: 'The same seven-point engine — syntax, domain, MX, SMTP, disposable, role, catch-all — runs on every call.',
  },
]

const STEPS = [
  'Sign up free — 300 verifications included, no card',
  'Generate an API key in the developer dashboard',
  'Buy an API credit pack below',
  'Copy a snippet and make your first call',
  'Ship it',
]

const REQUEST_SAMPLES: CodeSample[] = [
  {
    label: 'cURL',
    code: `curl "https://mailhound.xyz/api/v1/verify?email=priya@acmecorp.com" \\
  -H "Authorization: Bearer mhk_your_key"`,
  },
  {
    label: 'Node',
    code: `const res = await fetch(
  "https://mailhound.xyz/api/v1/verify?email=priya@acmecorp.com",
  { headers: { Authorization: "Bearer mhk_your_key" } }
)
const result = await res.json()
console.log(result.status, result.score) // "valid" 98`,
  },
  {
    label: 'Python',
    code: `import requests

res = requests.get(
    "https://mailhound.xyz/api/v1/verify",
    params={"email": "priya@acmecorp.com"},
    headers={"Authorization": "Bearer mhk_your_key"},
)
print(res.json()["status"], res.json()["score"])  # valid 98`,
  },
]

const RESPONSE_SAMPLE: CodeSample[] = [
  {
    label: '200 OK',
    code: `{
  "email": "priya@acmecorp.com",
  "status": "valid",
  "score": 98,
  "reason": "Deliverable address confirmed by mail server",
  "checks": {
    "syntax":     { "passed": true, "detail": "RFC-5322 valid" },
    "domain":     { "passed": true, "detail": "acmecorp.com resolves" },
    "mx":         { "passed": true, "detail": "aspmx.l.google.com" },
    "smtp":       { "passed": true, "detail": "Mailbox accepts" },
    "disposable": { "passed": true, "detail": "Not a throwaway" },
    "role":       { "passed": true, "detail": "Personal inbox" },
    "catchAll":   { "passed": true, "detail": "Not catch-all" }
  }
}`,
  },
]

export default function DevelopersPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="eyebrow text-hound">For developers</p>
            <h1 className="display mt-4 font-semibold text-ink text-fluid-5xl">
              Email verification, one request away.
            </h1>
            <p className="mt-5 max-w-md text-ink-2 text-fluid-lg leading-relaxed">
              One endpoint. Bearer auth. The full seven-point engine on every
              request, returning a real verdict with the reason attached. Credits
              never expire.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/developers/dashboard" className="btn-hound">Get API key</Link>
              <Link href="/docs" className="btn-ghost">Read the docs</Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-3">
            <CodeBlock samples={REQUEST_SAMPLES} />
            <CodeBlock samples={RESPONSE_SAMPLE} caption="Response" />
          </Reveal>
        </div>
      </section>

      {/* Capability band — honest: latency is typical, uptime awaits a real status page */}
      <Section tint>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            ['~2s', 'Typical verdict, end to end'],
            ['1', 'Endpoint, all four tools'],
            ['Status page', 'Public uptime — coming soon'],
          ].map(([big, label]) => (
            <div key={label}>
              <p className="display text-3xl font-semibold text-ink">{big}</p>
              <p className="eyebrow mt-2">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section>
        <div className="grid gap-8 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 70}>
              <p className="font-semibold text-ink">{f.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" tint>
        <SectionHeading
          eyebrow="API pricing"
          title="Buy once, use whenever"
          lede="Credits are shared with your dashboard. No subscriptions, no expiry, no monthly minimum."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {API_PACKS.map((pack, i) => (
            <Reveal key={pack.id} delay={i * 55}>
              <div className="panel group flex h-full flex-col p-6 transition-all hover:border-hound hover:shadow-[var(--shadow-panel)]">
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
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-ink-3">
          Every pack — 7-point engine · credits never expire · no monthly minimum · API + dashboard access
        </p>
      </Section>

      {/* Integration steps */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="5 minutes to production"
            title="From zero to first API call"
          />
          <ol className="mt-10 space-y-4">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold text-hound ring-1 ring-hound/30">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-2">{step}</span>
              </li>
            ))}
          </ol>
          <Link href="/developers/dashboard" className="btn-hound mt-10 inline-flex">
            Get API key
          </Link>
        </div>
      </Section>

      <CtaBand
        eyebrow="Ship it"
        title="Wire up verification before your next deploy."
        cta="Get API key"
        href="/developers/dashboard"
        sub="300 free verifications · shared credit balance · credits never expire"
      />

      <SiteFooter />
    </>
  )
}
