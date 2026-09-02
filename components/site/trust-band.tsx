import { KeyRound, Lock, ReceiptText, ShieldCheck } from 'lucide-react'

/* Honest trust for a brand-new product: no fabricated logos or review scores.
   ProofStrip states verifiable capability facts; TrustBand states our real
   security/data posture. Everything here is substantiable in the codebase. */

export function ProofStrip({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-ink-3">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-6">
          {i > 0 && <span aria-hidden className="hidden text-line-2 sm:inline">/</span>}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const POSTURE = [
  {
    icon: Lock,
    title: 'Encrypted in transit',
    body: 'Every request runs over TLS. We probe mailboxes; we never send to them.',
  },
  {
    icon: KeyRound,
    title: 'API keys shown once',
    body: 'Keys are stored hashed. You see the secret at creation and never again.',
  },
  {
    icon: ReceiptText,
    title: 'Payments handled by Dodo',
    body: 'Card data never touches our servers — checkout is fully off-loaded to our processor.',
  },
  {
    icon: ShieldCheck,
    title: 'Your list stays yours',
    body: 'Uploaded addresses are verified and returned. We don’t sell or seed lists.',
  },
]

export function TrustBand() {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {POSTURE.map(p => (
        <div key={p.title} className="bg-paper-2 p-5">
          <p.icon size={18} className="text-hound" />
          <p className="mt-3 font-semibold text-ink text-fluid-sm">{p.title}</p>
          <p className="mt-1.5 text-ink-2 text-fluid-xs leading-relaxed">{p.body}</p>
        </div>
      ))}
    </div>
  )
}

/* Real customer logos go here once they exist. Renders nothing until then —
   deliberately no grey placeholder boxes, which read as unfinished.
   To enable: pass real, permission-granted logos as `logos`. */
export function LogoBar({
  eyebrow,
  logos = [],
}: {
  eyebrow: string
  logos?: { src: string; alt: string }[]
}) {
  if (logos.length === 0) return null
  return (
    <div className="text-center">
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-60 grayscale">
        {logos.map(l => (
          // eslint-disable-next-line @next/next/no-img-element -- external partner logos, arbitrary hosts; next/image adds no value here
          <img key={l.src} src={l.src} alt={l.alt} className="h-6 w-auto" />
        ))}
      </div>
    </div>
  )
}
