'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { reports } from '@/app/lib/api';
import type { Report } from '@/app/lib/types';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, BTN_SM, FIELD } from './styles';

type Action = 'dismiss' | 'resolve' | 'hide_page';

const ACTION_LABEL: Record<Action, string> = {
  dismiss: 'Dismiss',
  resolve: 'Mark resolved',
  hide_page: 'Hide page',
};

const CATEGORY_LABEL: Record<Report['category'], string> = {
  inappropriate: 'Inappropriate content',
  privacy: 'Privacy',
  copyright: 'Copyright',
  impersonation: 'Impersonation',
  other: 'Other',
};

interface ReportsQueueProps {
  /** A report action may hide a page — refresh the memorial list. */
  onPageChanged: () => void;
}

export const ReportsQueue = ({ onPageChanged }: ReportsQueueProps) => {
  const [items, setItems] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<{ id: string; action: Action } | null>(null);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await reports.list('open');
    if (res.success) { setItems(res.data); setError(''); } else setError(res.error);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const open = (id: string, action: Action) => { setActive({ id, action }); setNote(''); };

  const submit = async (r: Report) => {
    if (!active || busyId) return;
    if (active.action === 'hide_page' && !note.trim()) { setError('A reason is required to hide a page.'); return; }
    setBusyId(r.id);
    setError('');
    const res = await reports.resolve(r.id, active.action, note.trim());
    setBusyId(null);
    if (!res.success) { setError(res.error); return; }
    if (active.action === 'hide_page') onPageChanged();
    setActive(null);
    await load();
  };

  return (
    <section className="mb-12" aria-labelledby="reports-heading">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
        <h2 id="reports-heading" className="text-[#6B6560] text-[11px] uppercase tracking-widest font-medium">
          Reports
        </h2>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#8B0000]/10 text-[#8B0000]" aria-label={`${items.length} open`}>
          {items.length}
        </span>
      </div>

      <p role="alert" className="text-[#8B0000] text-sm mb-3 empty:hidden">{error}</p>

      {loaded && items.length === 0 && !error && (
        <p className="glass rounded-[24px] p-6 text-sm text-[#6B6560]">No open reports.</p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((r) => {
          const isActive = active?.id === r.id;
          const busy = busyId === r.id;
          return (
            <li key={r.id} className="glass rounded-[24px] p-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[#1A1614] font-semibold text-sm">
                    {r.page.first_name} {r.page.last_name}
                    {r.page.hidden && <span className="ml-2 text-xs font-medium text-[#8B0000]">Hidden</span>}
                  </p>
                  <p className="text-xs text-[#6B6560] mt-0.5">
                    {CATEGORY_LABEL[r.category]} · {new Date(r.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>
                {r.page.slug && (
                  <Link href={`/${r.page.slug}`} className={`${BTN_SM} text-[#1A1614] bg-white border border-[#1A1614]/10 hover:bg-[#F3F0EB] no-underline`}>
                    View page
                  </Link>
                )}
              </div>
              <p className="text-sm text-[#1A1614] leading-relaxed whitespace-pre-wrap break-words">{r.message}</p>
              <p className="text-xs text-[#6B6560]">Contact: {r.contact_email || 'not provided'}</p>

              <div className="flex flex-wrap gap-2">
                {(['dismiss', 'resolve', 'hide_page'] as const).map((act) => (
                  <button
                    key={act}
                    type="button"
                    disabled={busy}
                    aria-expanded={isActive && active?.action === act}
                    onClick={() => open(r.id, act)}
                    className={`${act === 'hide_page' ? BTN_DANGER : BTN_SECONDARY} !px-4 !py-2 !text-xs !rounded-[12px]`}
                  >
                    {ACTION_LABEL[act]}
                  </button>
                ))}
              </div>

              {isActive && active && (
                <div className="flex flex-col gap-2">
                  <label htmlFor={`report-note-${r.id}`} className="text-[11px] uppercase tracking-widest text-[#6B6560] font-medium">
                    {active.action === 'hide_page' ? 'Reason (required)' : 'Note (optional)'}
                  </label>
                  <textarea
                    id={`report-note-${r.id}`} rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                    required={active.action === 'hide_page'} className={`${FIELD} resize-none`}
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setActive(null)} className={`${BTN_SM} text-[#6B6560] hover:text-[#1A1614]`}>
                      Cancel
                    </button>
                    <button type="button" disabled={busy} onClick={() => void submit(r)} className={`${BTN_PRIMARY} !px-4 !py-2 !text-xs !rounded-[12px]`}>
                      {busy ? 'Saving…' : `Confirm: ${ACTION_LABEL[active.action]}`}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
