import type { MemorialPageListItem, PageState } from '@/app/lib/types';
import { MemorialCard } from './MemorialCard';

const GROUPS: { state: PageState; label: string; dot: string }[] = [
  { state: 'active',     label: 'Active',    dot: 'bg-sage' },
  { state: 'moderation', label: 'In review', dot: 'bg-amber-deep' },
  { state: 'draft',      label: 'Drafts',    dot: 'bg-ink/30' },
];

interface MemorialGroupsProps {
  memorials: MemorialPageListItem[];
  currentUserId?: string;
  isAdmin: boolean;
  busySlug: string | null;
  onSubmit: (slug: string) => void;
  onChoosePlan: (page: MemorialPageListItem) => void;
  onAccess: (slug: string) => void;
  onChanged: () => void;
}

export const MemorialGroups = ({
  memorials, currentUserId, isAdmin, busySlug, onSubmit, onChoosePlan, onAccess, onChanged,
}: MemorialGroupsProps) => (
  <div className="flex flex-col gap-14">
    {GROUPS.map(({ state, label, dot }) => {
      const items = memorials.filter((m) => m.state === state);
      if (items.length === 0) return null;
      return (
        <section key={state}>
          <div className="flex items-center gap-2.5 mb-5">
            <span aria-hidden="true" className={`w-2 h-2 rounded-full ${dot}`} />
            <h2 className="type-section-heading text-ink">{label}</h2>
            <span className="type-caption text-muted tabular-nums">{items.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {items.map((p) => (
              <MemorialCard
                key={p.id}
                page={p}
                showOwner={isAdmin}
                isOwner={p.owner.id === currentUserId}
                isAdmin={isAdmin}
                busy={busySlug === p.slug}
                onSubmit={onSubmit}
                onChoosePlan={onChoosePlan}
                onAccess={onAccess}
                onChanged={onChanged}
              />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);
