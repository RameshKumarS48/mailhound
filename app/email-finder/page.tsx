import type { Metadata } from 'next'
import { ToolPage } from '@/components/site/tool-page'
import { EmailFinderTool } from '@/components/email-finder-tool'

export const metadata: Metadata = {
  title: 'Email Finder — Find Anyone’s Work Email Address | Mailhound',
  description:
    'Find someone’s email address from their name and company domain. Mailhound generates the most likely pattern and verifies the mailbox by SMTP. Free to try.',
  keywords: [
    'email finder',
    'find someone’s email address',
    'find work email',
    'email lookup by name',
    'company email format',
  ],
  alternates: { canonical: '/email-finder' },
  openGraph: {
    title: 'Email Finder — Track down anyone’s work email',
    description:
      'Name + company domain in, the deliverable address out. Pattern engine plus live SMTP verification.',
    url: '/email-finder',
    type: 'website',
  },
}

export default function EmailFinderPage() {
  return (
    <ToolPage
      current="/email-finder"
      title="Email finder"
      intro="Give the hound a name and a company. It works through the address patterns real companies use, then knocks on the mail server to see which one is actually home."
      fieldNote={{
        body: (
          <>
            Most companies use one predictable format —{' '}
            <span className="font-mono text-ink">first.last@</span>,{' '}
            <span className="font-mono text-ink">flast@</span>, or{' '}
            <span className="font-mono text-ink">first@</span>. This tool ranks the
            likeliest formats; a verified search then probes the mail server so you
            send to a live mailbox, not a bounce.
          </>
        ),
        ctaHref: '/signup',
        ctaLabel: 'Run verified searches',
      }}
    >
      <EmailFinderTool />
    </ToolPage>
  )
}
