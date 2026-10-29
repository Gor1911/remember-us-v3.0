'use client';

import { useEffect, useState } from 'react';
import { payments } from '@/app/lib/api';
import type { PaymentSessionStatus } from '@/app/lib/types';

export type PollState =
  | { kind: 'checking' }
  | { kind: 'paid'; session: PaymentSessionStatus }
  | { kind: 'failed'; status: 'failed' | 'expired' | 'refunded' }
  | { kind: 'timeout' }
  | { kind: 'unknown' };

const INTERVAL_MS = 2000;
const MAX_MS = 60000;

/** Polls the payment session every 2 s for up to 60 s. Never reports `paid` unless the API does. */
export function usePaymentPolling(sessionId: string | null, enabled: boolean): PollState {
  const [state, setState] = useState<PollState>({ kind: 'checking' });

  useEffect(() => {
    if (!enabled || !sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();

    const tick = async () => {
      const res = await payments.session(sessionId);
      if (cancelled) return;
      if (res.success) {
        const s = res.data.status;
        if (s === 'paid') { setState({ kind: 'paid', session: res.data }); return; }
        if (s === 'failed' || s === 'expired' || s === 'refunded') { setState({ kind: 'failed', status: s }); return; }
      } else if (res.code === 'NOT_FOUND' || res.code === 'FORBIDDEN') {
        setState({ kind: 'unknown' });
        return;
      }
      if (Date.now() - started >= MAX_MS) { setState({ kind: 'timeout' }); return; }
      timer = setTimeout(tick, INTERVAL_MS);
    };
    tick();

    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [sessionId, enabled]);

  return state;
}
