import Link from 'next/link'
import { Wordmark, SolutionsMenu } from '@/components/site-chrome'
import { MobileNav } from '@/components/site/mobile-nav'
import { ThemeToggle } from '@/components/site/theme-toggle'

/* Shared header for the signed-in surfaces (home, dashboard, monitoring,
   developer dashboard). Mirrors the marketing nav so signed-in users can reach
   every shipped solution — the Solutions mega-menu, Developers and Pricing —
   not just the three app tabs they had before. Mobile gets a real menu too
   (previously signed-in mobile users had no navigation at all). */

const NAV: { href: string; label: string }[] = [
  { href: '/home', label: 'Home' },
  { href: '/dashboard', label: 'Verify' },
  { href: '/history', label: 'History' },
  { href: '/monitoring', label: 'Monitoring' },
  { href: '/developers/dashboard', label: 'API keys' },
]

export function AppHeader({ email, current }: { email?: string; current?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Wordmark />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(item => {
              const on = current === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    on ? 'bg-paper-3 font-medium text-ink' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <SolutionsMenu />
            <Link
              href="/pricing"
              className="rounded-full px-3 py-1.5 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {email && (
            <span className="hidden max-w-[14rem] truncate font-mono text-xs text-ink-3 md:inline">
              {email}
            </span>
          )}
          <ThemeToggle />
          <form action="/api/auth/signout" method="post" className="hidden lg:block">
            <button className="rounded-full border border-line-2 px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink">
              Sign out
            </button>
          </form>
          <div className="lg:hidden">
            <MobileNav appNav={NAV} />
          </div>
        </div>
      </div>
    </header>
  )
}
