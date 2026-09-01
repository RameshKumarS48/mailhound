'use client'

import { Moon, Sun } from 'lucide-react'

/* Theme toggle. The initial class is set before paint by the inline script in
   the root layout (no flash), so this only mirrors and flips the current state.
   Choice is persisted to localStorage; with nothing stored we follow the OS. */

export function ThemeToggle({ className = '' }: { className?: string }) {
  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* storage blocked — the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`grid h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink ${className}`}
    >
      {/* Icon tracks the .dark class (set pre-paint) via the dark: variant, so
          it's correct on first paint with no hydration flip. */}
      <Sun size={17} className="hidden dark:block" />
      <Moon size={17} className="block dark:hidden" />
    </button>
  )
}
