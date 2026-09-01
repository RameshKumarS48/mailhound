import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeApiKey } from '@/lib/api-keys'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyId } = await params
  const ok = await revokeApiKey(user.id, keyId)
  if (!ok) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
