'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { reports } from '@/app/lib/api';
import type { Report } from '@/app/lib/types';
import { BTN_SM_DANGER, BTN_SM_DARK, BTN_SM_SOFT, ERROR_TEXT, FIELD, LABEL } from '@/components/ui/styles';

const QUEUE_ITEM = 'bg-white rounded-tile p-5';

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
    <section className="mb-14" aria-labelledby="reports-heading">
      <div className="flex items-center gap-2.5 mb-4">
        <h2 id="reports-heading" className="type-section-heading text-ink">
          Reports
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 type-utility font-medium tabular-nums ${items.length > 0 ? 'bg-danger/[0.08] text-danger' : 'bg-ink/[0.06] text-muted'}`}
          aria-label={`${items.length} open`}
        >
          {items.length}
        </span>
      </div>

      <p role="alert" className={`${ERROR_TEXT} mb-3 empty:hidden`}>{error}</p>

      {loaded && items.length === 0 && !error && (
        <p className={`${QUEUE_ITEM} type-caption text-muted`}>No open reports.</p>
      )}

      <ul className="flex flex-col gap-2.5">
        {items.map((r) => {
          const isActive = active?.id === r.id;
          const busy = busyId === r.id;
          return (
            <li key={r.id} className={`${QUEUE_ITEM} flex flex-col gap-3`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-medium text-[16px] text-ink">
                    {r.page.first_name} {r.page.last_name}
                    {r.page.hidden && (
                      <span className="ml-2 align-middle rounded-full bg-danger/[0.08] px-2 py-0.5 type-utility font-medium text-danger">Hidden</span>
                    )}
                  </p>
                  <p className="type-caption text-muted">
                    {CATEGORY_LABEL[r.category]} · {new Date(r.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>
                {r.page.slug && (
                  <Link href={`/${r.page.slug}`} className={`${BTN_SM_SOFT} no-underline`}>
                    View page
                  </Link>
                )}
              </div>
              <p className="rounded-[14px] bg-soft px-4 py-3 type-caption text-ink whitespace-pre-wrap break-words">{r.message}</p>
              <p className="type-caption text-muted">Contact: {r.contact_email || 'not provided'}</p>

              <div className="flex flex-wrap gap-2">
                {(['dismiss', 'resolve', 'hide_page'] as const).map((act) => (
                  <button
                    key={act}
                    type="button"
                    disabled={busy}
                    aria-expanded={isActive && active?.action === act}
                    onClick={() => open(r.id, act)}
                    className={act === 'hide_page' ? BTN_SM_DANGER : BTN_SM_SOFT}
                  >
                    {ACTION_LABEL[act]}
                  </button>
                ))}
              </div>

              {isActive && active && (
                <div className="flex flex-col gap-2 border-t border-ink/10 pt-3">
                  <label htmlFor={`report-note-${r.id}`} className={LABEL}>
                    {active.action === 'hide_page' ? 'Reason (required)' : 'Note (optional)'}
                  </label>
                  <textarea
                    id={`report-note-${r.id}`} rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                    required={active.action === 'hide_page'} className={`${FIELD} resize-none`}
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setActive(null)} className={BTN_SM_SOFT}>
                      Cancel
                    </button>
                    <button type="button" disabled={busy} onClick={() => void submit(r)} className={active.action === 'hide_page' ? BTN_SM_DANGER : BTN_SM_DARK}>
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
