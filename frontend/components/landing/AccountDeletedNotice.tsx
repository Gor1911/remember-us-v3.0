'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, CloseIcon } from '@/components/ui/icons';
import { FOCUS } from '@/components/ui/styles';

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
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md bg-white text-ink rounded-[16px] pl-4 pr-3 py-3 flex items-center gap-3 shadow-card"
    >
      <CheckIcon className="w-6 h-6 shrink-0 text-sage" />
      <p className="flex-1 type-body text-ink">Your account has been deleted.</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className={`shrink-0 grid place-items-center w-11 h-11 -m-1.5 rounded-full bg-ink/[0.06] text-ink hover:bg-ink/10 transition-colors ${FOCUS}`}
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
