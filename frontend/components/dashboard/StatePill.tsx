import type { PageState } from '@/app/lib/types';

const STATE_LABEL: Record<PageState, string> = {
  draft:      'Draft',
  moderation: 'In review',
  active:     'Published',
};

const STATE_STYLE: Record<PageState, string> = {
  draft:      'bg-ink/[0.06] text-muted',
  moderation: 'bg-amber-deep/10 text-amber-deep',
  active:     'bg-sage/10 text-sage',
};

interface StatePillProps {
  state: PageState;
}

export const StatePill = ({ state }: StatePillProps) => (
  <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 type-utility font-medium ${STATE_STYLE[state]}`}>
    {STATE_LABEL[state]}
  </span>
);
