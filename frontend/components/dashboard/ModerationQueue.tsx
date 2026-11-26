'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MemorialPageListItem } from '@/app/lib/types';
import { BTN_SM_DANGER, BTN_SM_DARK, BTN_SM_SOFT, FIELD, LABEL } from '@/components/ui/styles';
import { TypeIcon } from './Icons';

const QUEUE_ITEM = 'bg-white rounded-tile p-5';

interface ModerationQueueProps {
  items: MemorialPageListItem[];
  busySlug: string | null;
  onApprove: (slug: string) => void;
  onReject: (slug: string, note: string) => Promise<boolean>;
}

export const ModerationQueue = ({ items, busySlug, onApprove, onReject }: ModerationQueueProps) => {
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const confirmReject = async (slug: string) => {
    const ok = await onReject(slug, note.trim());
    if (ok) { setRejecting(null); setNote(''); }
  };

  return (
    <section className="mb-14" aria-labelledby="moderation-heading">
      <h2 id="moderation-heading" className="type-section-heading text-ink mb-4">
        Moderation queue <span className="text-muted tabular-nums">({items.length})</span>
      </h2>

      {items.length === 0 ? (
        <p className={`${QUEUE_ITEM} type-caption text-muted`}>Nothing is waiting for review.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((p) => {
            const busy = busySlug === p.slug;
            return (
              <li key={p.id} className={`${QUEUE_ITEM} flex flex-col gap-4`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-display font-medium text-[16px] text-ink">
                      <TypeIcon type={p.page_type} className="w-4 h-4 shrink-0 text-bronze" />
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="type-caption text-muted">by {p.owner.display_name || p.owner.email || 'Unknown'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.slug && (
                      <Link href={`/${p.slug}`} className={`${BTN_SM_SOFT} no-underline`}>
                        Preview
                      </Link>
                    )}
                    <button
                      type="button" disabled={busy} onClick={() => onApprove(p.slug)}
                      className={BTN_SM_DARK}
                    >
                      Approve
                    </button>
                    <button
                      type="button" disabled={busy}
                      onClick={() => { setRejecting(rejecting === p.slug ? null : p.slug); setNote(''); }}
                      className={BTN_SM_DANGER}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {rejecting === p.slug && (
                  <div className="flex flex-col gap-2 border-t border-ink/10 pt-4">
                    <label htmlFor={`note-${p.id}`} className={LABEL}>
                      Note to owner
                    </label>
                    <textarea
                      id={`note-${p.id}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Explain what needs to change…"
                      className={`${FIELD} resize-none`}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button" onClick={() => setRejecting(null)}
                        className={BTN_SM_SOFT}
                      >
                        Cancel
                      </button>
                      <button
                        type="button" disabled={busy} onClick={() => confirmReject(p.slug)}
                        className={BTN_SM_DANGER}
                      >
                        {busy ? 'Rejecting…' : 'Confirm rejection'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
