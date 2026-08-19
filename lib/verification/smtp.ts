import { CheckResult } from './types'

export interface SMTPCheckResult {
  smtp: CheckResult
  catchAll: CheckResult
}

// These providers never reveal whether an address exists via SMTP.
// Probing them always returns 250, so skip the check entirely.
const MAJOR_MX_PATTERNS = [
  'google', 'gmail',
  'outlook', 'hotmail', 'microsoft', 'live.com',
  'yahoo', 'ymail',
  'icloud', 'apple',
  'protonmail', 'proton.me',
  'zoho',
]

function isMajorProvider(mxHost: string): boolean {
  const lower = mxHost.toLowerCase()
  return MAJOR_MX_PATTERNS.some(p => lower.includes(p))
}

export async function checkSMTP(email: string, mxHost: string): Promise<SMTPCheckResult> {
  // Major providers validate recipients internally — SMTP probes are useless
  if (isMajorProvider(mxHost)) {
    return {
      smtp:     { passed: true, detail: 'Major provider — mailbox existence not verifiable via SMTP' },
      catchAll: { passed: true, detail: 'Major provider — validates recipients internally' },
    }
  }

  const workerUrl = process.env.SMTP_WORKER_URL
  const workerKey = process.env.SMTP_WORKER_KEY

  if (!workerUrl) {
    return {
      smtp:     { passed: true, detail: 'SMTP check skipped — configure SMTP_WORKER_URL' },
      catchAll: { passed: true, detail: 'Catch-all check skipped' },
    }
  }

  try {
    const url = new URL('/verify', workerUrl)
    url.searchParams.set('email', email)
    const res = await fetch(url.toString(), {
      headers: workerKey ? { 'x-api-key': workerKey } : {},
      signal: AbortSignal.timeout(20_000),
    })

    if (!res.ok) {
      return {
        smtp:     { passed: true, detail: 'SMTP worker error — treated as inconclusive' },
        catchAll: { passed: true, detail: 'Catch-all check unavailable' },
      }
    }

    const data = await res.json() as {
      exists: 'yes' | 'no' | 'unknown'
      catchAll: boolean
      detail: string
    }

    const smtp: CheckResult =
      data.exists === 'yes' ? { passed: true,  detail: data.detail } :
      data.exists === 'no'  ? { passed: false, detail: data.detail } :
                              { passed: true,  detail: data.detail || 'SMTP inconclusive' }

    const catchAll: CheckResult = data.catchAll
      ? { passed: false, detail: 'Catch-all domain — all addresses accepted, deliverability unverifiable' }
      : { passed: true,  detail: 'Not a catch-all domain' }

    return { smtp, catchAll }
  } catch {
    return {
      smtp:     { passed: true, detail: 'SMTP worker timeout — treated as inconclusive' },
      catchAll: { passed: true, detail: 'Catch-all check unavailable' },
    }
  }
}
