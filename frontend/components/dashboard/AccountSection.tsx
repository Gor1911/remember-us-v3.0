'use client';

import { useState } from 'react';
import { DeleteAccountDialog } from '@/components/dashboard/DeleteAccountDialog';

interface AccountSectionProps {
  email: string;
}

export const AccountSection = ({ email }: AccountSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="account-heading" className="mt-16 pt-10 border-t border-[#1A1614]/[0.08]">
      <h2 id="account-heading" className="text-[#1A1614] font-bold text-xl tracking-tight mb-6">Account</h2>
      <div className="glass rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[#6B6560] text-sm">Signed in as</p>
          <p className="text-[#1A1614] text-base font-medium truncate">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-[14px] border border-[#8B0000]/50 text-[#8B0000] text-sm font-medium hover:bg-[#8B0000]/[0.06] transition-colors w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
        >
          Delete account
        </button>
      </div>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </section>
  );
};
