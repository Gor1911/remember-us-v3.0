import Link from 'next/link';
import { CheckIcon, ClockIcon } from '@/components/ui/icons';
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from '@/components/ui/styles';
import type { PollState } from './usePaymentPolling';

interface MessageProps {
  title: string;
  body?: string;
}

const Message = ({ title, body }: MessageProps) => (
  <>
    <h1 className="type-heading text-ink text-balance">{title}</h1>
    {body && <p className="type-body text-muted max-w-md">{body}</p>}
  </>
);

interface BadgeProps {
  tone: 'sage' | 'bronze';
  children: React.ReactNode;
}

/** Round icon badge above the heading. */
const Badge = ({ tone, children }: BadgeProps) => (
  <span
    aria-hidden="true"
    className={`w-16 h-16 rounded-full flex items-center justify-center ${
      tone === 'sage' ? 'bg-sage/10 text-sage' : 'bg-soft text-bronze'
    }`}
  >
    {children}
  </span>
);

interface SuccessViewProps {
  state: PollState;
}

export const SuccessView = ({ state }: SuccessViewProps) => {
  if (state.kind === 'checking') {
    return (
      <>
        <span className="w-8 h-8 border-2 border-ink/15 border-t-bronze rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <Message title="Confirming your payment…" body="Please keep this page open. This usually takes a few seconds." />
      </>
    );
  }

  if (state.kind === 'paid') {
    const { session } = state;
    const name = `${session.page.first_name} ${session.page.last_name}`.trim();
    return (
      <>
        <Badge tone="sage"><CheckIcon className="w-8 h-8" /></Badge>
        <Message
          title={name ? `${name}’s memorial is on its way` : 'Your memorial is on its way'}
          body="Payment received. Our team reads every memorial before it is shared — usually within 24 hours."
        />
        {session.package === 'premium' && (
          <p className="type-body text-muted max-w-md">
            Your Living Portrait will be ready within 24 hours of approval, once a clear portrait photo is provided.
          </p>
        )}
        <section aria-labelledby="next-heading" className={`${CARD} text-left w-full`}>
          <h2 id="next-heading" className="type-panel-heading text-ink mb-3">What happens next</h2>
          <ol className="list-decimal pl-5 flex flex-col gap-2 type-body text-muted marker:text-bronze-deep">
            <li>We review your memorial.</li>
            <li>You receive the private link and QR code in your dashboard.</li>
            {session.package === 'premium' && (
              <li>Send a clear, front-facing portrait photo if you haven&apos;t already.</li>
            )}
          </ol>
        </section>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard" className={BTN_PRIMARY}>Go to my memorials</Link>
          <Link href={`/${session.page.slug}`} className={BTN_SECONDARY}>Read it once more</Link>
        </div>
      </>
    );
  }

  if (state.kind === 'failed') {
    const body = state.status === 'refunded'
      ? 'This payment was refunded.'
      : state.status === 'expired'
        ? 'The payment session expired before it was completed. You have not been charged.'
        : 'The payment did not go through. You have not been charged.';
    return (
      <>
        <Message title="Payment not completed" body={body} />
        <p className="type-body text-muted">Return to your dashboard to try again.</p>
        <Link href="/dashboard" className={BTN_PRIMARY}>Go to your dashboard</Link>
      </>
    );
  }

  if (state.kind === 'timeout') {
    return (
      <>
        <Badge tone="bronze"><ClockIcon className="w-8 h-8" /></Badge>
        <Message
          title="Still waiting"
          body="We haven't received confirmation yet. This can take a minute — refresh, or check your dashboard."
        />
        <Link href="/dashboard" className={BTN_PRIMARY}>Check your dashboard</Link>
      </>
    );
  }

  return (
    <>
      <Message title="We couldn't find this payment" body="Check your dashboard for the status of your memorial." />
      <Link href="/dashboard" className={BTN_PRIMARY}>Go to your dashboard</Link>
    </>
  );
};
