'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { auth } from '@/app/lib/api';
import { useModal } from '@/app/context/ModalContext';
import { FIELD_CLASS, LABEL_CLASS, SUBMIT_CLASS } from './fieldStyles';

const noopSubscribe = () => () => {};
const readSearch = (): string | null => window.location.search;
const readServer = (): string | null => null;

const INVALID_LINK = 'This reset link is invalid or has expired. Please request a new one.';

export const ResetPasswordForm = () => {
  const { openAuth } = useModal();
  // Read the query string on the client only (avoids the useSearchParams Suspense requirement)
  const search = useSyncExternalStore(noopSubscribe, readSearch, readServer);
  const q = new URLSearchParams(search ?? '');
  const params = search === null ? null : { uid: q.get('uid') ?? '', token: q.get('token') ?? '' };
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!params) return;
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    const res = await auth.confirmPasswordReset(params.uid, params.token, password);
    setBusy(false);
    if (res.success) setDone(true);
    else if (res.code === 'INVALID_TOKEN') setExpired(true);
    else if (res.code === 'RATE_LIMITED') setError('Too many attempts. Please wait a few minutes and try again.');
    else setError(res.error || 'Something went wrong. Please try again.');
  };

  const missing = params !== null && (!params.uid || !params.token);

  if (done) {
    return (
      <div role="status" className="flex flex-col gap-5 items-start">
        <p className="text-[#1A1614] text-base leading-relaxed">Your password has been changed.</p>
        <button
          type="button" onClick={() => openAuth('/dashboard')}
          className="text-[#8B0000] underline underline-offset-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (missing || expired) {
    return (
      <div role="alert" className="flex flex-col gap-5">
        <p className="text-[#8B0000] text-base leading-relaxed">{INVALID_LINK}</p>
        <Link href="/forgot-password" className="text-[#8B0000] underline underline-offset-2 text-base">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="rp-password" className={LABEL_CLASS}>New password</label>
        <input
          id="rp-password" type="password" autoComplete="new-password" required
          value={password} onChange={(e) => setPassword(e.target.value)} className={FIELD_CLASS}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="rp-confirm" className={LABEL_CLASS}>Confirm new password</label>
        <input
          id="rp-confirm" type="password" autoComplete="new-password" required
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          aria-describedby={error ? 'rp-error' : undefined} aria-invalid={error ? true : undefined}
          className={FIELD_CLASS}
        />
      </div>
      <div aria-live="assertive">
        {error && <p id="rp-error" className="text-[#8B0000] text-sm">{error}</p>}
      </div>
      <button type="submit" disabled={busy || !params || !password || !confirm} className={SUBMIT_CLASS}>
        {busy ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
};
