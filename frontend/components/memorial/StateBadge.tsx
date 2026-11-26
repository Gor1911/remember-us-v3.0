import type { PageState } from '@/app/lib/types';

interface StateBadgeProps {
  state: PageState;
}

// Owner / admin only (see app/[hash]/page.tsx) — never rendered for guests.
const STATE_STYLES: Record<PageState, string> = {
  draft:      'text-muted',
  moderation: 'text-amber-deep',
  active:     'text-sage',
};

const STATE_LABELS: Record<PageState, string> = {
  draft:      'Draft',
  moderation: 'In review',
  active:     'Published',
};

export const StateBadge = ({ state }: StateBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white type-caption font-medium shadow-badge ${STATE_STYLES[state]}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {STATE_LABELS[state]}
  </span>
);
