'use client';

import { useCallback, useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

interface DialogShellProps {
  title: string;
  titleId: string;
  onClose: () => void;
  /** Blocks Esc / backdrop close while an async action is running. */
  busy?: boolean;
  children: React.ReactNode;
}

/** Accessible modal: focus moves in, is trapped, Esc closes, focus returns to the trigger. */
export const DialogShell = ({ title, titleId, onClose, busy = false, children }: DialogShellProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previous?.focus();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !busy) { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) { e.preventDefault(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialogRef.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div className="absolute inset-0 bg-[#1A1614]/40 backdrop-blur-sm pointer-events-none" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative bg-[#FAF8F5] border border-[#1A1614]/[0.08] rounded-[32px] w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-5 outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-[#1A1614] font-bold text-xl tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="shrink-0 p-2 -m-2 rounded-full text-[#6B6560] hover:text-[#1A1614] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
