'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import { DialogShell } from '@/components/dashboard/DialogShell';
import { BTN_SUBMIT, FIELD, FOCUS, LABEL, LINK, NOTICE_ERROR } from '@/components/ui/styles';

type Tab = 'login' | 'register';

const TITLE_ID = 'auth-dialog-title';
const ERROR_ID = 'auth-error';

export function CreateMemorialModal() {
  const { isCreateOpen } = useModal();
  return isCreateOpen ? <ModalForm /> : null;
}

function ModalForm() {
  const { closeCreate, authRedirectTo } = useModal();
  const { login, register, loading, error } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const ok = tab === 'login'
      ? await login(email, password)
      : await register(email, password, name, accepted);
    if (ok) {
      closeCreate();
      router.push(authRedirectTo);
    }
  }, [tab, email, password, name, accepted, login, register, closeCreate, router, authRedirectTo]);

  const errorProps = error ? { 'aria-invalid': true, 'aria-describedby': ERROR_ID } : {};

  return (
    <DialogShell
      title={tab === 'login' ? 'Sign in to continue' : 'Create your account'}
      titleId={TITLE_ID}
      onClose={closeCreate}
      busy={loading}
      size="md"
    >
      <p className="type-body text-muted -mt-2">
        Drafts are free. You only pay when a memorial is ready to be reviewed.
      </p>

      {/* Tabs — segmented control */}
      <div className="flex gap-1 p-1 rounded-full bg-ink/[0.06]">
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`flex-1 h-10 rounded-full font-display font-medium text-[15px] transition-colors duration-300 ${FOCUS} ${
              tab === t ? 'bg-white text-ink shadow-chip' : 'text-muted hover:text-ink'
            }`}
          >
            {t === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tab === 'register' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="auth-name" className={LABEL}>Your name</label>
            <input
              id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              required autoComplete="name" placeholder="John Smith" className={FIELD}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="auth-email" className={LABEL}>Email</label>
          <input
            id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email" inputMode="email" placeholder="you@example.com" className={FIELD}
            {...errorProps}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="auth-password" className={LABEL}>Password</label>
          <input
            id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={tab === 'register' ? 8 : undefined}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            className={FIELD}
            {...errorProps}
          />
          {tab === 'register' && <p className="type-caption text-muted">At least 8 characters.</p>}
        </div>

        {tab === 'login' && (
          <Link href="/forgot-password" onClick={closeCreate} className={`${LINK} self-end -mt-1 type-caption`}>
            Forgot password?
          </Link>
        )}

        {tab === 'register' && (
          <label className="flex items-start gap-3 cursor-pointer type-caption text-muted">
            <input
              type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required
              className={`mt-0.5 w-5 h-5 shrink-0 accent-ink cursor-pointer ${FOCUS}`}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" target="_blank" rel="noopener" className={LINK}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" rel="noopener" className={LINK}>Privacy Policy</Link>
            </span>
          </label>
        )}

        {error && <p id={ERROR_ID} role="alert" className={NOTICE_ERROR}>{error}</p>}

        <button type="submit" disabled={loading || (tab === 'register' && !accepted)} className={`${BTN_SUBMIT} mt-1`}>
          {loading ? 'One moment…' : tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="type-caption text-muted text-center">
        Memorials are private: only people with the QR code or link can open them.
      </p>
    </DialogShell>
  );
}
