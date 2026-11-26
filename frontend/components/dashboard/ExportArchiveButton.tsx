'use client';

import { useState } from 'react';
import { pages } from '@/app/lib/api';
import { DownloadIcon } from '@/components/ui/icons';
import { BTN_SM_SOFT, ERROR_TEXT } from '@/components/ui/styles';

interface ExportArchiveButtonProps {
  slug: string;
  /** Button classes; defaults to the compact soft capsule. */
  className?: string;
}

export const ExportArchiveButton = ({ slug, className = BTN_SM_SOFT }: ExportArchiveButtonProps) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onClick = async () => {
    setBusy(true);
    setError('');
    const res = await pages.exportArchive(slug);
    setBusy(false);
    if (!res.success) {
      setError(res.error || 'Could not download the archive. Please try again.');
      return;
    }
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remember-us-${slug}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        aria-busy={busy}
        className={className}
      >
        <DownloadIcon className="w-4 h-4" />
        {busy ? 'Preparing…' : 'Download archive'}
      </button>
      <p role="alert" className={`${ERROR_TEXT} basis-full empty:hidden`}>{error}</p>
    </>
  );
};
