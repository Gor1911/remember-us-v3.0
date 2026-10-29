'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import { CloseIcon } from '@/components/landing/icons';

type Tab = 'login' | 'register';

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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCreate(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCreate]);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    let ok = false;
    if (tab === 'login') {
      ok = await login(email, password);
    } else {
      ok = await register(email, password, name, accepted);
    }
    if (ok) {
      closeCreate();
      router.push(authRedirectTo);
    }
  }, [tab, email, password, name, accepted, login, register, closeCreate, router, authRedirectTo]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeCreate(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A1614]/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative glass rounded-[32px] w-full max-w-md p-8 flex flex-col gap-6">

        {/* Close */}
        <button
          onClick={closeCreate}
          className="absolute top-5 right-5 text-[#1A1614]/30 hover:text-[#1A1614] text-xl leading-none transition-colors"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
          <span className="text-[#1A1614] font-semibold text-[15px] tracking-tight">
            Remember<span className="text-[#8A7F74] font-normal"> US</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[14px] bg-[#1A1614]/[0.04] border border-[#1A1614]/[0.08]">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-200 ${
                tab === t
                  ? 'bg-[#8B0000] text-white'
                  : 'text-[#1A1614]/40 hover:text-[#1A1614]/70'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[#1A1614]/40 text-xs uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Smith"
                className="w-full bg-[#1A1614]/[0.04] border border-[#1A1614]/[0.10] rounded-[12px] px-4 py-3 text-[#1A1614] text-sm placeholder:text-[#1A1614]/25 outline-none focus:border-[#1A1614]/25 transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[#1A1614]/40 text-xs uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-[#1A1614]/[0.04] border border-[#1A1614]/[0.10] rounded-[12px] px-4 py-3 text-[#1A1614] text-sm placeholder:text-[#1A1614]/25 outline-none focus:border-[#1A1614]/25 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#1A1614]/40 text-xs uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#1A1614]/[0.04] border border-[#1A1614]/[0.10] rounded-[12px] px-4 py-3 text-[#1A1614] text-sm placeholder:text-[#1A1614]/25 outline-none focus:border-[#1A1614]/25 transition-colors"
            />
          </div>

          {tab === 'register' && (
            <label className="flex items-start gap-3 cursor-pointer text-[#1A1614]/70 text-[15px] leading-snug">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                required
                className="mt-0.5 w-5 h-5 shrink-0 accent-[#8B0000] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" target="_blank" rel="noopener" className="text-[#8B0000] underline underline-offset-2">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" rel="noopener" className="text-[#8B0000] underline underline-offset-2">Privacy Policy</Link>
              </span>
            </label>
          )}

          {error && (
            <p className="text-[#8B0000] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || (tab === 'register' && !accepted)}
            className="w-full py-3.5 bg-[#8B0000] hover:bg-[#A00000] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-[14px] transition-colors duration-200"
          >
            {loading
              ? 'Please wait…'
              : tab === 'login'
              ? 'Sign In & Continue'
              : 'Create Account & Continue'}
          </button>
        </form>

        <p className="text-[#1A1614]/20 text-xs text-center">
          Access is private. Memorial visible only via QR code.
        </p>
      </div>
    </div>
  );
}
