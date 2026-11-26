'use client';

import { useState } from 'react';
import { auth } from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { BTN_DANGER, BTN_SECONDARY, ERROR_TEXT, FIELD, LABEL } from '@/components/ui/styles';
import { DialogShell } from './DialogShell';

interface DeleteAccountDialogProps {
  onClose: () => void;
}

export const DeleteAccountDialog = ({ onClose }: DeleteAccountDialogProps) => {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    const res = await auth.deleteAccount(password);
    if (!res.success) {
      setError(res.code === 'INVALID_PASSWORD' ? 'That password isn’t right. Try again.' : res.error);
      setBusy(false);
      return;
    }
    logout();
    // Full navigation: a client-side replace would race the dashboard's
    // unauthenticated redirect to '/' and drop the ?account=deleted flag.
    window.location.replace('/?account=deleted');
  };

  return (
    <DialogShell
      title="Delete your account?"
      titleId="delete-account-title"
      describedBy="delete-account-desc"
      initialFocus="#delete-account-password"
      onClose={onClose}
      busy={busy}
      size="md"
    >
      <p id="delete-account-desc" className="type-body text-muted -mt-2">
        This permanently deletes your account and every memorial you created, including their QR codes.
        It can’t be undone — download an archive from each memorial first if you want to keep a copy.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="delete-account-password" className={LABEL}>
            Enter your password to confirm
          </label>
          <input
            id="delete-account-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'delete-account-error' : undefined}
            className={FIELD}
          />
        </div>

        {error && <p id="delete-account-error" role="alert" className={ERROR_TEXT}>{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-1">
          <button type="button" onClick={onClose} disabled={busy} className={BTN_SECONDARY}>
            Keep my account
          </button>
          <button type="submit" disabled={!password || busy} className={BTN_DANGER}>
            {busy ? 'Deleting…' : 'Delete my account'}
          </button>
        </div>
      </form>
    </DialogShell>
  );
};
