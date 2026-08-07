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
