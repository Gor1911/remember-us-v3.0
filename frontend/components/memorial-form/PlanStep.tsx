'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PackageType } from '@/app/lib/types';
import { PlanCheckoutForm } from '@/components/payments/PlanCheckoutForm';

interface PlanStepProps {
  slug: string;
  warning: string;
}

const initialPackage = (): PackageType =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('package') === 'premium'
    ? 'premium'
    : 'standard';

/** Final create-flow step: choose a plan and go to secure checkout. */
export const PlanStep = ({ slug, warning }: PlanStepProps) => {
  const router = useRouter();
  return (
    <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-6">
      <div>
        <h2 className="text-[#1A1614] font-bold text-xl tracking-tight mb-2">Choose a plan</h2>
        <p className="text-[#6B6560] text-sm leading-relaxed">
          Your draft is saved. Paying submits the memorial for review.
        </p>
      </div>
      {warning && <p role="alert" className="text-[#8B0000] text-sm">{warning}</p>}
      <PlanCheckoutForm
        slug={slug}
        idPrefix="create-plan"
        initialPackage={initialPackage()}
        onAlreadyPaid={() => router.push('/dashboard')}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-2 py-3 text-sm font-medium text-[#1A1614] underline underline-offset-4 hover:text-[#8B0000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
        >
          Save draft and pay later
        </Link>
      </PlanCheckoutForm>
    </div>
  );
};
