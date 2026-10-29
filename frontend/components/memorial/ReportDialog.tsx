'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { reports } from '@/app/lib/api';
import type { ReportCategory } from '@/app/lib/types';

interface ReportDialogProps {
  slug: string;
  onClose: () => void;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'privacy', label: 'Shared without consent (privacy)' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other' },
];

const MIN = 10;
const MAX = 2000;
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FIELD =
  'w-full rounded-[12px] border border-[#1A1614]/[0.15] bg-white px-4 py-3 text-sm text-[#1A1614] placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8B0000]';

export const ReportDialog = ({ slug, onClose }: ReportDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<ReportCategory>('inappropriate');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Focus management: move focus in, trap Tab, close on Esc, restore on unmount.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, [onClose]);

  const submit = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length < MIN) { setError(`Please write at least ${MIN} characters.`); return; }
    setBusy(true);
    setError(null);
    const res = await reports.create(slug, {
      category,
      message: text,
      ...(email.trim() ? { contact_email: email.trim() } : {}),
    });
    setBusy(false);
    if (res.success) { setDone(true); return; }
    setError(
      res.code === 'RATE_LIMITED'
        ? 'Too many reports have been sent from this device. Please try again later.'
        : res.error || 'We could not send your report. Please try again.',
    );
  }, [slug, category, message, email]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-[#1A1614]/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="relative flex max-h-[92vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-[32px] border border-[#1A1614]/[0.08] bg-[#FAF8F5] p-6 sm:p-8"
      >
        <h2 id="report-title" className="text-xl font-semibold text-[#1A1614]">Report this memorial</h2>

        {done ? (
          <div className="flex flex-col gap-5">
            <p role="status" className="text-base leading-relaxed text-[#1A1614]">
              Thank you. Our team will review this report.
            </p>
            <button type="button" onClick={onClose} className="w-full rounded-[14px] bg-[#8B0000] py-3 text-sm font-medium text-white transition-colors hover:bg-[#A00000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-[#1A1614]">Reason</legend>
              {CATEGORIES.map((c) => (
                <label key={c.value} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px] text-[#1A1614]">
                  <input
                    type="radio"
                    name="report-category"
                    value={c.value}
                    checked={category === c.value}
                    onChange={() => setCategory(c.value)}
                    className="h-5 w-5 shrink-0 accent-[#8B0000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
                  />
                  {c.label}
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-message" className="text-sm font-medium text-[#1A1614]">Details</label>
              <textarea
                id="report-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX}
                rows={5}
                required
                aria-describedby="report-count"
                className={`${FIELD} resize-y`}
              />
              <p id="report-count" className="text-right text-xs text-muted">
                {message.length} / {MAX} (minimum {MIN})
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-email" className="text-sm font-medium text-[#1A1614]">
                Your email <span className="font-normal text-muted">(optional, so we can follow up)</span>
              </label>
              <input
                id="report-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={FIELD}
              />
            </div>

            <div aria-live="assertive">
              {error && <p role="alert" className="text-sm text-[#8B0000]">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-[14px] border border-[#1A1614]/20 py-3 text-sm font-medium text-[#1A1614] transition-colors hover:bg-[#1A1614]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="flex-1 rounded-[14px] bg-[#8B0000] py-3 text-sm font-medium text-white transition-colors hover:bg-[#A00000] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]">
                {busy ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
