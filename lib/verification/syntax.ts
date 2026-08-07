import { CheckResult } from './types'

export function checkSyntax(email: string): CheckResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return { passed: false, detail: 'Invalid email format' }
  const [local, domain] = email.split('@')
  if (local.length > 64) return { passed: false, detail: 'Local part exceeds 64 characters' }
  if (domain.length > 255) return { passed: false, detail: 'Domain exceeds 255 characters' }
  return { passed: true, detail: 'Valid format' }
}
