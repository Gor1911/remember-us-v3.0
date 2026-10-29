import type { PageState } from '@/app/lib/types';

const STATE_LABEL: Record<PageState, string> = {
  draft:      'Draft',
  moderation: 'In Review',
  active:     'Active',
};

const STATE_STYLE: Record<PageState, string> = {
  draft:      'bg-[#1A1614]/[0.05] text-[#6B6560] border-[#1A1614]/10',
  moderation: 'bg-[#B7791F]/10 text-[#8A5A12] border-[#B7791F]/25',
  active:     'bg-[#2F6B4F]/10 text-[#2F6B4F] border-[#2F6B4F]/25',
};

interface StatePillProps {
  state: PageState;
}

export const StatePill = ({ state }: StatePillProps) => (
  <span className={`shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full border ${STATE_STYLE[state]}`}>
    {STATE_LABEL[state]}
  </span>
);
