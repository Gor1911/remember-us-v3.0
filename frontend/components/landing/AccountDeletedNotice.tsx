'use client';

import { useEffect, useState } from 'react';

export function AccountDeletedNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('account') !== 'deleted') return;
    url.searchParams.delete('account');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read-once URL flag
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md glass rounded-[16px] px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm"
    >
      <p className="text-[#1A1614] text-[15px]">Your account has been deleted.</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="text-[#6B6560] hover:text-[#1A1614] rounded-md focus-visible:outline-2 focus-visible:outline-[#8B0000]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
