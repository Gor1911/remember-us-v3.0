import Link from 'next/link';
import { CheckIcon } from '@/components/dashboard/Icons';

interface SuccessScreenProps {
  name: string;
  photoCount: number;
  submitted: boolean;
  warning: string;
}

export const SuccessScreen = ({ name, photoCount, submitted, warning }: SuccessScreenProps) => (
  <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614] flex items-center justify-center p-4">
    <div className="glass rounded-[32px] p-10 max-w-md w-full flex flex-col items-center gap-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/30 flex items-center justify-center text-[#8B0000]">
        <CheckIcon className="w-6 h-6" />
      </div>
      <span className="uppercase text-[#6B6560] text-[11px] tracking-[0.12em] font-medium">
        {submitted ? 'Awaiting review' : 'Memorial saved as draft'}
      </span>
      <h1 className="text-[#1A1614] font-bold text-2xl tracking-tight">{name}</h1>
      {photoCount > 0 && (
        <p className="text-[#6B6560] text-sm">{photoCount} photo{photoCount > 1 ? 's' : ''} uploaded</p>
      )}
      <p className="text-[#6B6560] text-sm leading-relaxed">
        {submitted
          ? 'Your memorial is awaiting review. It will go live once an administrator approves it.'
          : 'Your memorial was created but could not be submitted for review yet. You can submit it from your dashboard.'}
      </p>
      {warning && <p role="alert" className="text-[#8B0000] text-sm">{warning}</p>}
      <div className="w-full flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="block w-full py-3.5 bg-[#8B0000] hover:bg-[#A00000] text-white font-medium text-sm rounded-[14px] transition-colors text-center no-underline"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="block w-full py-3.5 bg-white border border-[#1A1614]/10 text-[#1A1614] hover:bg-[#F3F0EB] font-medium text-sm rounded-[14px] transition-colors text-center no-underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  </div>
);
