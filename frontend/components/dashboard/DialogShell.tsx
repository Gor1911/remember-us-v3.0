'use client';

import { useCallback, useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { FOCUS } from '@/components/ui/styles';

/** Everything that can take keyboard focus inside a dialog. */
export const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

interface DialogShellProps {
  title: string;
  titleId: string;
  onClose: () => void;
  /** Blocks Esc / backdrop close while an async action is running. */
  busy?: boolean;
  /** Panel width: `md` for short forms (sign-in), `xl` (default) for longer content. */
  size?: 'md' | 'xl';
  /** Id of the element that describes the dialog (aria-describedby). */
  describedBy?: string;
  /** Selector of the control to focus on open (e.g. a password field); defaults to the panel. */
  initialFocus?: string;
  children: React.ReactNode;
}

/**
 * Accessible modal: focus moves in, is trapped, Esc closes, focus returns to the trigger,
 * and the page behind does not scroll.
 */
export const DialogShell = ({
  title, titleId, onClose, busy = false, size = 'xl', describedBy, initialFocus, children,
}: DialogShellProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const target = initialFocus ? dialogRef.current?.querySelector<HTMLElement>(initialFocus) : null;
    (target ?? dialogRef.current)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on open
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
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm pointer-events-none" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={`relative bg-canvas text-ink rounded-[24px] w-full ${size === 'md' ? 'max-w-md' : 'max-w-xl'} max-h-[92vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-5 outline-none shadow-dialog`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="type-card-heading pt-2">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className={`shrink-0 grid place-items-center w-11 h-11 -m-1.5 rounded-full bg-ink/[0.06] text-ink hover:bg-ink/10 transition-colors ${FOCUS}`}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
