'use client'

import { useEffect } from 'react'
import { initMixpanel } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { initMixpanel() }, [])
  return <>{children}</>
}
