'use client';

import { useState } from 'react';
import type { PageAccessQr } from '@/app/lib/types';
import { DownloadIcon, QrIcon } from '@/components/ui/icons';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, HINT } from '@/components/ui/styles';
import { ConfirmBox } from './ConfirmBox';

interface QrPanelProps {
  qr: PageAccessQr;
  busy: string | null;
  onGenerate: () => Promise<boolean>;
  onDisable: () => Promise<boolean>;
  onEnable: () => Promise<boolean>;
  onReplace: () => Promise<boolean>;
  onDownload: (format: 'png' | 'svg') => void;
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

export const QrPanel = ({ qr, busy, onGenerate, onDisable, onEnable, onReplace, onDownload }: QrPanelProps) => {
  const [confirming, setConfirming] = useState(false);

  if (!qr.exists) {
    return (
      <div className="flex flex-col gap-3 items-start">
        <p className={HINT}>No QR code has been created for this memorial yet.</p>
        <button type="button" disabled={busy !== null} onClick={() => void onGenerate()} className={BTN_PRIMARY}>
          <QrIcon className="w-5 h-5" />
          {busy === 'generate' ? 'Creating…' : 'Create QR code'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className="shrink-0 w-44 h-44 rounded-tile bg-white p-4 flex items-center justify-center shadow-card">
          {qr.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr.image_url} alt="QR code for this memorial" className="w-full h-full object-contain" />
          ) : (
            <span className="type-caption text-muted text-center">Preview unavailable</span>
          )}
        </div>
        <dl className="flex flex-col gap-2 type-caption">
          <div className="flex gap-2 items-center">
            <dt className="text-muted">Status</dt>
            <dd className={`rounded-full px-2.5 py-0.5 type-utility font-medium ${qr.is_active ? 'bg-sage/10 text-sage' : 'bg-danger/[0.08] text-danger'}`}>
              {qr.is_active ? 'Active' : 'Disabled'}
            </dd>
          </div>
          <div className="flex gap-2"><dt className="text-muted">Scans</dt><dd className="text-ink tabular-nums">{qr.scan_count}</dd></div>
          <div className="flex gap-2"><dt className="text-muted">Last scanned</dt><dd className="text-ink">{formatDate(qr.last_scanned_at)}</dd></div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy !== null} onClick={() => onDownload('png')} className={BTN_SECONDARY}>
          <DownloadIcon className="w-5 h-5" />
          {busy === 'download-png' ? 'Preparing…' : 'Download PNG'}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => onDownload('svg')} className={BTN_SECONDARY}>
          <DownloadIcon className="w-5 h-5" />
          {busy === 'download-svg' ? 'Preparing…' : 'Download SVG'}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void (qr.is_active ? onDisable() : onEnable())}
          className={BTN_SECONDARY}
        >
          {busy === 'disable' ? 'Disabling…' : busy === 'enable' ? 'Enabling…' : qr.is_active ? 'Disable QR code' : 'Enable QR code'}
        </button>
        <button type="button" disabled={busy !== null || confirming} onClick={() => setConfirming(true)} className={BTN_DANGER}>
          Replace QR code
        </button>
      </div>

      {confirming && (
        <ConfirmBox
          id="replace-qr"
          confirmLabel="Replace QR code"
          busy={busy === 'rotate-qr'}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void onReplace().then(() => setConfirming(false))}
        >
          <p>Printed or engraved copies of the current QR code will stop working.</p>
        </ConfirmBox>
      )}
    </div>
  );
};
