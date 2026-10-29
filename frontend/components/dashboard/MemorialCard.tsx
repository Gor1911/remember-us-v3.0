import Link from 'next/link';
import type { MemorialPageListItem } from '@/app/lib/types';
import { StatePill } from './StatePill';
import { TypeIcon } from './Icons';
import { ExportArchiveButton } from './ExportArchiveButton';
import { AdminCardTools } from './AdminCardTools';
import { PORTRAIT_STATUS_LABEL } from './portraitStatus';

const year = (iso: string | null) => (iso ? new Date(iso).getFullYear().toString() : '—');

interface MemorialCardProps {
  page: MemorialPageListItem;
  /** Show the owner's name (admin view). */
  showOwner?: boolean;
  /** Current user owns this page. */
  isOwner?: boolean;
  /** Current user is an admin (exempt from payment, sees admin tools). */
  isAdmin?: boolean;
  busy?: boolean;
  onSubmit?: (slug: string) => void;
  onChoosePlan?: (page: MemorialPageListItem) => void;
  onAccess?: (slug: string) => void;
  /** Refresh the list after an admin action. */
  onChanged?: () => void;
}

const btn =
  'flex-1 min-w-[7.5rem] px-2 flex items-center justify-center py-2.5 text-center text-xs font-medium rounded-[12px] transition-colors no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]';
const outline = `${btn} text-[#1A1614] bg-transparent border border-[#1A1614]/20 hover:bg-[#F3F0EB]`;
const primary = `${btn} bg-[#8B0000] text-white hover:bg-[#A00000] disabled:opacity-50`;

export const MemorialCard = ({
  page, showOwner, isOwner, isAdmin, busy, onSubmit, onChoosePlan, onAccess, onChanged,
}: MemorialCardProps) => {
  const isDraft = page.state === 'draft';
  const paid = !!page.is_paid;
  const premium = page.package_type === 'premium';
  const portrait = page.portrait_animation_status ?? 'none';

  return (
    <div className="memorial-card glass rounded-[24px] p-6 flex flex-col gap-4 hover:bg-white/90 transition-colors duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-widest font-medium mb-1">
            <TypeIcon type={page.page_type} className="w-3.5 h-3.5" />
            {page.page_type === 'military' ? 'Military' : 'Civilian'}
          </span>
          <h3 className="text-[#1A1614] font-semibold text-base leading-tight break-words">
            {page.first_name} {page.last_name}
          </h3>
          <p className="text-[#6B6560] text-xs font-mono">
            {year(page.birth_date)} — {year(page.death_date)}
          </p>
          {showOwner && (
            <p className="text-muted text-xs mt-1 truncate">Owner: {page.owner.display_name || page.owner.email || 'Unknown'}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatePill state={page.state} />
          {page.package_type && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-[#1A1614]/10 bg-white text-[#1A1614]">
              {page.package_type === 'premium' ? 'Premium' : 'Standard'}
            </span>
          )}
        </div>
      </div>

      {premium && portrait !== 'none' && (
        <p className="text-xs text-[#1A1614]">
          Living Portrait: <span className="text-[#6B6560]">{PORTRAIT_STATUS_LABEL[portrait]}</span>
        </p>
      )}

      {page.hidden && (
        <div className="rounded-[12px] bg-[#8B0000]/[0.06] border border-[#8B0000]/15 px-3 py-2">
          <p className="text-xs text-[#8B0000] font-medium">
            Hidden by administrator{page.hidden_reason ? `: ${page.hidden_reason}` : ''}
          </p>
        </div>
      )}

      {isDraft && page.moderation_note && (
        <div className="rounded-[12px] bg-[#8B0000]/[0.06] border border-[#8B0000]/15 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-[#8B0000] font-medium mb-0.5">Changes requested</p>
          <p className="text-xs text-[#1A1614] leading-relaxed">{page.moderation_note}</p>
        </div>
      )}

      <div className="h-px bg-[#1A1614]/[0.08]" />

      {page.slug && (
        <p className="text-xs truncate">
          <span className="text-muted">remember.us/</span>
          <span className="text-[#6B6560] font-mono">{page.slug}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-1">
        {page.slug ? (
          <Link href={`/${page.slug}`} className={`${btn} text-[#1A1614] bg-white border border-[#1A1614]/10 hover:bg-[#F3F0EB]`}>
            View
          </Link>
        ) : (
          <span aria-disabled="true" className={`${btn} text-muted bg-[#1A1614]/[0.04] cursor-not-allowed`}>Unavailable</span>
        )}

        {isDraft && isOwner && page.slug && !isAdmin && !paid && onChoosePlan && (
          <button type="button" onClick={() => onChoosePlan(page)} className={primary}>Choose plan &amp; submit</button>
        )}
        {isDraft && isOwner && page.slug && (isAdmin || paid) && onSubmit && (
          <button type="button" disabled={busy} onClick={() => onSubmit(page.slug)} className={primary}>
            {busy ? 'Submitting…' : paid && !isAdmin ? 'Resubmit for review' : 'Submit for review'}
          </button>
        )}

        {(isOwner || isAdmin) && (
          <button
            type="button"
            disabled={!page.slug}
            onClick={() => onAccess?.(page.slug)}
            className={`${outline} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Link &amp; QR code
          </button>
        )}
        {page.slug && <ExportArchiveButton slug={page.slug} className={btn} />}
      </div>

      {isAdmin && page.slug && onChanged && <AdminCardTools page={page} onChanged={onChanged} />}
    </div>
  );
};
