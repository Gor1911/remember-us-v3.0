'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModalProvider, useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { SuccessView } from './SuccessView';
import { usePaymentPolling } from './usePaymentPolling';

const H1 = 'text-[#1A1614] font-bold text-3xl tracking-tight';
const BTN =
  'px-6 py-3 rounded-[14px] bg-[#8B0000] text-white text-sm font-medium no-underline hover:bg-[#A00000] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]';

function SuccessContent() {
  const { isAuthenticated, loading } = useAuth();
  const { openAuth } = useModal();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read from the URL on the client (avoids a Suspense boundary for useSearchParams).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL
    setSessionId(new URLSearchParams(window.location.search).get('session_id'));
    setReady(true);
  }, []);

  const state = usePaymentPolling(sessionId, ready && isAuthenticated);
  const needsLogin = ready && !loading && !isAuthenticated;

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 py-24 text-center gap-6">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
        <span className="text-muted text-[11px] uppercase tracking-[0.14em] font-medium">Remember US</span>
      </div>
      <div aria-live="polite" className="flex flex-col items-center gap-6 w-full">
        {!ready || loading ? (
          <p className="text-muted text-base">Loading…</p>
        ) : !sessionId ? (
          <>
            <h1 className={H1}>Nothing to confirm</h1>
            <Link href="/dashboard" className={BTN}>Go to your dashboard</Link>
          </>
        ) : needsLogin ? (
          <>
            <h1 className={H1}>Sign in to see your payment</h1>
            <p className="text-muted text-base max-w-md">
              Sign in with the account you used to pay and we will confirm it for you.
            </p>
            <button
              type="button"
              onClick={() => openAuth(`/success?session_id=${encodeURIComponent(sessionId)}`)}
              className={BTN}
            >
              Sign in
            </button>
          </>
        ) : (
          <SuccessView state={state} />
        )}
      </div>
      <CreateMemorialModal />
    </main>
  );
}

export default function SuccessPage() {
  return (
    <ModalProvider>
      <SuccessContent />
    </ModalProvider>
  );
}
