import Link from 'next/link';
import type { User } from '@/app/lib/types';
import { PlusIcon } from './Icons';

interface DashboardHeadingProps {
  user: User | null;
  total: number;
  active: number;
  inReview: number;
}

export const DashboardHeading = ({ user, total, active, inReview }: DashboardHeadingProps) => (
  <>
    <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="text-[#6B6560] text-[11px] uppercase tracking-[0.12em] font-medium">
            {user?.role === 'admin' ? 'Administrator' : 'My Account'}
          </span>
        </div>
        <h1 className="text-[#1A1614] font-bold text-3xl tracking-tight">
          {user?.display_name || 'Dashboard'}
        </h1>
        {user?.email && <p className="text-[#6B6560] text-sm mt-1">{user.email}</p>}
      </div>
      <Link
        href="/memorial/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[14px] transition-colors no-underline"
      >
        <PlusIcon /> New Memorial
      </Link>
    </div>

    {total > 0 && (
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        {[
          { label: 'Total', value: total },
          { label: 'Active', value: active },
          { label: 'In Review', value: inReview },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-[20px] p-4 sm:p-5 flex flex-col gap-1">
            <span className="text-[#1A1614] font-bold text-2xl">{value}</span>
            <span className="text-[#6B6560] text-xs uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    )}
  </>
);
