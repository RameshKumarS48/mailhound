import { NextRequest, NextResponse } from 'next/server'
import dns from 'dns/promises'

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 })

  try {
    const records = await dns.resolveMx(domain)
    const sorted = records.sort((a, b) => a.priority - b.priority)
    return NextResponse.json({ domain, records: sorted })
  } catch {
    return NextResponse.json({ domain, records: [], error: 'No MX records found for this domain' })
  }
}
