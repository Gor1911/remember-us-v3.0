'use client';

import { useEffect, useRef } from 'react';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/dashboard/styles';

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
      className="rounded-[20px] border border-[#8B0000]/30 bg-[#8B0000]/[0.05] p-4 flex flex-col gap-3"
    >
      <div id={`${id}-text`} className="flex flex-col gap-2 text-sm text-[#1A1614] leading-relaxed">{children}</div>
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
