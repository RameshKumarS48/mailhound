import dns from 'dns/promises'
import { CheckResult } from './types'

// Phase 1: Heuristic catch-all detection via MX provider.
// Phase 3: Replace with AI multi-probe resolution.
const MAJOR_PROVIDERS = ['google', 'outlook', 'microsoft', 'yahoo', 'amazonses', 'sendgrid', 'mailgun']

export async function checkCatchAll(domain: string): Promise<CheckResult> {
  try {
    const records = await dns.resolveMx(domain)
    if (records.length === 0) return { passed: true, detail: 'Not a catch-all (no MX)' }
    const mxHost = records[0].exchange.toLowerCase()
    const isMajor = MAJOR_PROVIDERS.some(p => mxHost.includes(p))
    if (isMajor) return { passed: true, detail: 'Major provider — validates recipients' }
    // Unknown provider: flag as potentially risky catch-all
    return { passed: false, detail: `Possible catch-all — custom MX (${records[0].exchange})` }
  } catch {
    return { passed: true, detail: 'Catch-all check inconclusive' }
  }
}
