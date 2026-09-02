import { NextRequest, NextResponse } from 'next/server'
import { checkDomainHealth } from '@/lib/verification/domain-health'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// Public, unauthenticated teaser: grade + per-check status/detail, but the raw
// DNS records and step-by-step remediation are gated behind signup.
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 })

  if (rateLimit(`domain-health:${clientIp(req)}`, 8)) {
    return NextResponse.json(
      { error: 'Rate limit reached. Sign up for unlimited, full reports.' },
      { status: 429 }
    )
  }

  const full = await checkDomainHealth(domain)
  const checks = Object.fromEntries(
    Object.entries(full.checks).map(([k, c]) => [k, { status: c.status, label: c.label, detail: c.detail }])
  )
  return NextResponse.json({
    domain: full.domain,
    grade: full.grade,
    score: full.score,
    checks,
    remediationCount: full.remediation.length,
    teaser: true,
    checkedAt: full.checkedAt,
  })
}
