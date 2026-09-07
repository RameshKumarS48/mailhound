/* Single source of truth for the "Solutions" navigation — consumed by the
   desktop mega-menu (site-chrome) and the mobile drawer (mobile-nav).
   Grouped the way a deliverability team actually works a list: clean it,
   earn a reputation, then keep watch. Every item points at a shipped
   surface — no "coming soon" placeholders. */

export type SolutionItem = { label: string; href: string; desc: string }
export type SolutionGroup = { title: string; blurb: string; items: SolutionItem[] }

export const SOLUTION_GROUPS: SolutionGroup[] = [
  {
    title: "Clean your list",
    blurb: "Cull the dead, fake, and risky before you send.",
    items: [
      { label: "Email Verification", href: "/", desc: "Seven-point check on a single address" },
      { label: "Bulk Verification", href: "/dashboard", desc: "Scrub a whole CSV or Excel list at once" },
      { label: "Email Finder", href: "/email-finder", desc: "Track down an address from a name + domain" },
      { label: "Developer API", href: "/developers", desc: "The same engine, wired into your stack" },
    ],
  },
  {
    title: "Build sending reputation",
    blurb: "Prove your domain is set up to reach the inbox.",
    items: [
      { label: "Domain Health", href: "/domain-health", desc: "SPF, DKIM, DMARC, TLS & relay — graded A–F" },
      { label: "MX Lookup", href: "/mx-lookup", desc: "Read a domain's mail exchangers in plain terms" },
    ],
  },
  {
    title: "Monitor inbox health",
    blurb: "Catch a reputation problem before your senders do.",
    items: [
      { label: "Blacklist Check", href: "/blacklist", desc: "Scan a domain or IP across major DNSBLs" },
      { label: "Blacklist Monitoring", href: "/monitoring", desc: "Round-the-clock watch with email alerts" },
    ],
  },
]
