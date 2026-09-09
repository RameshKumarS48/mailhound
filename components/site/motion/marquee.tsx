/* An infinite horizontal ticker. Pure CSS (see .marquee-track in globals.css)
   so it ships zero JS and is auto-frozen by the reduced-motion kill-switch —
   at which point the first copy simply sits still, fully legible. The content
   is duplicated once so the loop is seamless; the duplicate is aria-hidden.

   Used for real capability facts (the seven checks), never fake logos. */
export function Marquee({
  items,
  className = '',
}: {
  items: React.ReactNode[]
  className?: string
}) {
  return (
    <div className={`marquee-mask group flex overflow-hidden ${className}`}>
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className="marquee-track flex shrink-0 items-center gap-3 pr-3 group-hover:[animation-play-state:paused]"
        >
          {items.map((item, i) => (
            <li key={i} className="shrink-0">
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
