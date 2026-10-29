'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { auth } from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

interface DeleteAccountDialogProps {
  onClose: () => void;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href]';

export const DeleteAccountDialog = ({ onClose }: DeleteAccountDialogProps) => {
  const { logout } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Focus the password field on open; restore focus to the trigger on close
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !busy) { onClose(); return; }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, [busy, onClose]);

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    const res = await auth.deleteAccount(password);
    if (!res.success) {
      setError(res.code === 'INVALID_PASSWORD' ? 'Incorrect password.' : res.error);
      setBusy(false);
      return;
    }
    logout();
    // Full navigation: a client-side replace would race the dashboard's
    // unauthenticated redirect to '/' and drop the ?account=deleted flag.
    window.location.replace('/?account=deleted');
  };

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
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
        onKeyDown={onKeyDown}
        className="relative bg-[#FAF8F5] border border-[#1A1614]/[0.08] rounded-[32px] w-full max-w-md p-8 flex flex-col gap-5"
      >
        <h2 id="delete-account-title" className="text-[#1A1614] font-bold text-xl tracking-tight">
          Delete your account?
        </h2>
        <p id="delete-account-desc" className="text-[#6B6560] text-base leading-relaxed">
          This permanently deletes your account and removes all memorials you created. This cannot be undone.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="delete-account-password" className="text-[#6B6560] text-sm font-medium">
              Enter your password to confirm
            </label>
            <input
              ref={inputRef}
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#1A1614]/[0.15] rounded-[12px] px-4 py-3 text-[#1A1614] text-base outline-none focus:border-[#8B0000] focus-visible:ring-2 focus-visible:ring-[#8B0000]/30"
            />
          </div>

          {error && <p role="alert" className="text-[#8B0000] text-[15px]">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-6 py-3 rounded-[14px] border border-[#1A1614]/[0.15] text-[#1A1614] text-sm font-medium hover:bg-[#1A1614]/[0.04] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password || busy}
              className="px-6 py-3 rounded-[14px] bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
            >
              {busy ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
