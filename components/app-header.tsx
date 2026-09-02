import Link from 'next/link'
import { Wordmark } from '@/components/site-chrome'
import { ThemeToggle } from '@/components/site/theme-toggle'

/* Shared header for the signed-in surfaces (dashboard, monitoring, developer
   dashboard). Replaces three near-identical hand-rolled headers and adds
   cross-navigation between the app sections plus the theme toggle. */

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Verify' },
  { href: '/monitoring', label: 'Monitoring' },
  { href: '/developers/dashboard', label: 'API keys' },
]

export function AppHeader({ email, current }: { email?: string; current?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <Wordmark />
          <nav className="hidden items-center gap-1 sm:flex">
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
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {email && (
            <span className="hidden max-w-[14rem] truncate font-mono text-xs text-ink-3 md:inline">
              {email}
            </span>
          )}
          <ThemeToggle />
          <form action="/api/auth/signout" method="post">
            <button className="rounded-full border border-line-2 px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
