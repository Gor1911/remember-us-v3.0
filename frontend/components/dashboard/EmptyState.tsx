import Link from 'next/link';
import { PersonIcon } from '@/components/ui/icons';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/styles';
import { PlusIcon } from './Icons';

/** First visit to the dashboard: what starting involves, and that nothing is shared yet. */
export const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 md:py-24 gap-6 text-center">
    <div className="w-16 h-16 rounded-full bg-soft flex items-center justify-center text-bronze" aria-hidden="true">
      <PersonIcon className="w-8 h-8" />
    </div>
    <div className="flex flex-col gap-2 max-w-[460px]">
      <h2 className="type-card-heading text-ink">When you’re ready, begin with their name</h2>
      <p className="type-body text-muted text-pretty">
        A name, a few sentences and a photo are enough to start. Your draft is kept here, so you can come back
        to it — nothing is shared until it has been reviewed.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href="/memorial/new" className={BTN_PRIMARY}>
        <PlusIcon /> Start a memorial
      </Link>
      <Link href="/example" className={BTN_SECONDARY}>See an example</Link>
    </div>
  </div>
);
