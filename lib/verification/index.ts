import { checkSyntax } from './syntax'
import { checkDomain, checkMX } from './dns'
import { checkSMTP } from './smtp'
import { checkDisposable } from './disposable'
import { checkRole } from './role'
import { VerificationResult, VerificationStatus, CheckResult } from './types'

const SKIPPED: CheckResult = { passed: false, detail: 'Skipped' }

export async function verifyEmail(email: string): Promise<VerificationResult> {
  const normalized = email.trim().toLowerCase()
  const atIndex = normalized.lastIndexOf('@')
  const local  = normalized.slice(0, atIndex)
  const domain = normalized.slice(atIndex + 1)

  // 1 — Syntax (no network)
  const syntax = checkSyntax(normalized)
  if (!syntax.passed) {
    return build(normalized, 'invalid', syntax.detail, 0, {
      syntax, domain: SKIPPED, mx: SKIPPED, smtp: SKIPPED,
      disposable: SKIPPED, role: SKIPPED, catchAll: SKIPPED,
    })
  }

  // 2 — Domain, disposable, role (parallel DNS)
  const [domainCheck, disposable, role] = await Promise.all([
    checkDomain(domain),
    Promise.resolve(checkDisposable(domain)),
    Promise.resolve(checkRole(local)),
  ])

  if (!domainCheck.passed) {
    return build(normalized, 'invalid', domainCheck.detail, 5, {
      syntax, domain: domainCheck, mx: SKIPPED, smtp: SKIPPED, disposable, role,
      catchAll: SKIPPED,
    })
  }

  if (!disposable.passed) {
    return build(normalized, 'invalid', disposable.detail, 8, {
      syntax, domain: domainCheck, mx: SKIPPED, smtp: SKIPPED, disposable, role,
      catchAll: SKIPPED,
    })
  }

  // 3 — MX record
  const mx = await checkMX(domain)
  if (!mx.passed) {
    return build(normalized, 'invalid', mx.detail, 10, {
      syntax, domain: domainCheck, mx, smtp: SKIPPED, disposable, role, catchAll: SKIPPED,
    })
  }

  // 4 — SMTP + catch-all via worker (single call, skips major providers automatically)
  const { smtp, catchAll } = await checkSMTP(normalized, mx.detail)

  let score = 100
  if (!smtp.passed)     score -= 55
  if (!catchAll.passed) score -= 15
  if (!role.passed)     score -= 25

  const status: VerificationStatus =
    !smtp.passed     ? 'invalid' :
    !catchAll.passed ? 'risky'   :
    !role.passed     ? 'risky'   :
    'valid'

  const reason =
    !smtp.passed     ? smtp.detail     :
    !catchAll.passed ? catchAll.detail :
    !role.passed     ? role.detail     :
    'Deliverable address'

  return build(normalized, status, reason, Math.max(0, Math.min(100, score)), {
    syntax, domain: domainCheck, mx, smtp, disposable, role, catchAll,
  })
}

function build(
  email: string,
  status: VerificationStatus,
  reason: string,
  score: number,
  checks: VerificationResult['checks'],
): VerificationResult {
  return { email, status, score, reason, checks, verifiedAt: new Date().toISOString() }
}
