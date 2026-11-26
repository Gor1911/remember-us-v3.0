import Link from 'next/link';
import { CheckIcon } from '@/components/ui/icons';
import { BTN_PRIMARY, BTN_SECONDARY, NOTICE_WARN, PAGE } from '@/components/ui/styles';

interface SuccessScreenProps {
  name: string;
  portraitPreview: string | null;
  photoCount: number;
  submitted: boolean;
  warning: string;
}

export const SuccessScreen = ({ name, portraitPreview, photoCount, submitted, warning }: SuccessScreenProps) => (
  <div className={`${PAGE} flex items-center justify-center`}>
    <div className="w-[min(100%-32px,560px)] mx-auto flex flex-col items-center gap-6 text-center">
      {portraitPreview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portraitPreview} alt={name} className="w-28 aspect-[4/5] rounded-tile object-cover bg-soft" />
          <span className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-canvas flex items-center justify-center">
            <span className="w-8 h-8 rounded-full bg-sage/10 text-sage flex items-center justify-center">
              <CheckIcon className="w-6 h-6" />
            </span>
          </span>
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-sage/10 text-sage flex items-center justify-center">
          <CheckIcon className="w-8 h-8" />
        </div>
      )}
      <span
        className={`rounded-full px-3 py-1 type-caption font-medium ${
          submitted ? 'bg-amber-deep/10 text-amber-deep' : 'bg-ink/[0.06] text-muted'
        }`}
      >
        {submitted ? 'Awaiting review' : 'Memorial saved as draft'}
      </span>
      <h1 className="type-heading text-ink text-balance break-words max-w-full">{name}</h1>
      {photoCount > 0 && (
        <p className="type-caption text-muted">{photoCount} gallery photo{photoCount > 1 ? 's' : ''} uploaded</p>
      )}
      <p className="type-body text-muted">
        {submitted
          ? 'Your memorial is awaiting review. It will go live once an administrator approves it.'
          : 'Your memorial was created but could not be submitted for review yet. You can submit it from your dashboard.'}
      </p>
      {warning && <p role="alert" className={`${NOTICE_WARN} w-full`}>{warning}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
        <Link href="/dashboard" className={BTN_PRIMARY}>Go to dashboard</Link>
        <Link href="/" className={BTN_SECONDARY}>Back to home</Link>
      </div>
    </div>
  </div>
);
