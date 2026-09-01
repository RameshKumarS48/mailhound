'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Postmark } from '@/components/site-chrome'

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — desktop only. Honest proof, no fabricated quotes. */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-paper-2/60 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2.5 text-hound">
          <Postmark size={30} />
          <span className="display text-xl font-semibold text-ink">Mailhound</span>
        </Link>

        <div className="max-w-sm">
          <p className="eyebrow text-hound">The case for clean lists</p>
          <p className="display mt-4 text-2xl font-semibold leading-snug text-ink">
            Every dead inbox, sniffed out before you hit send.
          </p>

          {/* A specimen verdict — the product's output, shown at rest */}
          <div className="panel mt-8 overflow-hidden" style={{ boxShadow: 'var(--shadow-panel)' }}>
            <div
              className="flex items-center justify-between border-b border-dashed border-line px-4 py-3"
              style={{ background: 'var(--valid-bg)' }}
            >
              <span className="font-mono text-sm text-ink">priya@acmecorp.com</span>
              <span className="stamp text-valid" style={{ opacity: 0.94 }}>
                <span className="block text-sm leading-none">Valid</span>
              </span>
            </div>
            <ul className="space-y-1.5 px-4 py-3">
              {[
                ['Syntax', 'RFC-5322 valid'],
                ['MX record', 'aspmx.l.google.com'],
                ['SMTP probe', 'Mailbox accepts'],
              ].map(([k, v]) => (
                <li key={k} className="flex items-baseline text-xs">
                  <span className="font-mono text-ink">{k}</span>
                  <span className="leader" />
                  <span className="font-mono text-ink-2">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-ink-3">
          <li>7-point engine</li>
          <li>Credits never expire</li>
          <li>No “unknown” verdicts</li>
        </ul>
      </aside>

      {/* Form column */}
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5 text-hound lg:hidden">
            <Postmark size={30} />
            <span className="display text-xl font-semibold text-ink">Mailhound</span>
          </Link>

          <div className="panel p-7">
            <p className="eyebrow text-hound">{eyebrow}</p>
            <h1 className="display mt-2 text-2xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-ink-2">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-6 text-center text-sm text-ink-2">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export function AuthField({
  label,
  type,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type

  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="relative mt-1.5">
        <input
          {...props}
          type={inputType}
          className={`w-full rounded-lg border border-line-2 bg-paper py-3 pl-4 text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25 ${
            isPassword ? 'pr-11' : 'pr-4'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal(v => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-3 transition-colors hover:text-ink"
          >
            {reveal ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </label>
  )
}
