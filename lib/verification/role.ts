import { CheckResult } from './types'

const ROLE_PREFIXES = new Set([
  'admin', 'info', 'support', 'help', 'contact', 'sales', 'marketing',
  'noreply', 'no-reply', 'donotreply', 'billing', 'legal', 'hr',
  'jobs', 'careers', 'press', 'media', 'security', 'privacy',
  'abuse', 'postmaster', 'webmaster', 'hostmaster', 'team', 'hello',
  'office', 'accounts', 'enquiries', 'mail', 'newsletter', 'service',
  'operations', 'ops', 'devops', 'finance', 'accounting', 'payments',
])

export function checkRole(local: string): CheckResult {
  const prefix = local.toLowerCase().split('+')[0]
  if (ROLE_PREFIXES.has(prefix)) {
    return { passed: false, detail: `Role address (${local}@) — low engagement` }
  }
  return { passed: true, detail: 'Personal address' }
}
