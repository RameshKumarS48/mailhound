import Link from 'next/link'
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
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2.5 text-hound">
          <Postmark size={30} />
          <span className="display text-xl font-semibold text-ink">Mailhound</span>
        </Link>

        <div className="panel p-7">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-2 text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-2">{footer}</div>}
      </div>
    </div>
  )
}

export function AuthField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-line-2 bg-paper px-4 py-3 text-ink placeholder:text-ink-3 focus:border-hound focus:outline-none focus:ring-2 focus:ring-hound/25"
      />
    </label>
  )
}
