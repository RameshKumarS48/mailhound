import { EmailFinderResult, FinderCandidate } from './types'

// Pattern engine + SMTP verification for the email finder. Given a name and a
// company domain, generate candidate local-parts ordered by real-world corporate
// prevalence, then (optionally) probe them via the worker's /probe-multi endpoint,
// which runs catch-all detection once and stops on the first accepted mailbox.

interface Pattern {
  key: string
  label: string
  needsLast: boolean
  build: (f: string, l: string) => string
}

// Ordered most-common → least-common across corporate mail setups.
const PATTERNS: Pattern[] = [
  { key: 'first.last', label: 'first.last', needsLast: true,  build: (f, l) => `${f}.${l}` },
  { key: 'flast',      label: 'flast',      needsLast: true,  build: (f, l) => `${f[0]}${l}` },
  { key: 'first',      label: 'first',      needsLast: false, build: (f) => f },
  { key: 'firstl',     label: 'firstl',     needsLast: true,  build: (f, l) => `${f}${l[0]}` },
  { key: 'first_last', label: 'first_last', needsLast: true,  build: (f, l) => `${f}_${l}` },
  { key: 'firstlast',  label: 'firstlast',  needsLast: true,  build: (f, l) => `${f}${l}` },
  { key: 'f.last',     label: 'f.last',     needsLast: true,  build: (f, l) => `${f[0]}.${l}` },
  { key: 'last.first', label: 'last.first', needsLast: true,  build: (f, l) => `${l}.${f}` },
  { key: 'lastf',      label: 'lastf',      needsLast: true,  build: (f, l) => `${l}${f[0]}` },
  { key: 'last',       label: 'last',       needsLast: true,  build: (f, l) => l },
]

const MAX_CANDIDATES = 12

function slug(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
}

interface WorkerProbeResult {
  domain: string
  mxHost: string | null
  catchAll: boolean
  unreachable?: boolean
  error?: string
  results: { address: string; exists: 'yes' | 'no' | 'unknown' }[]
}

// Build the ordered, de-duplicated candidate list. Returns email → pattern label.
function buildCandidates(first: string, last: string, domain: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const p of PATTERNS) {
    if (p.needsLast && !last) continue
    const local = p.build(first, last)
    if (!local) continue
    const email = `${local}@${domain}`
    if (!map.has(email)) map.set(email, p.label)
    if (map.size >= MAX_CANDIDATES) break
  }
  return map
}

async function probeMulti(domain: string, candidates: string[]): Promise<WorkerProbeResult | null> {
  const workerUrl = process.env.SMTP_WORKER_URL
  const workerKey = process.env.SMTP_WORKER_KEY
  if (!workerUrl) return null
  try {
    const url = new URL('/probe-multi', workerUrl)
    url.searchParams.set('domain', domain)
    url.searchParams.set('candidates', candidates.join(','))
    const res = await fetch(url.toString(), {
      headers: workerKey ? { 'x-api-key': workerKey } : {},
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) return null
    return (await res.json()) as WorkerProbeResult
  } catch {
    return null
  }
}

export interface FindEmailInput {
  firstName: string
  lastName: string
  domain: string
  verify?: boolean // false = pattern guess only (public teaser), no SMTP probe
}

export async function findEmail(input: FindEmailInput): Promise<EmailFinderResult> {
  const first = slug(input.firstName)
  const last = slug(input.lastName)
  const domain = normalizeDomain(input.domain)
  const name = [input.firstName, input.lastName].filter(Boolean).join(' ').trim()
  const checkedAt = new Date().toISOString()

  const base = {
    domain,
    name,
    catchAll: false,
    checkedAt,
  }

  if (!first || !domain) {
    return { ...base, found: false, email: null, pattern: null, confidence: 'guess', alternatives: [] }
  }

  const candidateMap = buildCandidates(first, last, domain)
  const candidates = [...candidateMap.keys()]
  const topEmail = candidates[0] ?? null
  const topPattern = topEmail ? candidateMap.get(topEmail)! : null

  // Pattern-only mode (public teaser): return the most-likely guess, unverified.
  if (input.verify === false) {
    return {
      ...base,
      found: false,
      email: topEmail,
      pattern: topPattern,
      confidence: 'guess',
      alternatives: candidates.map((email) => ({ email, pattern: candidateMap.get(email)!, status: 'unknown' as const })),
    }
  }

  const probe = await probeMulti(domain, candidates)

  // Worker unconfigured / unreachable → fall back to a labelled guess, no hit.
  if (!probe || probe.unreachable) {
    return {
      ...base,
      found: false,
      email: topEmail,
      pattern: topPattern,
      confidence: 'guess',
      alternatives: candidates.map((email) => ({ email, pattern: candidateMap.get(email)!, status: 'unknown' as const })),
    }
  }

  const statusByEmail = new Map(probe.results.map((r) => [r.address, r.exists]))
  const alternatives: FinderCandidate[] = candidates.map((email) => ({
    email,
    pattern: candidateMap.get(email)!,
    status: statusByEmail.get(email) ?? 'unknown',
  }))

  // Catch-all: every mailbox is accepted, so probing can't discriminate. Return
  // the top pattern guess flagged low-confidence; the API must NOT charge for this.
  if (probe.catchAll) {
    return {
      ...base,
      catchAll: true,
      found: false,
      email: topEmail,
      pattern: topPattern,
      confidence: 'guess',
      alternatives,
    }
  }

  const hit = alternatives.find((c) => c.status === 'yes')
  if (hit) {
    return { ...base, found: true, email: hit.email, pattern: hit.pattern, confidence: 'high', alternatives }
  }

  // No confirmed mailbox. If some probes were inconclusive (greylisting, timeout)
  // surface the top guess at low confidence; if all came back a hard 'no', report
  // no address rather than a misleading guess.
  const anyUnknown = alternatives.some((c) => c.status === 'unknown')
  return {
    ...base,
    found: false,
    email: anyUnknown ? topEmail : null,
    pattern: anyUnknown ? topPattern : null,
    confidence: 'low',
    alternatives,
  }
}
