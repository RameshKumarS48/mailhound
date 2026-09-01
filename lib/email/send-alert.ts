// Transactional alert email for blacklist monitoring.
//
// NOTE: the provider is intended to be provisioned via `/marketplace` (Resend is
// the likely fit). To avoid committing a provider SDK before that, this calls the
// provider's REST API over `fetch` and is fully env-gated: with no key set it
// degrades to a logged no-op so the cron never throws. Once provisioned, set
// RESEND_API_KEY and ALERT_FROM_EMAIL and alerts start sending — no code change.

interface AlertListing {
  zone: string
  txt?: string | null
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export async function sendBlacklistAlert(
  toEmail: string,
  target: string,
  newListings: AlertListing[],
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ALERT_FROM_EMAIL
  if (!apiKey || !from) {
    console.warn(`[alert] email provider not configured — would alert ${toEmail} that ${target} was newly listed on ${newListings.map((l) => l.zone).join(', ')}`)
    return { sent: false, reason: 'provider-not-configured' }
  }

  const zones = newListings.map((l) => l.zone)
  const subject = `⚠️ ${target} was just listed on ${zones.length} blacklist${zones.length !== 1 ? 's' : ''}`
  const rows = newListings
    .map((l) => `<li style="margin:4px 0"><strong>${l.zone}</strong>${l.txt ? ` — <span style="color:#55504a">${escapeHtml(l.txt)}</span>` : ''}</li>`)
    .join('')

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1b1917">
      <p style="font:600 12px/1 monospace;letter-spacing:.14em;text-transform:uppercase;color:#ad3626">New blacklisting detected</p>
      <h1 style="font-size:22px;margin:8px 0 4px">${escapeHtml(target)} landed on a blacklist</h1>
      <p style="color:#55504a;margin:0 0 16px">The hound found <strong>${zones.length}</strong> new listing${zones.length !== 1 ? 's' : ''} on your watched target. New listings can throttle your delivery within hours — request delisting and fix the root cause.</p>
      <ul style="padding-left:18px;margin:0 0 20px">${rows}</ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://mailhound.xyz'}/monitoring" style="display:inline-block;background:#124d48;color:#efeadf;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600">View the stakeout log →</a>
      <p style="color:#8a8478;font-size:12px;margin-top:24px">Mailhound — case closed on bad email.</p>
    </div>`

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [toEmail], subject, html }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { sent: false, reason: `provider-${res.status}: ${body.slice(0, 200)}` }
    }
    return { sent: true }
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : 'send-failed' }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ))
}
