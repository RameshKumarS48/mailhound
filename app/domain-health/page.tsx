import type { Metadata } from 'next'
import { ToolPage } from '@/components/site/tool-page'
import { DomainHealthTool } from '@/components/domain-health-tool'

export const metadata: Metadata = {
  title: 'Domain Health Check — SPF, DKIM, DMARC & Deliverability Test | Mailhound',
  description:
    'Free email deliverability test. Grade any domain on SPF, DKIM, DMARC, MX, reverse DNS, TLS, open-relay and blacklist status in seconds. No account needed.',
  keywords: [
    'SPF DKIM DMARC checker',
    'email deliverability test',
    'domain health check',
    'email server test',
    'DMARC record checker',
  ],
  alternates: { canonical: '/domain-health' },
  openGraph: {
    title: 'Domain Health Check — Is your email set up to land in the inbox?',
    description:
      'Grade any domain on SPF, DKIM, DMARC, MX, PTR, TLS, open-relay and blacklists. Free, no account.',
    url: '/domain-health',
    type: 'website',
  },
}

export default function DomainHealthPage() {
  return (
    <ToolPage
      current="/domain-health"
      title="Domain health check"
      intro="One inspection, one grade. The hound sniffs a domain’s SPF, DKIM, DMARC, MX, reverse DNS, encryption, relay posture and blacklist record — then tells you whether your mail is built to reach the inbox."
      fieldNote={{
        body: 'SPF, DKIM and DMARC are the three signatures inbox providers check before they trust your mail. Miss one and your messages get filed under spam — or bounced outright. This report grades all eight signals at once, so you know exactly what to fix first.',
        ctaHref: '/signup',
        ctaLabel: 'Get the full report with fix-it steps',
      }}
    >
      <DomainHealthTool />
    </ToolPage>
  )
}
