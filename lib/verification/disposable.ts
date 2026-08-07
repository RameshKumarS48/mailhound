import disposableDomains from 'disposable-email-domains'
import { CheckResult } from './types'

const domainSet = new Set((disposableDomains as string[]).map(d => d.toLowerCase()))

export function checkDisposable(domain: string): CheckResult {
  if (domainSet.has(domain.toLowerCase())) {
    return { passed: false, detail: `Disposable provider: ${domain}` }
  }
  return { passed: true, detail: 'Legitimate domain' }
}
