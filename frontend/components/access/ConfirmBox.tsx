'use client';

import { useEffect, useRef } from 'react';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/ui/styles';

interface ConfirmBoxProps {
  id: string;
  children: React.ReactNode;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Inline danger confirmation; focus moves to the safe "Cancel" action. */
export const ConfirmBox = ({ id, children, confirmLabel, busy, onConfirm, onCancel }: ConfirmBoxProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);

  return (
    <div
      role="group"
      aria-labelledby={`${id}-text`}
      className="rounded-[16px] bg-danger/[0.08] p-4 sm:p-5 flex flex-col gap-4"
    >
      <div id={`${id}-text`} className="flex flex-col gap-2 type-caption text-ink">{children}</div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className={BTN_SECONDARY}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} aria-busy={busy} className={BTN_DANGER}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </div>
  );
};
