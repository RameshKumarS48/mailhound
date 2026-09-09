import type { VerificationStatus } from '@/lib/verification/types'

/* Shared verdict styling + labels for verification results. Kept in one place so
   the live verify form and the history browser render identical seals/ledgers.
   Pure data (no server imports) → safe to import into client components. */

export const statusMeta: Record<
  VerificationStatus,
  { label: string; verdict: string; color: string; bg: string }
> = {
  valid:   { label: 'Valid',   verdict: 'Deliverable',       color: 'var(--valid)',   bg: 'var(--valid-bg)' },
  risky:   { label: 'Risky',   verdict: 'Proceed with care', color: 'var(--risky)',   bg: 'var(--risky-bg)' },
  invalid: { label: 'Invalid', verdict: 'Do not send',       color: 'var(--invalid)', bg: 'var(--invalid-bg)' },
}

/* Human labels for each check key in VerificationResult.checks. */
export const checkLabel: Record<string, string> = {
  syntax: 'Syntax',
  domain: 'Domain',
  mx: 'MX record',
  smtp: 'SMTP probe',
  disposable: 'Disposable',
  role: 'Role address',
  catchAll: 'Catch-all',
}
