import type { Metadata } from 'next'
import { ToolPage } from '@/components/site/tool-page'
import { BlacklistTool } from '@/components/blacklist-tool'

export const metadata: Metadata = {
  title: 'Blacklist Check — Is Your Domain or IP Blacklisted? | Mailhound',
  description:
    'Free blacklist check across Spamhaus, SpamCop, Barracuda and more. See if your sending domain or IP is on a DNSBL — and set up alerts if it ever lands on one.',
  keywords: [
    'blacklist check',
    'is my IP blacklisted',
    'DNSBL lookup',
    'spamhaus check',
    'domain blacklist monitor',
  ],
  alternates: { canonical: '/blacklist' },
  openGraph: {
    title: 'Blacklist Check — Is your domain or IP on a blacklist?',
    description:
      'Scan your domain or IP across the major DNSBLs in seconds. Free, no account.',
    url: '/blacklist',
    type: 'website',
  },
}

export default function BlacklistPage() {
  return (
    <ToolPage
      current="/blacklist"
      title="Blacklist check"
      intro="The hound runs your domain or IP past every major blacklist — Spamhaus, SpamCop, Barracuda and the rest — and reports back which watchers have your name on file."
      fieldNote={{
        body: 'A single blacklisting can quietly kill your delivery rate for weeks before you notice. These DNSBLs are what inbox providers consult to decide whether your mail is trustworthy — so a clean board is table stakes for landing in the inbox.',
        ctaHref: '/monitoring',
        ctaLabel: 'Watch a domain around the clock',
      }}
    >
      <BlacklistTool />
    </ToolPage>
  )
}
