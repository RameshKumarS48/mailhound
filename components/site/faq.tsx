import { Plus } from 'lucide-react'

/* FAQ built on native <details>/<summary> — accessible and keyboard-operable
   with zero client JS, which keeps it off the critical path. Answers the real
   purchase objections at the decision point (an honest trust substitute for
   testimonials a new product doesn't have yet). */

export type QA = { q: string; a: React.ReactNode }

export function Faq({ items }: { items: QA[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map(item => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-ink text-fluid-md">{item.q}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line-2 text-ink-2 transition-transform duration-200 group-open:rotate-45 group-open:border-hound group-open:text-hound">
              <Plus size={15} />
            </span>
          </summary>
          <div className="pb-5 pr-11 text-ink-2 text-fluid-sm leading-relaxed">{item.a}</div>
        </details>
      ))}
    </div>
  )
}
