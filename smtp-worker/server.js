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
 *
 * Endpoints:
 *   GET /verify?email=            single-mailbox check (used by validation)
 *   GET /health                   liveness
 *   GET /server-test?domain=      deliverability probe: banner/STARTTLS/TLS/open-relay
 *   GET /probe-multi?domain=&candidates=a,b,c   probe several mailboxes (email finder)
 *   GET /dnsbl?target=            DNSBL/blacklist lookups for a domain or IP
 */

const http  = require('http')
const net   = require('net')
const tls   = require('tls')
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

// ── Sequential SMTP client (for /server-test) ────────────────────────────────
// Unlike smtpProbe's fire-and-forget state machine, server-test needs to read
// responses one at a time and swap the socket to TLS mid-session, so it uses a
// small awaitable reader that buffers whole responses across data chunks.

function smtpReader(sock) {
  const state = { buf: '', waiter: null, collected: [] }
  function onData(chunk) {
    state.buf += chunk
    const lines = state.buf.split('\r\n')
    state.buf = lines.pop()
    for (const line of lines) {
      if (!line.trim()) continue
      state.collected.push(line)
      const isLast = line[3] !== '-'
      if (isLast && state.waiter) {
        const code = parseInt(line.slice(0, 3), 10)
        const w = state.waiter
        const c = state.collected
        state.waiter = null
        state.collected = []
        w({ code, lines: c })
      }
    }
  }
  sock.on('data', onData)
  return {
    read(timeoutMs) {
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => { state.waiter = null; reject(new Error('read timeout')) }, timeoutMs)
        state.waiter = (r) => { clearTimeout(t); resolve(r) }
      })
    },
    stop() { sock.off('data', onData) },
  }
}

function sendLine(sock, cmd) {
  return new Promise((resolve) => { try { sock.write(cmd + '\r\n', resolve) } catch { resolve() } })
}

// Probe MAIL FROM + RCPT to an unrelated external domain. Acceptance of an
// external recipient (that this server has no business relaying for) is the
// classic open-relay signal. We never send DATA, so no mail is transmitted.
async function relayTest(sock, reader, result) {
  try {
    await sendLine(sock, `MAIL FROM:<${MAIL_FROM}>`)
    const mf = await reader.read(TIMEOUT_MS)
    if (mf.code >= 400 && mf.code < 500) { result.greylisted = true; return }
    if (mf.code !== 250) return
    await sendLine(sock, 'RCPT TO:<relay-probe@ietf.org>')
    const rc = await reader.read(TIMEOUT_MS)
    if (rc.code >= 400 && rc.code < 500) result.greylisted = true
    result.openRelay = (rc.code === 250 || rc.code === 251)
    try { await sendLine(sock, 'RSET'); await reader.read(TIMEOUT_MS) } catch {}
  } catch {}
}

