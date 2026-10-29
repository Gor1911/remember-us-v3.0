import Link from 'next/link';
import type { PollState } from './usePaymentPolling';

const LINK_BTN =
  'inline-flex px-6 py-3 rounded-[14px] text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]';
const PRIMARY = `${LINK_BTN} bg-[#8B0000] text-white hover:bg-[#A00000]`;

interface MessageProps {
  title: string;
  body?: string;
}

const Message = ({ title, body }: MessageProps) => (
  <>
    <h1 className="text-[#1A1614] font-bold text-3xl tracking-tight">{title}</h1>
    {body && <p className="text-muted text-base leading-relaxed max-w-md">{body}</p>}
  </>
);

interface SuccessViewProps {
  state: PollState;
}

export const SuccessView = ({ state }: SuccessViewProps) => {
  if (state.kind === 'checking') {
    return (
      <>
        <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-pulse motion-reduce:animate-none" aria-hidden="true" />
        <Message title="Confirming your payment…" body="Please keep this page open. This usually takes a few seconds." />
      </>
    );
  }

  if (state.kind === 'paid') {
    const { session } = state;
    const name = `${session.page.first_name} ${session.page.last_name}`.trim();
    return (
      <>
        <Message
          title="Payment confirmed"
          body={`Your memorial for ${name} is now with our team for review — usually within 24 hours.`}
        />
        {session.package === 'premium' && (
          <p className="text-muted text-base leading-relaxed max-w-md">
            Your Living Portrait will be ready within 24 hours of approval, once a clear portrait photo is provided.
          </p>
        )}
        <section aria-labelledby="next-heading" className="glass rounded-[32px] p-6 text-left w-full max-w-md">
          <h2 id="next-heading" className="text-[#1A1614] font-semibold text-lg mb-3">What happens next</h2>
          <ol className="list-decimal pl-5 flex flex-col gap-2 text-muted text-[15px] leading-relaxed">
            <li>We review your memorial.</li>
            <li>You receive the private link and QR code in your dashboard.</li>
            {session.package === 'premium' && (
              <li>Send a clear, front-facing portrait photo if you haven&apos;t already.</li>
            )}
          </ol>
        </section>
        <Link href="/dashboard" className={PRIMARY}>Go to your dashboard</Link>
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
        <p className="text-muted text-base">Return to your dashboard to try again.</p>
        <Link href="/dashboard" className={PRIMARY}>Go to your dashboard</Link>
      </>
    );
  }

  if (state.kind === 'timeout') {
    return (
      <>
        <Message
          title="Still waiting"
          body="We haven't received confirmation yet. This can take a minute — refresh, or check your dashboard."
        />
        <Link href="/dashboard" className={PRIMARY}>Check your dashboard</Link>
      </>
    );
  }

  return (
    <>
      <Message title="We couldn't find this payment" body="Check your dashboard for the status of your memorial." />
      <Link href="/dashboard" className={PRIMARY}>Go to your dashboard</Link>
    </>
  );
};
