import Link from "next/link"

/* Postmark roundel with a hound's paw at the center — the cancellation
   stamp a letter earns once it has been checked. Scales with `size`. */
export function Postmark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <circle cx="32" cy="32" r="24.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      {/* paw pad + four toes */}
      <ellipse cx="32" cy="38" rx="8" ry="6.5" fill="currentColor" />
      <circle cx="21.5" cy="30" r="3.4" fill="currentColor" />
      <circle cx="28" cy="24.5" r="3.6" fill="currentColor" />
      <circle cx="36" cy="24.5" r="3.6" fill="currentColor" />
      <circle cx="42.5" cy="30" r="3.4" fill="currentColor" />
    </svg>
  )
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="text-hound transition-transform group-hover:-rotate-6">
        <Postmark />
      </span>
      <span className="display text-[1.35rem] font-semibold tracking-tight text-ink">
        Mailhound
      </span>
    </Link>
  )
}

export function SiteNav({ authed = false }: { authed?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/mx-lookup"
            className="hidden rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink sm:inline-block"
          >
            MX Lookup
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            Pricing
          </Link>
          {authed ? (
            <Link href="/dashboard" className="btn-hound !px-4 !py-2 text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                Log in
              </Link>
              <Link href="/signup" className="btn-hound !px-4 !py-2 text-sm">
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              The bloodhound for your list. We track down every dead, fake, and
              risky address before you hit send.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                ["Verify", "/"],
                ["Pricing", "/pricing"],
                ["MX Lookup", "/mx-lookup"],
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                ["Log in", "/login"],
                ["Start free", "/signup"],
                ["Dashboard", "/dashboard"],
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
              ]}
            />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row sm:items-center">
          <span className="font-mono">© 2026 Mailhound — case closed on bad email.</span>
          <span className="font-mono">mailhound.xyz</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-ink-2 transition-colors hover:text-hound">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
