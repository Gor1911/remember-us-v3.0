'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/app/lib/api';
import { LINK, NOTICE_ERROR, NOTICE_SUCCESS } from '@/components/ui/styles';
import { FIELD_CLASS, LABEL_CLASS, SUBMIT_CLASS } from './fieldStyles';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await auth.requestPasswordReset(email.trim());
    setBusy(false);
    if (res.success) setSent(true);
    else if (res.code === 'RATE_LIMITED') setError('Too many attempts. Please wait a few minutes and try again.');
    else if (res.code === 'VALIDATION_ERROR') setError('Please enter a valid email address.');
    else setError(res.error || 'Something went wrong. Please try again.');
  };

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-5 items-start">
        <p className={NOTICE_SUCCESS}>
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/" className={`${LINK} type-body`}>Back to home</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="fp-email" className={LABEL_CLASS}>Email</label>
        <input
          id="fp-email" type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          aria-invalid={error ? true : undefined} aria-describedby={error ? 'fp-error' : undefined}
          className={FIELD_CLASS}
        />
      </div>
      <div aria-live="assertive">
        {error && <p id="fp-error" className={NOTICE_ERROR}>{error}</p>}
      </div>
      <button type="submit" disabled={busy || !email.trim()} className={SUBMIT_CLASS}>
        {busy ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
};