async function serverTest(domain) {
  const t0 = Date.now()
  const result = {
    domain, mxHost: null, reachable: false, connectMs: null, banner: null,
    starttls: false, tls: { upgraded: false, version: null }, openRelay: false,
    greylisted: false, error: null,
  }

  try {
    result.mxHost = await getMXHost(domain)
  } catch (e) {
    result.error = `MX lookup failed: ${e.message}`
    return result
  }

  let socket
  try {
    socket = await new Promise((resolve, reject) => {
      const s = net.createConnection({ host: result.mxHost, port: 25 })
      s.setTimeout(TIMEOUT_MS)
      s.once('connect', () => resolve(s))
      s.once('timeout', () => reject(new Error('connect timeout')))
      s.once('error', (e) => reject(e))
    })
  } catch (e) {
    result.error = `Connect failed: ${e.code || e.message}`
    return result
  }

  socket.setEncoding('utf8')
  socket.setTimeout(TIMEOUT_MS)
  result.reachable = true
  result.connectMs = Date.now() - t0

  const reader = smtpReader(socket)
  try {
    const banner = await reader.read(TIMEOUT_MS)
    result.banner = (banner.lines[0] || '').slice(0, 200)
    if (banner.code !== 220) { result.error = `Banner code ${banner.code}`; socket.destroy(); return result }

    await sendLine(socket, `EHLO ${HELO_DOMAIN}`)
    const ehlo = await reader.read(TIMEOUT_MS)
    const caps = ehlo.lines.map((l) => l.slice(4).trim().toUpperCase())
    result.starttls = caps.some((c) => c.startsWith('STARTTLS'))

    if (result.starttls) {
      await sendLine(socket, 'STARTTLS')
      const st = await reader.read(TIMEOUT_MS)
      if (st.code === 220) {
        reader.stop()
        try {
          const tlsSocket = await new Promise((resolve, reject) => {
            const ts = tls.connect(
              { socket, servername: result.mxHost, rejectUnauthorized: false },
              () => resolve(ts)
            )
            ts.setTimeout(TIMEOUT_MS)
            ts.once('error', reject)
          })
          tlsSocket.setEncoding('utf8')
          result.tls.upgraded = true
          result.tls.version = tlsSocket.getProtocol()
          const tlsReader = smtpReader(tlsSocket)
          await sendLine(tlsSocket, `EHLO ${HELO_DOMAIN}`)
          await tlsReader.read(TIMEOUT_MS)
          await relayTest(tlsSocket, tlsReader, result)
          try { await sendLine(tlsSocket, 'QUIT') } catch {}
          tlsSocket.destroy()
          return result
        } catch (e) {
          result.tls.error = e.code || e.message
          try { socket.destroy() } catch {}
          return result
        }
      }
    }

    // No STARTTLS (or it wasn't advertised) — run the relay test in plaintext.
    await relayTest(socket, reader, result)
    try { await sendLine(socket, 'QUIT') } catch {}
    socket.destroy()
    return result
  } catch (e) {
    result.error = result.error || e.message
    try { socket.destroy() } catch {}
    return result
  }
}

// ── Multi-candidate probe (for /probe-multi, email finder) ───────────────────

async function probeMulti(domain, candidates) {
  let mxHost
  try {
    mxHost = await getMXHost(domain)
  } catch (e) {
    return { domain, mxHost: null, catchAll: false, unreachable: true, error: `MX lookup failed: ${e.message}`, results: candidates.map((a) => ({ address: a, exists: 'unknown' })) }
  }

  const bogus = `xhnd_verify_nxdomain_${Date.now()}@${domain}`
  const catchAllProbe = await smtpProbe(mxHost, bogus)

  if (catchAllProbe.ok === true) {
    return { domain, mxHost, catchAll: true, results: candidates.map((a) => ({ address: a, exists: 'unknown' })) }
  }
  if (catchAllProbe.ok === null && (
    catchAllProbe.detail.includes('timeout') ||
    catchAllProbe.detail.includes('TCP error') ||
    catchAllProbe.detail.includes('rejected')
  )) {
    return { domain, mxHost, catchAll: false, unreachable: true, results: candidates.map((a) => ({ address: a, exists: 'unknown' })) }
  }

  // Probe candidates one at a time (many MX servers throttle parallel sessions).
  // Stop early on the first accepted mailbox.
  const results = []
  for (const addr of candidates) {
    const p = await smtpProbe(mxHost, addr)
    const exists = p.ok === true ? 'yes' : p.ok === false ? 'no' : 'unknown'
    results.push({ address: addr, exists })
    if (exists === 'yes') break
  }
  return { domain, mxHost, catchAll: false, results }
}

// ── DNSBL / blacklist lookups (for /dnsbl) ───────────────────────────────────

const IP_DNSBL_ZONES = [
  'zen.spamhaus.org',
  'bl.spamcop.net',
  'b.barracudacentral.org',
  'dnsbl.sorbs.net',
  'dnsbl-1.uceprotect.net',
  'psbl.surriel.com',
  'cbl.abuseat.org',
]
const DOMAIN_DNSBL_ZONES = [
  'dbl.spamhaus.org',
  'multi.surbl.org',
]

function reverseIp(ip) {
  return ip.split('.').reverse().join('.')
}

