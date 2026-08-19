'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell, AuthField } from '@/components/auth-shell'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <AuthShell eyebrow="Case access" title="Set a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="font-mono text-sm text-invalid">{error}</p>}
        <button type="submit" disabled={loading || password.length < 8} className="btn-hound w-full">
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
