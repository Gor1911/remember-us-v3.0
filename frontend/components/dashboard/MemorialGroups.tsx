import type { MemorialPageListItem, PageState } from '@/app/lib/types';
import { MemorialCard } from './MemorialCard';

const GROUPS: { state: PageState; label: string; dot: string }[] = [
  { state: 'active',     label: 'Active',    dot: 'bg-[#2F6B4F]' },
  { state: 'moderation', label: 'In Review', dot: 'bg-[#B7791F]' },
  { state: 'draft',      label: 'Drafts',    dot: 'bg-[#8A7F74]' },
];

interface MemorialGroupsProps {
  memorials: MemorialPageListItem[];
  currentUserId?: string;
  showOwner: boolean;
  busySlug: string | null;
  onSubmit: (slug: string) => void;
}

export const MemorialGroups = ({ memorials, currentUserId, showOwner, busySlug, onSubmit }: MemorialGroupsProps) => (
  <div className="flex flex-col gap-10">
    {GROUPS.map(({ state, label, dot }) => {
      const items = memorials.filter((m) => m.state === state);
      if (items.length === 0) return null;
      return (
        <section key={state}>
          <div className="flex items-center gap-2 mb-5">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <h2 className="text-[#6B6560] text-[11px] uppercase tracking-widest font-medium">{label}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <MemorialCard
                key={p.id}
                page={p}
                showOwner={showOwner}
                canSubmit={state === 'draft' && p.owner.id === currentUserId}
                busy={busySlug === p.slug}
                onSubmit={onSubmit}
              />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);
