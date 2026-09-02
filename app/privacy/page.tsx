import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy — Mailhound',
  description: 'How Mailhound handles your account data, the email lists you verify, and payment information.',
}

const SECTIONS: LegalSection[] = [
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    body: (
      <>
        <p>
          We collect the email address and password you use to create an account, the
          email addresses you submit for verification, and basic usage records (credits
          spent, timestamps, API-key activity) needed to run and bill the service.
        </p>
        <p>
          We do not ask for or store payment card numbers. Checkout is handled entirely by
          our payment processor.
        </p>
      </>
    ),
  },
  {
    id: 'lists-you-verify',
    heading: 'The lists you verify',
    body: (
      <>
        <p>
          When you submit an address, we run it through our verification engine and return
          the result. We do not sell, rent, seed, or market to the addresses you upload,
          and we do not add them to any list of our own.
        </p>
        <p>
          Verification results are retained in your account so you can review past checks
          and so we can maintain an accurate credit ledger. You can request deletion of
          your verification history at any time.
        </p>
      </>
    ),
  },
  {
    id: 'how-verification-works',
    heading: 'How verification works',
    body: (
      <p>
        To confirm a mailbox exists, our engine performs a live SMTP handshake with the
        recipient’s mail server — it opens a connection and asks whether the address would
        be accepted. We never send an actual message to the address during verification.
      </p>
    ),
  },
  {
    id: 'processors',
    heading: 'Service providers',
    body: (
      <>
        <p>We rely on a small set of processors to operate Mailhound:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Supabase</strong> — authentication and database hosting for account and usage data.</li>
          <li><strong>Dodo Payments</strong> — checkout and card processing. Card details are handled by Dodo and never reach our servers.</li>
          <li><strong>Vercel</strong> — application hosting and delivery.</li>
        </ul>
        <p>
          Each processor handles only the data required for its role and is bound by its
          own data-protection terms.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    heading: 'Security',
    body: (
      <p>
        Traffic to and from Mailhound is encrypted in transit over TLS. API keys are
        stored hashed — the full secret is shown once at creation and cannot be retrieved
        again afterward. No system is perfectly secure, but we work to limit the data we
        hold and protect what we do.
      </p>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your rights',
    body: (
      <p>
        You can access, export, or delete your account data by emailing us. We will
        respond within a reasonable period. Deleting your account removes your stored
        verification history and account details, subject to any records we are required
        to keep for billing or legal reasons.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this policy as the product evolves. When we make a material change,
        we will update the date above and, where appropriate, notify you by email.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      intro={
        <>
          This policy explains what data Mailhound collects, how we use it, and the
          choices you have. It’s written to be read, not to hide behind. This is a working
          draft and will be reviewed by legal counsel before it governs a paid account.
        </>
      }
      sections={SECTIONS}
    />
  )
}
