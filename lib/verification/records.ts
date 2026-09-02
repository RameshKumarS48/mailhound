import dns from 'dns/promises'
import { HealthStatus } from './types'

export interface RecordCheck {
  status: HealthStatus
  detail: string
  record?: string
}

async function resolveTxtFlat(name: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(name)
    // Each TXT record is an array of string chunks — join them into one string.
    return records.map((chunks) => chunks.join(''))
  } catch {
    return []
  }
}

export async function checkSPF(domain: string): Promise<RecordCheck> {
  const txts = await resolveTxtFlat(domain)
  const spf = txts.find((t) => t.toLowerCase().startsWith('v=spf1'))
  if (!spf) return { status: 'fail', detail: 'No SPF record found' }
  if (/\+all/i.test(spf)) {
    return { status: 'fail', detail: 'SPF uses +all — allows anyone to send as you', record: spf }
  }
  if (/~all/i.test(spf)) {
    return { status: 'warn', detail: 'SPF present with softfail (~all)', record: spf }
  }
  if (/-all/i.test(spf)) {
    return { status: 'pass', detail: 'SPF present with hardfail (-all)', record: spf }
  }
  return { status: 'warn', detail: 'SPF present but has no "all" mechanism', record: spf }
}

export async function checkDMARC(domain: string): Promise<RecordCheck> {
  const txts = await resolveTxtFlat(`_dmarc.${domain}`)
  const dmarc = txts.find((t) => t.toLowerCase().startsWith('v=dmarc1'))
  if (!dmarc) return { status: 'fail', detail: 'No DMARC record found' }
  const policy = dmarc.match(/p\s*=\s*(none|quarantine|reject)/i)?.[1]?.toLowerCase()
  if (policy === 'reject' || policy === 'quarantine') {
    return { status: 'pass', detail: `DMARC policy: ${policy}`, record: dmarc }
  }
  if (policy === 'none') {
    return { status: 'warn', detail: 'DMARC present but policy is "none" (monitor only)', record: dmarc }
  }
  return { status: 'warn', detail: 'DMARC present but no enforcement policy set', record: dmarc }
}

// Common DKIM selectors used by major ESPs. We can't enumerate every custom
// selector, so absence is a "warn" (may exist under a name we don't know), not
// a hard fail.
const DKIM_SELECTORS = [
  'google', 'selector1', 'selector2', 'k1', 'k2', 'default', 'dkim',
  'mail', 's1', 's2', 'mandrill', 'mxvault', 'dkim1', 'sig1', 'zoho',
]

export async function checkDKIM(domain: string): Promise<RecordCheck> {
  const found = await Promise.all(
    DKIM_SELECTORS.map(async (sel) => {
      const txts = await resolveTxtFlat(`${sel}._domainkey.${domain}`)
      const rec = txts.find((t) => /v=dkim1|(^|;)\s*p\s*=/i.test(t))
      return rec ? sel : null
    })
  )
  const selector = found.find(Boolean)
  if (selector) {
    return { status: 'pass', detail: `DKIM found (selector: ${selector})`, record: `${selector}._domainkey` }
  }
  return { status: 'warn', detail: 'No DKIM on common selectors (may use a custom selector)' }
}

export async function checkPTR(mxHost: string): Promise<RecordCheck> {
  try {
    const ips = await dns.resolve4(mxHost)
    if (!ips.length) return { status: 'unknown', detail: 'Could not resolve mail-server IP' }
    const names = await dns.reverse(ips[0]).catch(() => [] as string[])
    if (names.length) return { status: 'pass', detail: `PTR: ${names[0]}` }
    return { status: 'warn', detail: `No reverse DNS for ${ips[0]}` }
  } catch {
    return { status: 'unknown', detail: 'Reverse DNS lookup failed' }
  }
}
