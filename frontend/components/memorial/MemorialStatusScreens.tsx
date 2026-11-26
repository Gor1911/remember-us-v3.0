import Link from 'next/link';
import { BookIcon, ClockIcon, LockIcon } from '@/components/ui/icons';
import { CARD, LINK } from '@/components/ui/styles';

interface ModerationScreenProps {
  state: string;
}

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

/** Calm centred card on canvas, shared by the draft / in-review / not-found screens. */
const StatusCard = ({ icon, title, children }: StatusCardProps) => (
  <main id="main" className="min-h-screen bg-canvas text-ink flex items-center justify-center px-4 py-24">
    <div className={`${CARD} md:p-10 w-full max-w-[480px] text-center flex flex-col items-center`}>
      <span className="grid place-items-center w-14 h-14 rounded-full bg-soft mb-6" aria-hidden="true">{icon}</span>
      <h1 className="type-card-heading text-balance">{title}</h1>
      <div className="type-body text-muted mt-3 max-w-[360px] text-pretty flex flex-col gap-3">{children}</div>
      <Link href="/" className={`type-caption mt-8 ${LINK}`}>What is Remember US?</Link>
    </div>
  </main>
);

export const ModerationScreen = ({ state }: ModerationScreenProps) =>
  state === 'draft' ? (
    <StatusCard icon={<BookIcon className="w-7 h-7 text-bronze" />} title="This memorial isn’t shared yet">
      <p>The family is still preparing it. It will open here once they have sent it for review and it has been approved.</p>
    </StatusCard>
  ) : (
    <StatusCard icon={<ClockIcon className="w-7 h-7 text-bronze" />} title="This memorial is being reviewed">
      <p>Every memorial is checked by our team before it is shared. It will open here once it has been approved.</p>
    </StatusCard>
  );

export const NotFoundScreen = () => (
  <StatusCard icon={<LockIcon className="w-7 h-7 text-bronze" />} title="We can’t open this memorial">
    <p>The link may be incomplete, or the family may have replaced it with a new one.</p>
    <p>Try scanning the QR code again, or ask the family for the current link.</p>
  </StatusCard>
);

export const LoadingScreen = () => (
  <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4" role="status">
    <span className="w-2 h-2 rounded-full bg-bronze animate-pulse motion-reduce:animate-none" aria-hidden="true" />
    <span className="type-caption text-muted">Opening the memorial…</span>
  </div>
);
