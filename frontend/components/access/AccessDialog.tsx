'use client';

import { useState } from 'react';
import { DialogShell } from '@/components/dashboard/DialogShell';
import { BTN_DANGER, BTN_SECONDARY, FIELD, LABEL } from '@/components/dashboard/styles';
import { ConfirmBox } from './ConfirmBox';
import { QrPanel } from './QrPanel';
import { useAccess } from './useAccess';

interface AccessDialogProps {
  slug: string;
  onClose: () => void;
  /** The web link was reset — refresh the list. */
  onSlugChanged: () => void;
}

export const AccessDialog = ({ slug, onClose, onSlugChanged }: AccessDialogProps) => {
  const a = useAccess(slug, onSlugChanged);
  const [copied, setCopied] = useState('');
  const [resetting, setResetting] = useState(false);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied('Copied');
    } catch {
      setCopied("Couldn't copy. Select the link and copy it manually.");
    }
  };

  const busyAny = a.busy !== null;
  return (
    <DialogShell title="Link & QR code" titleId="access-dialog-title" onClose={onClose} busy={busyAny}>
      <p role="alert" className="text-[#8B0000] text-sm empty:hidden">{a.error}</p>
      {a.loading && <p className="text-[#6B6560] text-sm" role="status">Loading…</p>}

      {a.data && (
        <>
          <section aria-labelledby="access-link-heading" className="flex flex-col gap-3">
            <h3 id="access-link-heading" className="text-[#6B6560] text-[11px] uppercase tracking-widest font-medium">
              Private link
            </h3>
            <label htmlFor="access-link" className={LABEL}>Share this link with family and friends</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input id="access-link" readOnly value={a.data.memorial_url} className={`${FIELD} font-mono text-xs`} />
              <button type="button" onClick={() => void copy(a.data!.memorial_url)} className={BTN_SECONDARY}>Copy</button>
            </div>
            <p role="status" className="text-[#2F6B4F] text-sm empty:hidden">{copied}</p>
            <div>
              <button type="button" disabled={busyAny || resetting} onClick={() => setResetting(true)} className={BTN_DANGER}>
                Reset link
              </button>
            </div>
            {resetting && (
              <ConfirmBox
                id="reset-link"
                confirmLabel="Reset link"
                busy={a.busy === 'rotate-link'}
                onCancel={() => setResetting(false)}
                onConfirm={() => void a.rotateLink().then((ok) => { if (ok) { setResetting(false); setCopied(''); } })}
              >
                <p>Anyone using the old link will lose access. Your QR code keeps working.</p>
                {a.data.qr.legacy_link_qr && (
                  <p className="font-medium text-[#8B0000]">
                    A QR code created before this update may contain the old link and would stop working.
                  </p>
                )}
              </ConfirmBox>
            )}
          </section>

          <div className="h-px bg-[#1A1614]/[0.08]" />

          <section aria-labelledby="access-qr-heading" className="flex flex-col gap-3">
            <h3 id="access-qr-heading" className="text-[#6B6560] text-[11px] uppercase tracking-widest font-medium">
              QR code
            </h3>
            <p className="text-[#6B6560] text-sm">The QR code opens the memorial even if you reset the link.</p>
            <QrPanel
              qr={a.data.qr}
              busy={a.busy}
              onGenerate={a.generateQr}
              onDisable={a.disableQr}
              onEnable={a.enableQr}
              onReplace={a.rotateQr}
              onDownload={(f) => void a.downloadQr(f)}
            />
          </section>
        </>
      )}
    </DialogShell>
  );
};
