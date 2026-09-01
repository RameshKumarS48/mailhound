import { checkMX } from './dns'
import { checkSPF, checkDMARC, checkDKIM, checkPTR } from './records'
import { serverTest, ServerTestResult } from './server-test'
import { dnsblCheck, DnsblResult } from './dnsbl'
import {
  DomainHealthResult, DomainHealthCheckKey, HealthCheck, HealthGrade,
} from './types'

function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
}

function mxHostFromDetail(detail: string): string | null {
  const m = detail.match(/MX:\s*(.+)/)
  return m ? m[1].trim() : null
}

function tlsCheck(server: ServerTestResult): HealthCheck {
  const label = 'TLS / STARTTLS'
  if (server.unavailable) return { status: 'unknown', label, detail: 'SMTP probe unavailable' }
  if (!server.reachable) return { status: 'unknown', label, detail: server.error || 'Mail server unreachable' }
  if (server.tls?.upgraded) return { status: 'pass', label, detail: `Encrypted (${server.tls.version || 'TLS'})` }
  if (server.starttls) return { status: 'warn', label, detail: 'STARTTLS advertised but handshake failed' }
  return { status: 'fail', label, detail: 'No STARTTLS — mail can be sent in cleartext' }
}

function relayCheck(server: ServerTestResult): HealthCheck {
  const label = 'Open relay'
  if (server.unavailable) return { status: 'unknown', label, detail: 'SMTP probe unavailable' }
  if (!server.reachable) return { status: 'unknown', label, detail: 'Mail server unreachable' }
  if (server.openRelay) return { status: 'fail', label, detail: 'Accepts external relay — misconfigured' }
  return { status: 'pass', label, detail: 'Not an open relay' }
}

function blacklistCheck(dnsbl: DnsblResult): HealthCheck {
  const label = 'Blacklists'
  if (dnsbl.unavailable) return { status: 'unknown', label, detail: 'Blacklist probe unavailable' }
  if (dnsbl.listedCount > 0) {
    return { status: 'fail', label, detail: `Listed on ${dnsbl.listedCount}: ${dnsbl.listedOn.join(', ')}` }
  }
  return { status: 'pass', label, detail: `Clean across ${dnsbl.totalChecks} lists` }
}

// Weighted rollup → 0-100 score. Unknown checks are excluded from the
// denominator so an unreachable worker doesn't tank an otherwise-healthy domain.
const WEIGHTS: Record<DomainHealthCheckKey, number> = {
  mx: 20, spf: 15, dmarc: 15, blacklist: 14, dkim: 12, tls: 12, openRelay: 12, ptr: 5,
}

function gradeChecks(checks: Record<DomainHealthCheckKey, HealthCheck>): { score: number; grade: HealthGrade } {
  let earned = 0
  let possible = 0
  for (const key of Object.keys(WEIGHTS) as DomainHealthCheckKey[]) {
    const w = WEIGHTS[key]
    const s = checks[key].status
    if (s === 'unknown') continue
    possible += w
    earned += w * (s === 'pass' ? 1 : s === 'warn' ? 0.5 : 0)
  }
  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100)
  const grade: HealthGrade =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  return { score, grade }
}

const REMEDIATION: Record<DomainHealthCheckKey, string> = {
  mx: 'Add MX records so this domain can receive mail.',
  spf: 'Publish an SPF TXT record ending in -all listing your authorized senders.',
  dkim: 'Enable DKIM signing with your email provider and publish the public key.',
  dmarc: 'Publish a DMARC record at _dmarc with a policy of quarantine or reject.',
  ptr: 'Set reverse DNS (PTR) for your sending IP to match its hostname.',
  tls: 'Enable STARTTLS on your mail server so mail is encrypted in transit.',
  openRelay: 'Lock down your mail server — it must not relay mail for external domains.',
  blacklist: 'Request delisting from the blacklists above and fix the underlying cause.',
}

function buildRemediation(checks: Record<DomainHealthCheckKey, HealthCheck>): string[] {
  return (Object.keys(WEIGHTS) as DomainHealthCheckKey[])
    .filter((k) => checks[k].status === 'fail' || checks[k].status === 'warn')
    .map((k) => REMEDIATION[k])
}

export async function checkDomainHealth(rawDomain: string): Promise<DomainHealthResult> {
  const domain = normalizeDomain(rawDomain)

  const [mxRes, spf, dmarc, dkim, server, dnsbl] = await Promise.all([
    checkMX(domain),
    checkSPF(domain),
    checkDMARC(domain),
    checkDKIM(domain),
    serverTest(domain),
    dnsblCheck(domain),
  ])

  const mxHost = server.mxHost ?? mxHostFromDetail(mxRes.detail)
  const ptr = mxHost
    ? await checkPTR(mxHost)
    : { status: 'unknown' as const, detail: 'No mail server to check' }

  const checks: Record<DomainHealthCheckKey, HealthCheck> = {
    mx: { status: mxRes.passed ? 'pass' : 'fail', label: 'MX records', detail: mxRes.detail },
    spf: { status: spf.status, label: 'SPF', detail: spf.detail, record: spf.record },
    dkim: { status: dkim.status, label: 'DKIM', detail: dkim.detail, record: dkim.record },
    dmarc: { status: dmarc.status, label: 'DMARC', detail: dmarc.detail, record: dmarc.record },
    ptr: { status: ptr.status, label: 'Reverse DNS (PTR)', detail: ptr.detail },
    tls: tlsCheck(server),
    openRelay: relayCheck(server),
    blacklist: blacklistCheck(dnsbl),
  }

  const { score, grade } = gradeChecks(checks)
  return {
    domain,
    grade,
    score,
    checks,
    remediation: buildRemediation(checks),
    checkedAt: new Date().toISOString(),
  }
}
