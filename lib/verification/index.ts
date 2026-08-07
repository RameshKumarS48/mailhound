import { checkSyntax } from './syntax'
import { checkDomain, checkMX } from './dns'
import { checkSMTP } from './smtp'
import { checkDisposable } from './disposable'
import { checkRole } from './role'
import { checkCatchAll } from './catch-all'
import { VerificationResult, VerificationStatus, CheckResult } from './types'

const SKIPPED: CheckResult = { passed: false, detail: 'Skipped' }

export async function verifyEmail(email: string): Promise<VerificationResult> {
  const normalized = email.trim().toLowerCase()
  const atIndex = normalized.lastIndexOf('@')
  const local = normalized.slice(0, atIndex)
  const domain = normalized.slice(atIndex + 1)

  const syntax = checkSyntax(normalized)
  if (!syntax.passed) {
    return build(normalized, 'invalid', syntax.detail, 0, {
      syntax, domain: SKIPPED, mx: SKIPPED, smtp: SKIPPED,
      disposable: SKIPPED, role: SKIPPED, catchAll: SKIPPED,
    })
  }

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

  const [mx, catchAll] = await Promise.all([checkMX(domain), checkCatchAll(domain)])

  if (!mx.passed) {
    return build(normalized, 'invalid', mx.detail, 10, {
      syntax, domain: domainCheck, mx, smtp: SKIPPED, disposable, role, catchAll,
    })
  }

  const smtp = await checkSMTP(normalized)

  let score = 100
  if (!smtp.passed) score -= 55
  if (!role.passed) score -= 25
  if (!catchAll.passed) score -= 15

  const status: VerificationStatus =
    !smtp.passed ? 'invalid' :
    (!role.passed || !catchAll.passed) ? 'risky' :
    'valid'

  const reason =
    !smtp.passed ? smtp.detail :
    !role.passed ? role.detail :
    !catchAll.passed ? catchAll.detail :
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
