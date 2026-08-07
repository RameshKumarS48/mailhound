import { CheckResult } from './types'

// Phase 1: Debounce API handles SMTP verification.
// Phase 2: Replace with self-hosted worker on Hetzner VPS.
export async function checkSMTP(email: string): Promise<CheckResult> {
  const apiKey = process.env.DEBOUNCE_API_KEY
  if (!apiKey) {
    return { passed: true, detail: 'SMTP check skipped (configure DEBOUNCE_API_KEY)' }
  }
  try {
    const res = await fetch(
      `https://api.debounce.io/v1/?api=${apiKey}&email=${encodeURIComponent(email)}`,
      { signal: AbortSignal.timeout(6000) }
    )
    const data = await res.json()
    const result = data?.debounce
    if (!result) return { passed: true, detail: 'SMTP inconclusive' }
    if (result.result === 'Safe to Send') return { passed: true, detail: 'Mailbox confirmed' }
    if (result.result === 'Invalid') {
      return { passed: false, detail: result.reason ?? 'Mailbox does not exist' }
    }
    return { passed: true, detail: result.result ?? 'SMTP inconclusive' }
  } catch {
    return { passed: true, detail: 'SMTP timeout — treated as inconclusive' }
  }
}
