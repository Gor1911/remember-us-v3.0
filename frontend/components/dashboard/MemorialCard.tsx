import Image from 'next/image';
import Link from 'next/link';
import { SITE_HOST, canOptimizeImage } from '@/app/lib/config';
import type { MemorialPageListItem } from '@/app/lib/types';
import { QrIcon } from '@/components/ui/icons';
import { BTN_SM, BTN_SM_DARK, BTN_SM_SOFT, CARD } from '@/components/ui/styles';
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

const TAG = 'inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-0.5 type-utility font-medium text-ink';

export const MemorialCard = ({
  page, showOwner, isOwner, isAdmin, busy, onSubmit, onChoosePlan, onAccess, onChanged,
}: MemorialCardProps) => {
  const isDraft = page.state === 'draft';
  const paid = !!page.is_paid;
  const premium = page.package_type === 'premium';
  const portrait = page.portrait_animation_status ?? 'none';
  /** Guests still see the approved version while newer changes wait. */
  const liveWithChanges = page.state !== 'active' && !!page.has_published_version;
  const canEdit = (isOwner || isAdmin) && !!page.slug;

  return (
    <div className={`memorial-card ${CARD} flex flex-col gap-4`}>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0 w-16 h-16 rounded-[14px] overflow-hidden bg-soft flex items-center justify-center text-bronze">
          {page.primary_portrait ? (
            <Image src={page.primary_portrait} alt="" fill unoptimized={!canOptimizeImage(page.primary_portrait)} sizes="64px" className="object-cover object-center" />
          ) : (
            <TypeIcon type={page.page_type} className="w-7 h-7" />
          )}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <h3 className="type-panel-heading text-ink break-words">
            {page.first_name} {page.last_name}
          </h3>
          <p className="type-caption text-muted tabular-nums">
            {year(page.birth_date)} — {year(page.death_date)}
          </p>
          {showOwner && (
            <p className="type-caption text-muted truncate">Owner: {page.owner.display_name || page.owner.email || 'Unknown'}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {liveWithChanges ? (
          <>
            <StatePill state="active" />
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 type-utility font-medium bg-amber-deep/10 text-amber-deep">
              {page.state === 'moderation' ? 'Changes in review' : 'Changes not sent yet'}
            </span>
          </>
        ) : (
          <StatePill state={page.state} />
        )}
        <span className={TAG}>
          <TypeIcon type={page.page_type} className="w-3.5 h-3.5 text-bronze" />
          {page.page_type === 'military' ? 'Military' : 'Civilian'}
        </span>
        {page.package_type && <span className={TAG}>{premium ? 'Premium' : 'Standard'}</span>}
      </div>

      {premium && portrait !== 'none' && (
        <p className="type-caption text-ink">
          Living Portrait: <span className="text-muted">{PORTRAIT_STATUS_LABEL[portrait]}</span>
        </p>
      )}

      {page.hidden && (
        <p className="rounded-[14px] bg-danger/[0.08] px-3.5 py-2.5 type-caption font-medium text-danger">
          Hidden by administrator{page.hidden_reason ? `: ${page.hidden_reason}` : ''}
        </p>
      )}

      {isDraft && page.moderation_note && (
        <div className="rounded-[14px] bg-amber-deep/10 px-3.5 py-2.5">
          <p className="type-caption font-medium text-amber-deep">Changes requested</p>
          <p className="type-caption text-ink">{page.moderation_note}</p>
        </div>
      )}

      {page.slug && (
        <p className="type-caption truncate border-t border-ink/10 pt-4">
          <span className="text-muted">{SITE_HOST}/</span>
          <span className="text-ink font-mono text-[13px]">{page.slug}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {page.slug ? (
          <Link href={`/${page.slug}`} className={`${BTN_SM_SOFT} no-underline`}>View</Link>
        ) : (
          <span aria-disabled="true" className={`${BTN_SM} bg-ink/[0.04] text-muted cursor-not-allowed`}>Unavailable</span>
        )}
        {canEdit && (
          <Link href={`/memorial/${page.slug}/edit`} className={`${BTN_SM_SOFT} no-underline`}>Edit</Link>
        )}

        {isDraft && isOwner && page.slug && !isAdmin && !paid && onChoosePlan && (
          <button type="button" onClick={() => onChoosePlan(page)} className={BTN_SM_DARK}>Choose plan &amp; submit</button>
        )}
        {isDraft && isOwner && page.slug && (isAdmin || paid) && onSubmit && (
          <button type="button" disabled={busy} onClick={() => onSubmit(page.slug)} className={BTN_SM_DARK}>
            {busy ? 'Submitting…' : paid && !isAdmin ? 'Resubmit for review' : 'Submit for review'}
          </button>
        )}

        {(isOwner || isAdmin) && (
          <button type="button" disabled={!page.slug} onClick={() => onAccess?.(page.slug)} className={BTN_SM_SOFT}>
            <QrIcon className="w-4 h-4" /> Link &amp; QR code
          </button>
        )}
        {page.slug && <ExportArchiveButton slug={page.slug} />}
      </div>

      {isAdmin && page.slug && onChanged && <AdminCardTools page={page} onChanged={onChanged} />}
    </div>
  );
};
