'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MemorialPageListItem } from '@/app/lib/types';
import { TypeIcon } from './Icons';

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
    <section className="mb-12" aria-labelledby="moderation-heading">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
        <h2 id="moderation-heading" className="text-[#6B6560] text-[11px] uppercase tracking-widest font-medium">
          Moderation queue ({items.length})
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="glass rounded-[24px] p-6 text-sm text-[#6B6560]">Nothing is waiting for review.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((p) => {
            const busy = busySlug === p.slug;
            return (
              <li key={p.id} className="glass rounded-[24px] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[#1A1614] font-semibold text-sm">
                      <TypeIcon type={p.page_type} className="w-3.5 h-3.5 text-muted" />
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="text-xs text-[#6B6560] mt-0.5">by {p.owner.display_name || p.owner.email || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-2">
                    {p.slug && (
                      <Link
                        href={`/${p.slug}`}
                        className="px-4 py-2 text-xs font-medium text-[#1A1614] bg-white border border-[#1A1614]/10 rounded-[12px] hover:bg-[#F3F0EB] no-underline"
                      >
                        Preview
                      </Link>
                    )}
                    <button
                      type="button" disabled={busy} onClick={() => onApprove(p.slug)}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#8B0000] rounded-[12px] hover:bg-[#A00000] disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button" disabled={busy}
                      onClick={() => { setRejecting(rejecting === p.slug ? null : p.slug); setNote(''); }}
                      className="px-4 py-2 text-xs font-medium text-[#8B0000] bg-white border border-[#8B0000]/30 rounded-[12px] hover:bg-[#8B0000]/[0.05] disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {rejecting === p.slug && (
                  <div className="flex flex-col gap-3">
                    <label htmlFor={`note-${p.id}`} className="text-[11px] uppercase tracking-widest text-[#6B6560] font-medium">
                      Note to owner
                    </label>
                    <textarea
                      id={`note-${p.id}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Explain what needs to change…"
                      className="w-full bg-white border border-[#1A1614]/10 rounded-[12px] px-4 py-3 text-[#1A1614] text-sm placeholder:text-[#8A7F74] outline-none focus:border-[#8B0000]/50 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button" onClick={() => setRejecting(null)}
                        className="px-4 py-2 text-xs font-medium text-[#6B6560] hover:text-[#1A1614]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button" disabled={busy} onClick={() => confirmReject(p.slug)}
                        className="px-4 py-2 text-xs font-medium text-white bg-[#8B0000] rounded-[12px] hover:bg-[#A00000] disabled:opacity-50"
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
