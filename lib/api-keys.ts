import { createHash, randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

function generateRawKey(): string {
  return 'mhk_' + randomBytes(16).toString('hex')
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

export async function createApiKey(userId: string, name: string) {
  const raw = generateRawKey()
  const key_hash = hashKey(raw)
  const key_prefix = raw.slice(0, 12)
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('api_keys')
    .insert({ user_id: userId, key_hash, key_prefix, name })
    .select('id, key_prefix, name, is_active, created_at, last_used_at')
    .single()
  if (error) throw new Error(`createApiKey failed: ${error.message}`)
  return { ...data, key: raw }
}

export async function verifyApiKey(rawKey: string): Promise<{ userId: string } | null> {
  if (!rawKey.startsWith('mhk_')) return null
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', hashKey(rawKey))
    .eq('is_active', true)
    .single()
  if (!data) return null
  // Fire-and-forget last_used_at update
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
  return { userId: data.user_id }
}

export async function listApiKeys(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, is_active, created_at, last_used_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', userId)
  return !error
}

export async function countActiveKeys(userId: string): Promise<number> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)
  return count ?? 0
}
