import dns from 'dns/promises'
import { CheckResult } from './types'

export async function checkDomain(domain: string): Promise<CheckResult> {
  try {
    await dns.resolve(domain)
    return { passed: true, detail: 'Domain resolves' }
  } catch {
    return { passed: false, detail: `Domain not found: ${domain}` }
  }
}

export async function checkMX(domain: string): Promise<CheckResult> {
  try {
    const records = await dns.resolveMx(domain)
    if (records.length === 0) return { passed: false, detail: 'No MX records configured' }
    const sorted = records.sort((a, b) => a.priority - b.priority)
    return { passed: true, detail: `MX: ${sorted[0].exchange}` }
  } catch {
    return { passed: false, detail: 'No MX records found' }
  }
}
