import type { PageState } from '@/app/lib/types';

interface StateBadgeProps {
  state: PageState;
}

const STATE_STYLES: Record<PageState, string> = {
  draft:      'bg-[#1A1614]/[0.06] text-[#6B6560] border-[#1A1614]/10',
  moderation: 'bg-amber-100 text-amber-800 border-amber-300/60',
  active:     'bg-emerald-50 text-emerald-800 border-emerald-300/60',
};

const STATE_LABELS: Record<PageState, string> = {
  draft:      'Draft',
  moderation: 'Under Review',
  active:     'Active',
};

export const StateBadge = ({ state }: StateBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium shadow-sm ${STATE_STYLES[state]}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {STATE_LABELS[state]}
  </span>
);