async function checkZone(query, zone) {
  try {
    const addrs = await dns.resolve4(`${query}.${zone}`)
    // Spamhaus & friends return 127.255.255.x when a query is refused (e.g. from
    // a public/over-quota resolver). That is NOT a listing — flag it as an error.
    const errorCodes = addrs.filter((a) => a.startsWith('127.255.255.'))
    if (addrs.length > 0 && errorCodes.length === addrs.length) {
      return { zone, listed: false, error: 'query refused (resolver limit / not registered)' }
    }
    let txt = null
    try { const t = await dns.resolveTxt(`${query}.${zone}`); txt = t.flat().join(' ').slice(0, 300) } catch {}
    return { zone, listed: addrs.length > 0, codes: addrs, txt }
  } catch (e) {
    // NXDOMAIN is the normal "not listed" answer.
    if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') return { zone, listed: false }
    return { zone, listed: false, error: e.code || e.message }
  }
}

async function dnsblCheck(target) {
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(target)
  const results = []
  let ips = []
  let domain = null

  if (isIp) {
    ips = [target]
  } else {
    domain = target.toLowerCase()
    try {
      const mx = await getMXHost(domain)
      const a = await dns.resolve4(mx).catch(() => [])
      ips.push(...a)
    } catch {}
    try { const a = await dns.resolve4(domain); ips.push(...a) } catch {}
    ips = [...new Set(ips)]
  }

  for (const ip of ips) {
    const rev = reverseIp(ip)
    const zoneResults = await Promise.all(IP_DNSBL_ZONES.map((z) => checkZone(rev, z)))
    zoneResults.forEach((r) => results.push({ ...r, target: ip, type: 'ip' }))
  }

  if (domain) {
    const zoneResults = await Promise.all(DOMAIN_DNSBL_ZONES.map((z) => checkZone(domain, z)))
    zoneResults.forEach((r) => results.push({ ...r, target: domain, type: 'domain' }))
  }

  const listed = results.filter((r) => r.listed)
  return {
    target,
    ips,
    listedCount: listed.length,
    totalChecks: results.length,
    listedOn: listed.map((r) => r.zone),
    results,
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

  if (url.pathname === '/server-test') {
    const domain = url.searchParams.get('domain')
    if (!domain) {
      res.writeHead(400)
      return res.end(JSON.stringify({ error: 'Missing domain param' }))
    }
    try {
      const result = await serverTest(domain.trim().toLowerCase())
      res.writeHead(200)
      return res.end(JSON.stringify(result))
    } catch (e) {
      res.writeHead(500)
      return res.end(JSON.stringify({ error: String(e) }))
    }
  }

  if (url.pathname === '/probe-multi') {
    const domain = url.searchParams.get('domain')
    const candidates = (url.searchParams.get('candidates') || '')
      .split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20)
    if (!domain || candidates.length === 0) {
      res.writeHead(400)
      return res.end(JSON.stringify({ error: 'Missing domain or candidates param' }))
    }
    try {
      const result = await probeMulti(domain.trim().toLowerCase(), candidates)
      res.writeHead(200)
      return res.end(JSON.stringify(result))
    } catch (e) {
      res.writeHead(500)
      return res.end(JSON.stringify({ error: String(e) }))
    }
  }

  if (url.pathname === '/dnsbl') {
    const targetRaw = url.searchParams.get('target')
    if (!targetRaw) {
      res.writeHead(400)
      return res.end(JSON.stringify({ error: 'Missing target param' }))
    }
    const target = targetRaw.trim().toLowerCase()
    const cacheKey = `dnsbl:${target}`
    const cached = getCached(cacheKey)
    if (cached) {
      res.writeHead(200)
      return res.end(JSON.stringify({ ...cached, cached: true }))
    }
    try {
      const result = await dnsblCheck(target)
      setCache(cacheKey, result)
      res.writeHead(200)
      return res.end(JSON.stringify(result))
    } catch (e) {
      res.writeHead(500)
      return res.end(JSON.stringify({ error: String(e) }))
    }
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
