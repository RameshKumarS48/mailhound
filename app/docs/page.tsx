import Link from 'next/link'
import { SiteNav, SiteFooter } from '@/components/site-chrome'
import { CodeBlock as CopyCodeBlock } from '@/components/site/code-block'
import { DocsToc } from '@/components/site/docs-toc'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'Mailhound REST API documentation — authenticate, verify emails, and handle responses.',
}

const TOC = [
  { id: 'auth', label: 'Authentication' },
  { id: 'base-url', label: 'Base URL' },
  { id: 'verify', label: 'GET /verify' },
  { id: 'credits', label: 'Credits & limits' },
  { id: 'bulk', label: 'Bulk verification' },
]

// Adapter: keep every existing call site ({ label, code }) but render through
// the shared dark panel that carries a copy button.
function CodeBlock({ label, code }: { label: string; code: string }) {
  return <CopyCodeBlock samples={[{ label, code }]} caption={label} />
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-12">
      <h2 className="display mb-6 text-2xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}

export default function DocsPage() {
  return (
    <>
      <SiteNav />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="eyebrow text-hound">Reference</p>
        <h1 className="display mt-4 font-semibold text-ink text-fluid-5xl">API Reference</h1>
        <p className="mt-4 max-w-xl text-ink-2 text-fluid-lg">
          Integrate Mailhound&apos;s 7-point email verification engine into any application.
        </p>
        <div className="mt-6 flex gap-4 font-mono text-sm">
          <Link href="/developers" className="text-hound hover:underline">Get API key →</Link>
          <Link href="/developers/dashboard" className="text-ink-3 hover:text-ink hover:underline">Dashboard →</Link>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[14rem_1fr]">
          <DocsToc items={TOC} />

          <div className="min-w-0 max-w-3xl space-y-0">

          <Section id="auth" title="Authentication">
            <p className="mb-4 text-sm leading-relaxed text-ink-2">
              Every request must include your API key as a Bearer token in the{' '}
              <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-xs">Authorization</code> header.
              Keys are generated in the{' '}
              <Link href="/developers/dashboard" className="text-hound hover:underline">Developer Dashboard</Link>{' '}
              and shown only once — store them securely.
            </p>
            <CodeBlock label="Header" code={`Authorization: Bearer mhk_your_api_key_here`} />
          </Section>

          <Section id="base-url" title="Base URL">
            <CodeBlock label="Base URL" code={`https://mailhound.xyz/api/v1`} />
          </Section>

          <Section id="verify" title="GET /verify">
            <p className="mb-6 text-sm leading-relaxed text-ink-2">
              Verify a single email address. Runs all 7 checks — syntax, domain, MX, SMTP handshake,
              disposable detection, role address filter, and catch-all detection — and returns a
              consolidated verdict. Each call debits 1 credit.
            </p>

            <div className="mb-8 space-y-4">
              <div>
                <p className="eyebrow mb-2">Query parameters</p>
                <div className="panel overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Param</th>
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Type</th>
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-hound">email</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-3">string</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Required. The email address to verify.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="eyebrow mb-2">200 Response</p>
                <CodeBlock label="application/json" code={`{
  "email":      "priya@acmecorp.com",
  "status":     "valid",          // "valid" | "risky" | "invalid"
  "score":      98,               // 0–100 confidence
  "reason":     "Deliverable address confirmed by mail server",
  "verifiedAt": "2026-08-27T10:23:41.000Z",
  "checks": {
    "syntax":     { "passed": true,  "detail": "RFC-5322 valid" },
    "domain":     { "passed": true,  "detail": "acmecorp.com resolves" },
    "mx":         { "passed": true,  "detail": "aspmx.l.google.com" },
    "smtp":       { "passed": true,  "detail": "Mailbox accepts" },
    "disposable": { "passed": true,  "detail": "Not a throwaway" },
    "role":       { "passed": true,  "detail": "Personal inbox" },
    "catchAll":   { "passed": false, "detail": "Skipped" }
  }
}`} />
              </div>

              <div>
                <p className="eyebrow mb-2">Status values</p>
                <div className="panel overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Status</th>
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--valid)' }}>valid</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Deliverable. Safe to send.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--risky)' }}>risky</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Deliverable but flagged — catch-all domain, role address, or similar. Proceed with caution.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--invalid)' }}>invalid</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Not deliverable. Do not send.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="eyebrow mb-2">Error codes</p>
                <div className="panel overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Code</th>
                        <th className="px-4 py-3 text-left font-mono text-xs text-ink-3">Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-ink">400</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Missing or malformed <code className="font-mono">email</code> param</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-ink">401</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Missing, invalid, or revoked API key</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-ink">402</td>
                        <td className="px-4 py-3 text-xs text-ink-2">Insufficient credits — <Link href="/developers#pricing" className="text-hound hover:underline">buy more</Link></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="eyebrow">Code examples</p>
              <CodeBlock label="cURL" code={`curl "https://mailhound.xyz/api/v1/verify?email=priya@acmecorp.com" \\
  -H "Authorization: Bearer mhk_your_key_here"`} />
              <CodeBlock label="Node.js" code={`const res = await fetch(
  'https://mailhound.xyz/api/v1/verify?email=priya@acmecorp.com',
  { headers: { Authorization: 'Bearer mhk_your_key_here' } }
)
const data = await res.json()
console.log(data.status) // "valid" | "risky" | "invalid"`} />
              <CodeBlock label="Python" code={`import requests

r = requests.get(
    'https://mailhound.xyz/api/v1/verify',
    params={'email': 'priya@acmecorp.com'},
    headers={'Authorization': 'Bearer mhk_your_key_here'},
)
data = r.json()
print(data['status'])  # "valid" | "risky" | "invalid"`} />
            </div>
          </Section>

          <Section id="credits" title="Credits & limits">
            <div className="space-y-3 text-sm leading-relaxed text-ink-2">
              <p>Each API call deducts 1 credit from your balance. Credits are shared between the API and the web dashboard — buy once, use anywhere.</p>
              <p>Credits never expire. There is no rate limit beyond your credit balance.</p>
              <p>
                To top up, visit the{' '}
                <Link href="/developers#pricing" className="text-hound hover:underline">API pricing page</Link>{' '}
                or your{' '}
                <Link href="/developers/dashboard" className="text-hound hover:underline">developer dashboard</Link>.
              </p>
            </div>
          </Section>

          <Section id="bulk" title="Bulk verification">
            <p className="text-sm leading-relaxed text-ink-2">
              The <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-xs">/api/v1/verify</code> endpoint
              processes one email per request. For bulk jobs (up to 100,000 emails), use the CSV upload
              in the <Link href="/dashboard" className="text-hound hover:underline">dashboard</Link> — results
              download as a sorted CSV with verdicts and all 7 check details.
            </p>
          </Section>

          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
