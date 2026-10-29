'use client';

import { useEffect, useState } from 'react';

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
    <div role="status" className="mb-8 flex items-start justify-between gap-4 rounded-[16px] border border-[#1A1614]/10 bg-white px-4 py-3">
      <p className="text-sm text-[#1A1614]">
        Payment was canceled. Your draft is saved — you can complete payment any time.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 text-sm font-medium text-[#6B6560] hover:text-[#1A1614] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
      >
        Dismiss
      </button>
    </div>
  );
};
