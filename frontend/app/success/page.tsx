'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModalProvider, useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { BTN_PRIMARY, EYEBROW } from '@/components/ui/styles';
import { SuccessView } from './SuccessView';
import { usePaymentPolling } from './usePaymentPolling';

const H1 = 'type-heading text-ink text-balance';

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
    <main id="main" className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center px-4 py-24 text-center gap-6">
      <p className={EYEBROW}>Remember US</p>
      <div aria-live="polite" className="w-[min(100%,560px)] flex flex-col items-center gap-6">
        {!ready || loading ? (
          <p className="type-body text-muted">Loading…</p>
        ) : !sessionId ? (
          <>
            <h1 className={H1}>Nothing to confirm</h1>
            <Link href="/dashboard" className={BTN_PRIMARY}>Go to your dashboard</Link>
          </>
        ) : needsLogin ? (
          <>
            <h1 className={H1}>Sign in to see your payment</h1>
            <p className="type-body text-muted max-w-md">
              Sign in with the account you used to pay and we will confirm it for you.
            </p>
            <button
              type="button"
              onClick={() => openAuth(`/success?session_id=${encodeURIComponent(sessionId)}`)}
              className={BTN_PRIMARY}
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
