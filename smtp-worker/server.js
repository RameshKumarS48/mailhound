#!/usr/bin/env node
/**
 * Mailhound SMTP Verification Worker
 * Deploy on a VPS (Hetzner, DigitalOcean, etc.) where port 25 outbound is open.
 * The Next.js app calls this service; it does the actual SMTP handshakes.
 *
 * Env vars:
 *   PORT           HTTP port to listen on (default: 3001)
 *   API_KEY        Shared secret — set this and pass X-Api-Key header from Next.js
 *   HELO_DOMAIN    Your domain for EHLO (e.g. mailhound.xyz)
 *   MAIL_FROM      Sender for MAIL FROM (e.g. verify@mailhound.xyz)
 */

const http  = require('http')
const net   = require('net')
const dns   = require('dns').promises

const PORT        = Number(process.env.PORT)        || 3001
const API_KEY     = process.env.API_KEY             || ''
const HELO_DOMAIN = process.env.HELO_DOMAIN         || 'mailhound.xyz'
const MAIL_FROM   = process.env.MAIL_FROM           || 'verify@mailhound.xyz'
const TIMEOUT_MS  = 10_000

// Simple in-memory cache — avoids hammering the same MX server
const cache = new Map() // key → { result, expiresAt }
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null }
  return entry.result
}
function setCache(key, result) {
  cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL })
  // Evict oldest entries if cache grows large
  if (cache.size > 10_000) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
}

async function getMXHost(domain) {
  const records = await dns.resolveMx(domain)
  if (!records.length) throw new Error('No MX records')
  records.sort((a, b) => a.priority - b.priority)
  return records[0].exchange
}

/**
 * Open one SMTP session and send RCPT TO for the given address.
 * Returns: { ok: true|false|null, code: number|null, detail: string }
 *   ok=true  → server accepted the recipient (250)
 *   ok=false → server rejected the recipient (550/551/553)
 *   ok=null  → inconclusive (timeout, temp error, connection refused, etc.)
 */
function smtpProbe(mxHost, recipientEmail) {
  return new Promise((resolve) => {
    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      try { socket.destroy() } catch {}
      resolve(result)
    }

    const socket = new net.Socket()
    socket.setTimeout(TIMEOUT_MS)
    socket.setEncoding('utf8')

    let buf = ''
    let phase = 'banner' // banner → ehlo → mail_from → rcpt_to

    const send = (cmd) => {
      try { socket.write(cmd + '\r\n') } catch {}
    }

    socket.on('timeout', () => finish({ ok: null, code: null, detail: 'SMTP timeout' }))
    socket.on('error',   (e) => finish({ ok: null, code: null, detail: `TCP error: ${e.code || e.message}` }))

    socket.on('data', (chunk) => {
      buf += chunk
      const lines = buf.split('\r\n')
      buf = lines.pop() // keep incomplete last chunk

      for (const line of lines) {
        if (!line.trim()) continue
        const code = parseInt(line.slice(0, 3), 10)
        const isLast = line[3] !== '-' // multi-line SMTP responses use '-' as continuation
        if (!isLast) continue

        if (phase === 'banner') {
          if (code === 220) { phase = 'ehlo'; send(`EHLO ${HELO_DOMAIN}`) }
          else finish({ ok: null, code, detail: `Unexpected banner code: ${code}` })

        } else if (phase === 'ehlo') {
          if (code === 250) { phase = 'mail_from'; send(`MAIL FROM:<${MAIL_FROM}>`) }
          else finish({ ok: null, code, detail: `EHLO rejected: ${code}` })

        } else if (phase === 'mail_from') {
          if (code === 250) { phase = 'rcpt_to'; send(`RCPT TO:<${recipientEmail}>`) }
          else finish({ ok: null, code, detail: `MAIL FROM rejected: ${code}` })

        } else if (phase === 'rcpt_to') {
          send('QUIT')
          if (code === 250 || code === 251) {
            finish({ ok: true,  code, detail: 'Mailbox accepted' })
          } else if (code === 550 || code === 551 || code === 553 || code === 554) {
            finish({ ok: false, code, detail: `Mailbox rejected (${code})` })
          } else if (code === 452 || code === 421 || code === 450 || code === 451) {
            finish({ ok: null,  code, detail: `Temporary error (${code}) — treated as inconclusive` })
          } else {
            finish({ ok: null,  code, detail: `Unexpected RCPT response: ${code}` })
          }
        }
      }
    })

    socket.connect(25, mxHost)
  })
}

async function verifyEmail(email) {
  const domain = email.split('@')[1]

  let mxHost
  try {
    mxHost = await getMXHost(domain)
  } catch (e) {
    return { exists: 'unknown', catchAll: false, detail: `MX lookup failed: ${e.message}` }
  }

  // Step 1: probe with a definitely-nonexistent address to detect catch-all domains
  const bogus = `xhnd_verify_nxdomain_${Date.now()}@${domain}`
  const catchAllProbe = await smtpProbe(mxHost, bogus)

  if (catchAllProbe.ok === true) {
    // Server accepted a fake address — it accepts everything
    // No point checking the real email; flag as risky catch-all
    return { exists: 'unknown', catchAll: true, detail: `Catch-all domain — accepts all addresses` }
  }

  // Catch-all probe failed to connect at all — skip real check too
  if (catchAllProbe.ok === null && (
    catchAllProbe.detail.includes('timeout') ||
    catchAllProbe.detail.includes('TCP error') ||
    catchAllProbe.detail.includes('rejected')
  )) {
    return { exists: 'unknown', catchAll: false, detail: catchAllProbe.detail }
  }

  // Step 2: check the real email address
  const realProbe = await smtpProbe(mxHost, email)

  return {
    exists:   realProbe.ok === true  ? 'yes'
            : realProbe.ok === false ? 'no'
            : 'unknown',
    catchAll: false,
    detail:   realProbe.detail,
  }
}

// ── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (API_KEY) {
    const key = req.headers['x-api-key']
    if (key !== API_KEY) {
      res.writeHead(401)
      return res.end(JSON.stringify({ error: 'Unauthorized' }))
    }
  }

  const url = new URL(req.url, `http://localhost`)

  if (url.pathname === '/health') {
    res.writeHead(200)
    return res.end(JSON.stringify({ ok: true, cacheSize: cache.size }))
  }

  if (url.pathname !== '/verify') {
    res.writeHead(404)
    return res.end(JSON.stringify({ error: 'Not found. Use GET /verify?email=...' }))
  }

  const email = url.searchParams.get('email')
  if (!email || !email.includes('@')) {
    res.writeHead(400)
    return res.end(JSON.stringify({ error: 'Missing or invalid email param' }))
  }

  const cached = getCached(email)
  if (cached) {
    res.writeHead(200)
    return res.end(JSON.stringify({ ...cached, cached: true }))
  }

  try {
    const result = await verifyEmail(email)
    setCache(email, result)
    res.writeHead(200)
    res.end(JSON.stringify(result))
  } catch (e) {
    res.writeHead(500)
    res.end(JSON.stringify({ error: String(e) }))
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mailhound SMTP worker running on port ${PORT}`)
  console.log(`HELO domain: ${HELO_DOMAIN}`)
  console.log(`MAIL FROM:   ${MAIL_FROM}`)
  console.log(`Auth:        ${API_KEY ? 'enabled' : 'DISABLED — set API_KEY in production'}`)
})
