import type { PageState } from '@/app/lib/types';

interface StateBadgeProps {
  state: PageState;
}

const STATE_STYLES: Record<PageState, string> = {
  draft:      'bg-white/10 text-white/60',
  moderation: 'bg-yellow-500/20 text-yellow-400',
  active:     'bg-green-500/20 text-green-400',
};

const STATE_LABELS: Record<PageState, string> = {
  draft:      'Draft',
  moderation: 'Under Review',
  active:     'Active',
};

export const StateBadge = ({ state }: StateBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATE_STYLES[state]}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {STATE_LABELS[state]}
  </span>
);
