'use client';

import { useState } from 'react';
import { DeleteAccountDialog } from '@/components/dashboard/DeleteAccountDialog';
import { BTN_DANGER, CARD } from '@/components/ui/styles';

interface AccountSectionProps {
  email: string;
}

export const AccountSection = ({ email }: AccountSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="account-heading" className="mt-20">
      <h2 id="account-heading" className="type-card-heading text-ink mb-6">Account</h2>
      <div className={`${CARD} flex flex-col sm:flex-row sm:items-center justify-between gap-5`}>
        <div className="min-w-0">
          <p className="type-caption text-muted">Signed in as</p>
          <p className="type-body font-medium text-ink truncate">{email}</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className={`${BTN_DANGER} self-start sm:self-auto`}>
          Delete account
        </button>
      </div>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </section>
  );
};
