'use client';

import { useState } from 'react';
import { reports } from '@/app/lib/api';
import type { MemorialPageListItem } from '@/app/lib/types';
import { PortraitTools } from './PortraitTools';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, BTN_SM, FIELD } from './styles';

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
    <div className="flex flex-col gap-3 border-t border-[#1A1614]/[0.08] pt-3">
      <p className="text-[10px] uppercase tracking-widest text-muted font-medium">Admin tools</p>
      <div className="flex flex-wrap gap-2">
        {page.hidden ? (
          <button type="button" disabled={busy} onClick={() => void unhide()} className={`${BTN_SECONDARY} !px-4 !py-2 !text-xs !rounded-[12px]`}>
            {busy ? 'Working…' : 'Unhide page'}
          </button>
        ) : (
          <button
            type="button" disabled={busy} aria-expanded={hiding} onClick={() => setHiding((v) => !v)}
            className={`${BTN_DANGER} !px-4 !py-2 !text-xs !rounded-[12px]`}
          >
            Hide page
          </button>
        )}
      </div>

      {hiding && !page.hidden && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`hide-${page.id}`} className="text-[11px] uppercase tracking-widest text-[#6B6560] font-medium">
            Reason (required)
          </label>
          <textarea
            id={`hide-${page.id}`} rows={2} value={reason} required onChange={(e) => setReason(e.target.value)}
            className={`${FIELD} resize-none`}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setHiding(false)} className={`${BTN_SM} text-[#6B6560] hover:text-[#1A1614]`}>Cancel</button>
            <button type="button" disabled={busy} onClick={() => void hide()} className={`${BTN_PRIMARY} !px-4 !py-2 !text-xs !rounded-[12px]`}>
              {busy ? 'Hiding…' : 'Confirm: Hide page'}
            </button>
          </div>
        </div>
      )}
      <p role="alert" className="text-[#8B0000] text-xs empty:hidden">{error}</p>

      {page.package_type === 'premium' && <PortraitTools page={page} onChanged={onChanged} />}
    </div>
  );
};
