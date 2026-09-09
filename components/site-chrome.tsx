import Link from "next/link"
import { MobileNav } from "@/components/site/mobile-nav"
import { NavCta } from "@/components/site/nav-cta"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { ScrollProgress } from "@/components/site/motion/scroll-progress"
import { SOLUTION_GROUPS } from "@/components/site/solutions"

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

export function SiteNav() {
  return (
    <>
    <ScrollProgress />
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
          <SolutionsMenu />
          <Link
            href="/developers"
            className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            Developers
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            Pricing
          </Link>
          <ThemeToggle className="ml-1" />
          <NavCta />
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
    </>
  )
}

const TOOLS: [string, string][] = [
  ["MX Lookup", "/mx-lookup"],
  ["Domain Health", "/domain-health"],
  ["Blacklist Check", "/blacklist"],
  ["Email Finder", "/email-finder"],
]

/* CSS-only mega-menu (hover + keyboard focus-within) so this stays a Server
   Component. The trigger is a real link to a tool hub for no-JS/touch users;
   the panel groups every shipped surface the way a deliverability team works
   a list — clean it, build reputation, keep watch. */
export function SolutionsMenu() {
  return (
    <div className="group relative hidden sm:block">
      <Link
        href="/domain-health"
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink group-focus-within:text-ink"
      >
        Solutions
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="mt-0.5 opacity-60 transition-transform group-hover:rotate-180 group-focus-within:rotate-180">
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-[min(46rem,calc(100vw-3rem))] -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="panel grid grid-cols-3 gap-1 p-3">
          {SOLUTION_GROUPS.map(group => (
            <div key={group.title} className="flex flex-col">
              <p className="eyebrow px-3 pb-1 pt-2">{group.title}</p>
              {group.items.map(item => (
                <Link
                  key={`${group.title}-${item.label}`}
                  href={item.href}
                  className="group/item rounded-lg px-3 py-2 transition-colors hover:bg-paper-3"
                >
                  <span className="block text-sm font-medium text-ink transition-colors group-hover/item:text-hound">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-3">
                    {item.desc}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
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
              Email verification that returns a real verdict. We catch the dead,
              fake, and risky addresses before you hit send.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
            <FooterCol
              title="Product"
              links={[
                ["Verify", "/"],
                ["Pricing", "/pricing"],
                ["Monitoring", "/monitoring"],
              ]}
            />
            <FooterCol
              title="Free tools"
              links={TOOLS}
            />
            <FooterCol
              title="Developers"
              links={[
                ["API Docs", "/docs"],
                ["Developer Portal", "/developers"],
                ["Key Dashboard", "/developers/dashboard"],
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
          <span className="font-mono">© 2026 Mailhound — know before you send.</span>
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
