export type VerificationStatus = 'valid' | 'risky' | 'invalid'

export interface CheckResult {
  passed: boolean
  detail: string
}

export interface VerificationResult {
  email: string
  status: VerificationStatus
  score: number
  reason: string
  checks: {
    syntax: CheckResult
    domain: CheckResult
    mx: CheckResult
    smtp: CheckResult
    disposable: CheckResult
    role: CheckResult
    catchAll: CheckResult
  }
  verifiedAt: string
}

// ── Domain Health (feature #2) ───────────────────────────────────────────────

export type HealthStatus = 'pass' | 'warn' | 'fail' | 'unknown'
export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface HealthCheck {
  status: HealthStatus
  label: string
  detail: string
  record?: string
}

export type DomainHealthCheckKey =
  | 'mx' | 'spf' | 'dkim' | 'dmarc' | 'ptr' | 'tls' | 'openRelay' | 'blacklist'

export interface DomainHealthResult {
  domain: string
  grade: HealthGrade
  score: number
  checks: Record<DomainHealthCheckKey, HealthCheck>
  remediation: string[]
  checkedAt: string
}

// ── Blacklist / DNSBL (feature #3) ───────────────────────────────────────────

export interface BlacklistEntry {
  zone: string
  listed: boolean
  type: 'ip' | 'domain'
  target: string
  txt?: string | null
  error?: string
}

export interface BlacklistResult {
  target: string
  ips: string[]
  listedCount: number
  totalChecks: number
  listedOn: string[]
  results: BlacklistEntry[]
  checkedAt: string
}

// ── Email Finder (feature #4) ────────────────────────────────────────────────

export type FinderConfidence = 'high' | 'medium' | 'low' | 'guess'

export interface FinderCandidate {
  email: string
  pattern: string
  status: 'yes' | 'no' | 'unknown'
}

export interface EmailFinderResult {
  domain: string
  name: string
  found: boolean
  email: string | null
  pattern: string | null
  confidence: FinderConfidence
  catchAll: boolean
  alternatives: FinderCandidate[]
  checkedAt: string
}
