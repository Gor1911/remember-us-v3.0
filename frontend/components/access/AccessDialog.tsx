'use client';

import { useState } from 'react';
import { DialogShell } from '@/components/dashboard/DialogShell';
import { BTN_DANGER, BTN_SECONDARY, ERROR_TEXT, FIELD, HINT, LABEL } from '@/components/ui/styles';

const SECTION_HEADING = 'type-panel-heading text-ink';
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
      <p role="alert" className={`${ERROR_TEXT} empty:hidden`}>{a.error}</p>
      {a.loading && <p className={HINT} role="status">Loading…</p>}

      {a.data && (
        <>
          <section aria-labelledby="access-link-heading" className="flex flex-col gap-3">
            <h3 id="access-link-heading" className={SECTION_HEADING}>
              Private link
            </h3>
            <label htmlFor="access-link" className={LABEL}>Share this link with family and friends</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input id="access-link" readOnly value={a.data.memorial_url} className={`${FIELD} font-mono`} />
              <button type="button" onClick={() => void copy(a.data!.memorial_url)} className={`${BTN_SECONDARY} shrink-0`}>Copy</button>
            </div>
            <p role="status" className="type-caption text-sage empty:hidden">{copied}</p>
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
                  <p className="font-medium text-danger">
                    A QR code created before this update may contain the old link and would stop working.
                  </p>
                )}
              </ConfirmBox>
            )}
          </section>

          <div className="h-px bg-ink/10" />

          <section aria-labelledby="access-qr-heading" className="flex flex-col gap-3">
            <h3 id="access-qr-heading" className={SECTION_HEADING}>
              QR code
            </h3>
            <p className="type-caption text-muted">The QR code opens the memorial even if you reset the link.</p>
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
