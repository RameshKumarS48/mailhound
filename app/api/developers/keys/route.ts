import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiKey, listApiKeys, countActiveKeys } from '@/lib/api-keys'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await listApiKeys(user.id)
  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const name = body?.name?.trim()
  if (!name || name.length > 50) {
    return NextResponse.json({ error: 'Name is required and must be 50 characters or fewer' }, { status: 400 })
  }

  const activeCount = await countActiveKeys(user.id)
  if (activeCount >= 5) {
    return NextResponse.json({ error: 'Maximum of 5 active API keys allowed' }, { status: 422 })
  }

  const result = await createApiKey(user.id, name)
  return NextResponse.json(result, { status: 201 })
}
