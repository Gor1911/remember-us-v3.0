'use client';

import { useCallback, useState } from 'react';
import { ReportDialog } from '@/components/memorial/ReportDialog';
import { FOCUS } from '@/components/ui/styles';

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
        className={`min-h-[44px] px-2 -mx-2 rounded-sm type-caption text-muted underline underline-offset-4 decoration-ink/25 transition-colors hover:text-ink hover:decoration-ink/50 ${FOCUS}`}
      >
        Report this memorial
      </button>
      {open && <ReportDialog slug={slug} onClose={close} />}
    </>
  );
};
