// Simple in-memory fixed-window rate limiter for anonymous public tools.
// Namespace the key per tool (e.g. `domain-health:${ip}`). Note: per-process
// only (not shared across serverless instances) and IPs are spoofable — this is
// a light abuse guard for free tools, not a security boundary.

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = buckets.get(key)
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
