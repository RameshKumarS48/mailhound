import { NextRequest, NextResponse } from 'next/server'
import { dnsblCheck } from '@/lib/verification/dnsbl'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// Public, unauthenticated teaser: the full watchlist board (every zone + clean/
// listed light) but without the TXT reason strings. Continuous monitoring and
// delisting detail live behind signup / a Watch subscription.
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('target')?.trim().toLowerCase()
    ?? req.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  if (!target) return NextResponse.json({ error: 'target (domain or IP) required' }, { status: 400 })

  if (rateLimit(`blacklist:${clientIp(req)}`, 8)) {
    return NextResponse.json(
      { error: 'Rate limit reached. Sign up for continuous monitoring and alerts.' },
      { status: 429 }
    )
  }

  const full = await dnsblCheck(target)
  if (full.unavailable) {
    return NextResponse.json(
      { error: 'Blacklist lookup is temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    )
  }

  return NextResponse.json({
    target: full.target,
    ips: full.ips,
    listedCount: full.listedCount,
    totalChecks: full.totalChecks,
    listedOn: full.listedOn,
    results: full.results.map((r) => ({ zone: r.zone, listed: r.listed, type: r.type })),
    teaser: true,
    checkedAt: new Date().toISOString(),
  })
}
