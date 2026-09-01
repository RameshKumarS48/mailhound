import { Reveal } from './reveal'

/* Shared section shell + heading kit. Centralizes the max-width, gutter and
   vertical rhythm that every marketing section was hard-coding, so the whole
   site breathes on one grid. */

export function Section({
  children,
  tint = false,
  divide = true,
  className = '',
  id,
}: {
  children: React.ReactNode
  tint?: boolean
  divide?: boolean
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={[
        divide ? 'border-t border-line' : '',
        tint ? 'bg-paper-2/50' : '',
        className,
      ].join(' ')}
    >
      <div
        className="mx-auto px-6"
        style={{ maxWidth: 'var(--maxw)', paddingBlock: 'var(--section-y)' }}
      >
        {children}
      </div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  className = '',
}: {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <Reveal
      className={[
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
        className,
      ].join(' ')}
    >
      <p className="eyebrow text-hound">{eyebrow}</p>
      <h2 className="display mt-4 font-semibold text-ink text-fluid-3xl">{title}</h2>
      {lede && <p className="mt-4 text-ink-2 text-fluid-md leading-relaxed">{lede}</p>}
    </Reveal>
  )
}
