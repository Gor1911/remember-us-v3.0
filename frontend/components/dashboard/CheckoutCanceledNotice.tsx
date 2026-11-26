'use client';

import { useEffect, useState } from 'react';
import { LINK, NOTICE_INFO } from '@/components/ui/styles';

/** Shows a dismissible notice after Stripe returns with ?checkout=canceled, then cleans the URL. */
export const CheckoutCanceledNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'canceled') return;
    params.delete('checkout');
    params.delete('page');
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read URL param once on mount
    setVisible(true);
  }, []);

  if (!visible) return null;
  return (
    <div role="status" className={`${NOTICE_INFO} mb-10 flex items-start justify-between gap-4`}>
      <p>
        Payment was canceled. Your draft is saved — you can complete payment any time.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className={`${LINK} shrink-0 font-medium`}
      >
        Dismiss
      </button>
    </div>
  );
};
