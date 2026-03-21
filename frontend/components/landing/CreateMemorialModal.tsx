'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';

type Tab = 'login' | 'register';

export function CreateMemorialModal() {
  const { isCreateOpen, closeCreate, authRedirectTo } = useModal();
  const { login, register, loading, error } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isCreateOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setTab('login');
    }
  }, [isCreateOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCreate(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCreate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    let ok = false;
    if (tab === 'login') {
      ok = await login(email, password);
    } else {
      ok = await register(email, password, name);
    }
    if (ok) {
      closeCreate();
      router.push(authRedirectTo);
    }
  }, [tab, email, password, name, login, register, closeCreate, router]);

  if (!isCreateOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeCreate(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative glass rounded-[32px] w-full max-w-md p-8 flex flex-col gap-6">

        {/* Close */}
        <button
          onClick={closeCreate}
          className="absolute top-5 right-5 text-white/30 hover:text-white text-xl leading-none transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
          <span className="text-white font-semibold text-[15px] tracking-tight">
            Remember<span className="text-[#9BA4B5] font-normal"> US</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[14px] bg-white/[0.04] border border-white/[0.06]">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-200 ${
                tab === t
                  ? 'bg-[#8B0000] text-white'
                  : 'text-white/40 hover:text-white/70'
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
              <label className="text-white/40 text-xs uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Smith"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {error && (
            <p className="text-[#8B0000] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#8B0000] hover:bg-[#A00000] disabled:opacity-50 text-white font-medium text-sm rounded-[14px] transition-colors duration-200"
          >
            {loading
              ? 'Please wait…'
              : tab === 'login'
              ? 'Sign In & Continue'
              : 'Create Account & Continue'}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center">
          Access is private. Memorial visible only via QR code.
        </p>
      </div>
    </div>
  );
}
