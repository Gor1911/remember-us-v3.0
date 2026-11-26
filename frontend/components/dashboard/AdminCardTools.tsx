'use client';

import { useState } from 'react';
import { reports } from '@/app/lib/api';
import type { MemorialPageListItem } from '@/app/lib/types';
import { PortraitTools } from './PortraitTools';
import { BTN_SM_DANGER, BTN_SM_SOFT, ERROR_TEXT, EYEBROW, FIELD, LABEL } from '@/components/ui/styles';

interface AdminCardToolsProps {
  page: MemorialPageListItem;
  onChanged: () => void;
}

/** Admin-only controls on a memorial card: hide/unhide and Living Portrait tools. */
export const AdminCardTools = ({ page, onChanged }: AdminCardToolsProps) => {
  const [hiding, setHiding] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const hide = async () => {
    if (!reason.trim()) { setError('A reason is required to hide a page.'); return; }
    setBusy(true); setError('');
    const res = await reports.hidePage(page.slug, reason.trim());
    setBusy(false);
    if (!res.success) { setError(res.error); return; }
    setHiding(false); setReason(''); onChanged();
  };

  const unhide = async () => {
    setBusy(true); setError('');
    const res = await reports.unhidePage(page.slug);
    setBusy(false);
    if (!res.success) { setError(res.error); return; }
    onChanged();
  };

  return (
    <div className="flex flex-col gap-3 border-t border-ink/10 pt-4">
      <p className={EYEBROW}>Admin tools</p>
      <div className="flex flex-wrap gap-2">
        {page.hidden ? (
          <button type="button" disabled={busy} onClick={() => void unhide()} className={BTN_SM_SOFT}>
            {busy ? 'Working…' : 'Unhide page'}
          </button>
        ) : (
          <button
            type="button" disabled={busy} aria-expanded={hiding} onClick={() => setHiding((v) => !v)}
            className={BTN_SM_DANGER}
          >
            Hide page
          </button>
        )}
      </div>

      {hiding && !page.hidden && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`hide-${page.id}`} className={LABEL}>
            Reason (required)
          </label>
          <textarea
            id={`hide-${page.id}`} rows={2} value={reason} required onChange={(e) => setReason(e.target.value)}
            className={`${FIELD} resize-none`}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setHiding(false)} className={BTN_SM_SOFT}>Cancel</button>
            <button type="button" disabled={busy} onClick={() => void hide()} className={BTN_SM_DANGER}>
              {busy ? 'Hiding…' : 'Confirm: Hide page'}
            </button>
          </div>
        </div>
      )}
      <p role="alert" className={`${ERROR_TEXT} empty:hidden`}>{error}</p>

      {page.package_type === 'premium' && <PortraitTools page={page} onChanged={onChanged} />}
    </div>
  );
};
