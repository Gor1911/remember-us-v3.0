'use client';

import { useState } from 'react';
import type { PageAccessQr } from '@/app/lib/types';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY } from '@/components/dashboard/styles';
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
        <p className="text-[#6B6560] text-sm">No QR code has been created for this memorial yet.</p>
        <button type="button" disabled={busy !== null} onClick={() => void onGenerate()} className={BTN_PRIMARY}>
          {busy === 'generate' ? 'Creating…' : 'Create QR code'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
        <div className="shrink-0 w-40 h-40 rounded-[16px] bg-white border border-[#1A1614]/[0.1] p-2 flex items-center justify-center">
          {qr.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr.image_url} alt="QR code for this memorial" className="w-full h-full object-contain" />
          ) : (
            <span className="text-muted text-xs text-center">Preview unavailable</span>
          )}
        </div>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex gap-2 items-center">
            <dt className="text-[#6B6560]">Status</dt>
            <dd className={`font-medium ${qr.is_active ? 'text-[#2F6B4F]' : 'text-[#8B0000]'}`}>
              {qr.is_active ? 'Active' : 'Disabled'}
            </dd>
          </div>
          <div className="flex gap-2"><dt className="text-[#6B6560]">Scans</dt><dd className="text-[#1A1614]">{qr.scan_count}</dd></div>
          <div className="flex gap-2"><dt className="text-[#6B6560]">Last scanned</dt><dd className="text-[#1A1614]">{formatDate(qr.last_scanned_at)}</dd></div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy !== null} onClick={() => onDownload('png')} className={BTN_SECONDARY}>
          {busy === 'download-png' ? 'Preparing…' : 'Download PNG'}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => onDownload('svg')} className={BTN_SECONDARY}>
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
