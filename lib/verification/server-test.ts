// Calls the SMTP worker's /server-test endpoint (banner, STARTTLS/TLS, open
// relay). Mirrors lib/verification/smtp.ts: degrades gracefully when the worker
// is unconfigured or unreachable rather than throwing.

export interface ServerTestResult {
  domain?: string
  mxHost: string | null
  reachable: boolean
  connectMs: number | null
  banner: string | null
  starttls: boolean
  tls: { upgraded: boolean; version: string | null; error?: string }
  openRelay: boolean
  greylisted: boolean
  error?: string | null
  unavailable?: boolean
}

function unavailable(): ServerTestResult {
  return {
    mxHost: null, reachable: false, connectMs: null, banner: null,
    starttls: false, tls: { upgraded: false, version: null },
    openRelay: false, greylisted: false, unavailable: true,
  }
}

export async function serverTest(domain: string): Promise<ServerTestResult> {
  const workerUrl = process.env.SMTP_WORKER_URL
  const workerKey = process.env.SMTP_WORKER_KEY
  if (!workerUrl) return unavailable()

  try {
    const url = new URL('/server-test', workerUrl)
    url.searchParams.set('domain', domain)
    const res = await fetch(url.toString(), {
      headers: workerKey ? { 'x-api-key': workerKey } : {},
      signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) return unavailable()
    return (await res.json()) as ServerTestResult
  } catch {
    return unavailable()
  }
}
