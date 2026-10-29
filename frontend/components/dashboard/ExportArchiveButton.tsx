'use client';

import { useState } from 'react';
import { pages } from '@/app/lib/api';

interface ExportArchiveButtonProps {
  slug: string;
  className?: string;
}

export const ExportArchiveButton = ({ slug, className = '' }: ExportArchiveButtonProps) => {
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
        className={`${className} flex items-center justify-center gap-1.5 text-[#1A1614] bg-transparent border border-[#1A1614]/20 hover:bg-[#F3F0EB] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]`}
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
        </svg>
        {busy ? 'Preparing…' : 'Download archive'}
      </button>
      <p role="alert" className="basis-full text-[#8B0000] text-xs empty:hidden">{error}</p>
    </>
  );
};
