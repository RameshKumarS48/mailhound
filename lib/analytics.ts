import mixpanel from 'mixpanel-browser'

const TOKEN = 'a8dccb71c66f8fb1654f628cd4c8c241'
let ready = false

export function initMixpanel() {
  if (ready || typeof window === 'undefined') return
  mixpanel.init(TOKEN, { persistence: 'localStorage', autocapture: false })
  ready = true
}

function track(event: string, props?: Record<string, unknown>) {
  if (!ready) return
  mixpanel.track(event, props)
}

function identify(userId: string, email?: string) {
  if (!ready) return
  mixpanel.identify(userId)
  if (email) mixpanel.people.set({ $email: email })
}

export const analytics = { track, identify }
