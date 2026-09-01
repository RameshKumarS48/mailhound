import { BlacklistEntry } from './types'

// Calls the SMTP worker's /dnsbl endpoint. DNSBL lookups must originate from the
// worker's dedicated VPS resolver — Spamhaus and others refuse queries from
// shared/public resolvers (like Vercel's), returning bogus 127.255.255.x codes.

export interface DnsblResult {
  target: string
  ips: string[]
  listedCount: number
  totalChecks: number
  listedOn: string[]
  results: BlacklistEntry[]
  error?: string
  unavailable?: boolean
}

function unavailable(target: string): DnsblResult {
  return { target, ips: [], listedCount: 0, totalChecks: 0, listedOn: [], results: [], unavailable: true }
}

export async function dnsblCheck(target: string): Promise<DnsblResult> {
  const workerUrl = process.env.SMTP_WORKER_URL
  const workerKey = process.env.SMTP_WORKER_KEY
  if (!workerUrl) return unavailable(target)

  try {
    const url = new URL('/dnsbl', workerUrl)
    url.searchParams.set('target', target)
    const res = await fetch(url.toString(), {
      headers: workerKey ? { 'x-api-key': workerKey } : {},
      signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) return unavailable(target)
    return (await res.json()) as DnsblResult
  } catch {
    return unavailable(target)
  }
}
