'use client';

import { useCallback, useState } from 'react';
import { ReportDialog } from '@/components/memorial/ReportDialog';

interface ReportButtonProps {
  slug: string;
}

export const ReportButton = ({ slug }: ReportButtonProps) => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="min-h-[44px] px-2 text-xs text-muted underline underline-offset-2 transition-colors hover:text-[#1A1614] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
      >
        Report this memorial
      </button>
      {open && <ReportDialog slug={slug} onClose={close} />}
    </>
  );
};
