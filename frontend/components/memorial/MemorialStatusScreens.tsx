import Link from 'next/link';

interface ModerationScreenProps {
  state: string;
}

const BACK_LINK =
  'px-6 py-2.5 text-[#6B6560] hover:text-[#1A1614] text-sm transition-colors border border-[#1A1614]/10 bg-white rounded-[12px] hover:border-[#1A1614]/20 no-underline';

export const ModerationScreen = ({ state }: ModerationScreenProps) => {
  const isDraft = state === 'draft';
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
        <span className="text-muted text-xs uppercase tracking-[0.15em]">
          {isDraft ? 'Draft' : 'Under Review'}
        </span>
      </div>
      <div className="w-14 h-14 rounded-full bg-white border border-[#1A1614]/[0.08] flex items-center justify-center mb-6">
        {isDraft ? (
          <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-[#8B0000]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h1 className="text-[#1A1614] text-2xl font-semibold tracking-tight mb-3">
        {isDraft ? 'Memorial is a Draft' : 'Awaiting Moderation'}
      </h1>
      <p className="text-[#6B6560] text-sm max-w-sm leading-relaxed mb-10">
        {isDraft
          ? 'This memorial has not been submitted for review yet. Submit it from your account to begin the approval process.'
          : 'This memorial has been submitted and is currently being reviewed by our team. It will become visible after approval, usually within 24 hours.'}
      </p>
      <Link href="/" className={BACK_LINK}>← Back to Home</Link>
    </div>
  );
};

export const NotFoundScreen = () => (
  <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 text-center">
    <div className="flex items-center gap-2 mb-8">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
      <span className="text-muted text-xs uppercase tracking-[0.15em]">Access Denied</span>
    </div>
    <h1 className="text-[#1A1614] text-2xl font-semibold tracking-tight mb-3">Memorial Not Found</h1>
    <p className="text-[#6B6560] text-sm max-w-sm leading-relaxed mb-10">
      This memorial is private or does not exist.
      Access requires a personal QR code. If you received a link, please check it and try again.
    </p>
    <Link href="/" className={BACK_LINK}>← Back to Home</Link>
  </div>
);

export const LoadingScreen = () => (
  <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
    <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
  </div>
);
