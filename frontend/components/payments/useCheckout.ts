'use client';

import { useCallback, useEffect, useState } from 'react';
import { payments } from '@/app/lib/api';
import type { PackageType, Plan } from '@/app/lib/types';

export const UNAVAILABLE_MESSAGE = "Online payment isn't available yet. Your draft is saved.";

export interface PlansState {
  loading: boolean;
  /** null when the call failed. */
  plans: Plan[] | null;
}

/** Loads plan prices/availability from the API. */
export function usePlans(): PlansState {
  const [state, setState] = useState<PlansState>({ loading: true, plans: null });
  useEffect(() => {
    let alive = true;
    void payments.plans().then((res) => {
      if (alive) setState({ loading: false, plans: res.success ? res.data : null });
    });
    return () => { alive = false; };
  }, []);
  return state;
}

/** Starts Stripe Checkout for a draft; guards against double submit. */
export function useCheckout(slug: string, onAlreadyPaid: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = useCallback(async (pkg: PackageType, consent: boolean) => {
    if (busy) return;
    setBusy(true);
    setError('');
    const res = await payments.checkout(slug, pkg, consent);
    if (res.success) {
      window.location.assign(res.data.checkout_url);
      return; // stay busy while the browser navigates
    }
    if (res.code === 'PAYMENTS_UNAVAILABLE') setError(UNAVAILABLE_MESSAGE);
    else if (res.code === 'ALREADY_PAID') { setError('This memorial is already paid.'); onAlreadyPaid(); }
    else if (res.code === 'INVALID_STATE') setError("This memorial can't be paid for in its current state.");
    else setError(res.error);
    setBusy(false);
  }, [busy, slug, onAlreadyPaid]);

  return { busy, error, start };
}
