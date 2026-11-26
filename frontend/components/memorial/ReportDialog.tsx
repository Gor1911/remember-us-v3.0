'use client';

import { useCallback, useState } from 'react';
import { reports } from '@/app/lib/api';
import type { ReportCategory } from '@/app/lib/types';
import { DialogShell } from '@/components/dashboard/DialogShell';
import { BTN_PRIMARY, BTN_SECONDARY, ERROR_TEXT, FIELD, FOCUS, HINT, LABEL } from '@/components/ui/styles';

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

export const ReportDialog = ({ slug, onClose }: ReportDialogProps) => {
  const [category, setCategory] = useState<ReportCategory>('inappropriate');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    <DialogShell
      title="Report this memorial"
      titleId="report-title"
      onClose={onClose}
      busy={busy}
      size="md"
      initialFocus='input[name="report-category"]:checked'
    >

        {done ? (
          <div className="flex flex-col gap-5">
            <p role="status" className="type-body text-ink">
              Thank you. Our team will review this report.
            </p>
            <button type="button" onClick={onClose} className={`${BTN_PRIMARY} w-full`}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className={`${LABEL} mb-2`}>Reason</legend>
              {CATEGORIES.map((c) => (
                <label key={c.value} className="flex min-h-[44px] cursor-pointer items-center gap-3 type-body text-ink">
                  <input
                    type="radio"
                    name="report-category"
                    value={c.value}
                    checked={category === c.value}
                    onChange={() => setCategory(c.value)}
                    className={`h-5 w-5 shrink-0 accent-bronze-deep ${FOCUS}`}
                  />
                  {c.label}
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-message" className={LABEL}>Details</label>
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
              <p id="report-count" className={`${HINT} text-right tabular-nums`}>
                {message.length} / {MAX} (minimum {MIN})
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-email" className={LABEL}>
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
              {error && <p role="alert" className={ERROR_TEXT}>{error}</p>}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className={`${BTN_SECONDARY} flex-1`}>
                Cancel
              </button>
              <button type="submit" disabled={busy} className={`${BTN_PRIMARY} flex-1`}>
                {busy ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>
        )}
    </DialogShell>
  );
};
