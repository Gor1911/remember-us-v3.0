'use client';

import { useState } from 'react';
import type { PackageType } from '@/app/lib/types';
import { AI_CONSENT_TEXT, LIFETIME_FOOTNOTE, PRICE_NOTE } from '@/components/pricing/plans';
import { BTN_PRIMARY } from '@/components/dashboard/styles';
import { PlanCards } from './PlanCards';
import { UNAVAILABLE_MESSAGE, useCheckout, usePlans } from './useCheckout';

interface PlanCheckoutFormProps {
  slug: string;
  idPrefix: string;
  initialPackage?: PackageType;
  /** Called when the API says the page is already paid (refresh the list). */
  onAlreadyPaid: () => void;
  /** Secondary actions rendered beside the primary button. */
  children?: React.ReactNode;
}

/** Plan cards + AI consent + "Continue to secure payment". */
export const PlanCheckoutForm = ({
  slug, idPrefix, initialPackage = 'standard', onAlreadyPaid, children,
}: PlanCheckoutFormProps) => {
  const [selected, setSelected] = useState<PackageType>(initialPackage);
  const [consent, setConsent] = useState(false);
  const { loading, plans } = usePlans();
  const { busy, error, start } = useCheckout(slug, onAlreadyPaid);

  const plan = plans?.find((p) => p.id === selected);
  const unavailable = !loading && (!plan || !plan.available);
  const needsConsent = selected === 'premium' && !consent;

  return (
    <div className="flex flex-col gap-5">
      <PlanCards idPrefix={idPrefix} selected={selected} onSelect={setSelected} plans={plans} disabled={busy} />

      {selected === 'premium' && (
        <label htmlFor={`${idPrefix}-consent`} className="flex items-start gap-3 text-sm text-[#1A1614] leading-relaxed cursor-pointer">
          <input
            id={`${idPrefix}-consent`}
            type="checkbox"
            checked={consent}
            disabled={busy}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#8B0000]"
          />
          <span>{AI_CONSENT_TEXT}</span>
        </label>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-[#1A1614] text-sm font-medium">{PRICE_NOTE}</p>
        <p className="text-muted text-xs">{LIFETIME_FOOTNOTE}</p>
      </div>

      <div aria-live="polite">
        {unavailable && <p className="text-[#6B6560] text-sm">{UNAVAILABLE_MESSAGE}</p>}
        {loading && <p className="text-[#6B6560] text-sm">Checking plans…</p>}
      </div>
      <p role="alert" className="text-[#8B0000] text-sm empty:hidden">{error}</p>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">{children}</div>
        <button
          type="button"
          disabled={busy || loading || unavailable || needsConsent}
          aria-busy={busy}
          onClick={() => void start(selected, consent)}
          className={BTN_PRIMARY}
        >
          {busy ? 'Redirecting to payment…' : 'Continue to secure payment'}
        </button>
      </div>
    </div>
  );
};
