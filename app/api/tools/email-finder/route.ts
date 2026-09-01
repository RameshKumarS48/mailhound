import { NextRequest, NextResponse } from 'next/server'
import { findEmail } from '@/lib/verification/finder'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// Public, unauthenticated teaser: returns the single most-likely pattern guess
// WITHOUT SMTP verification. The verified address + ranked alternatives are gated
// behind the metered API (/v1/find).
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const firstName = p.get('firstName')?.trim() ?? ''
  const lastName = p.get('lastName')?.trim() ?? ''
  const domain = p.get('domain')?.trim() ?? ''

  if (!firstName || !domain) {
    return NextResponse.json({ error: 'firstName and domain are required' }, { status: 400 })
  }

  if (rateLimit(`email-finder:${clientIp(req)}`, 8)) {
    return NextResponse.json(
      { error: 'Rate limit reached. Sign up to run verified searches.' },
      { status: 429 }
    )
  }

  const result = await findEmail({ firstName, lastName, domain, verify: false })

  return NextResponse.json({
    domain: result.domain,
    name: result.name,
    email: result.email,
    pattern: result.pattern,
    confidence: 'guess',
    verified: false,
    alternativeCount: Math.max(0, result.alternatives.length - 1),
    teaser: true,
    checkedAt: result.checkedAt,
  })
}
