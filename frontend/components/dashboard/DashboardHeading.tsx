import Link from 'next/link';
import type { User } from '@/app/lib/types';
import { BTN_PRIMARY, EYEBROW } from '@/components/ui/styles';
import { PlusIcon } from './Icons';

interface DashboardHeadingProps {
  user: User | null;
  total: number;
  active: number;
  inReview: number;
}

export const DashboardHeading = ({ user, total, active, inReview }: DashboardHeadingProps) => (
  <>
    <div className="flex items-end justify-between mb-10 flex-wrap gap-5">
      <div className="min-w-0 flex flex-col gap-2">
        <p className={EYEBROW}>{user?.role === 'admin' ? 'Administrator' : 'My account'}</p>
        <h1 className="type-footer-heading text-ink break-words">
          {user?.display_name || 'Dashboard'}
        </h1>
        {user?.email && <p className="type-body text-muted break-all">{user.email}</p>}
      </div>
      <Link href="/memorial/new" className={BTN_PRIMARY}>
        <PlusIcon /> New memorial
      </Link>
    </div>

    {total > 0 && (
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-14">
        {[
          { label: 'Total', value: total },
          { label: 'Active', value: active },
          { label: 'In review', value: inReview },
        ].map(({ label, value }) => (
          <div key={label} className="bg-soft rounded-tile p-4 sm:p-6 flex flex-col gap-1">
            <span className="font-display font-medium text-[28px] sm:text-[36px] leading-none tracking-[-0.01em] text-ink tabular-nums">
              {value}
            </span>
            <span className="type-caption text-muted">{label}</span>
          </div>
        ))}
      </div>
    )}
  </>
);
