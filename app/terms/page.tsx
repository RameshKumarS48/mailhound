import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal'

export const metadata: Metadata = {
  title: 'Terms of Service — Mailhound',
  description: 'The terms that govern your use of Mailhound’s email verification service.',
}

const SECTIONS: LegalSection[] = [
  {
    id: 'the-service',
    heading: 'The service',
    body: (
      <p>
        Mailhound verifies email addresses and reports on their deliverability through a
        web dashboard and an API. We provide the service on a pay-as-you-go basis using
        prepaid credits, plus an optional monthly monitoring subscription.
      </p>
    ),
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: (
      <>
        <p>You agree to use Mailhound only for lawful purposes. You will not:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Verify addresses you have no legitimate reason to contact.</li>
          <li>Use the service to support spam, harassment, or any deceptive campaign.</li>
          <li>Resell raw verification access in violation of these terms.</li>
          <li>Attempt to overwhelm, reverse-engineer, or circumvent rate limits or billing.</li>
        </ul>
        <p>
          You are responsible for having a lawful basis to process any address you submit,
          including under applicable anti-spam and data-protection laws.
        </p>
      </>
    ),
  },
  {
    id: 'credits-and-billing',
    heading: 'Credits and billing',
    body: (
      <>
        <p>
          Credits are purchased in packs and do not expire. One verification consumes one
          credit; other tools consume credits at the rates shown in the product. We charge
          only for results we can stand behind — for example, Email Finder charges only on
          a verified hit.
        </p>
        <p>
          Unused credit packs are refundable within 14 days of purchase. Credits already
          spent on verifications are non-refundable. Payments are processed by our payment
          provider, whose terms also apply to your purchase.
        </p>
      </>
    ),
  },
  {
    id: 'monitoring-subscription',
    heading: 'Monitoring subscription',
    body: (
      <p>
        The optional Watch plan is billed monthly and renews until cancelled. You can
        cancel at any time; cancellation stops future renewals and takes effect at the end
        of the current billing period. We do not pro-rate partial months.
      </p>
    ),
  },
  {
    id: 'accuracy',
    heading: 'Accuracy and no guarantee',
    body: (
      <p>
        Verification reflects what a mailbox’s mail server reports at the time of the
        check. Servers can be misconfigured, rate-limited, or deliberately ambiguous
        (catch-all domains), and status can change after we check. We report our best
        assessment with the reason attached, but we do not guarantee that any given
        address will or will not accept mail.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: 'Limitation of liability',
    body: (
      <p>
        The service is provided “as is.” To the extent permitted by law, Mailhound is not
        liable for indirect or consequential losses, and our total liability for any claim
        is limited to the amount you paid us in the three months before the claim arose.
      </p>
    ),
  },
  {
    id: 'termination',
    heading: 'Termination',
    body: (
      <p>
        You may stop using Mailhound and close your account at any time. We may suspend or
        terminate access for a breach of these terms, and where reasonable we will tell you
        why. Any credit balance remaining at termination for reasons other than a breach
        will be refunded.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these terms as the service changes. Material changes will be
        reflected in the date above and, where appropriate, communicated by email.
        Continued use after a change means you accept the updated terms.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 2026"
      intro={
        <>
          These terms govern your use of Mailhound. They’re written plainly on purpose.
          This is a working draft and will be reviewed by legal counsel before it governs a
          paid account.
        </>
      }
      sections={SECTIONS}
    />
  )
}
