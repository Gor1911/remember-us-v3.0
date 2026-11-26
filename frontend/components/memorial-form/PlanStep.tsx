'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PackageType } from '@/app/lib/types';
import { PlanCheckoutForm } from '@/components/payments/PlanCheckoutForm';
import { BTN_SECONDARY, LINK, NOTICE_WARN } from '@/components/ui/styles';

interface PlanStepProps {
  slug: string;
  warning: string;
}

const initialPackage = (): PackageType =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('package') === 'premium'
    ? 'premium'
    : 'standard';

/** Final create-flow step: choose a plan and go to secure checkout. Cards sit on the canvas, like the landing pricing. */
export const PlanStep = ({ slug, warning }: PlanStepProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="type-card-heading text-ink">Choose a plan</h2>
        <p className="type-body text-muted">
          Your draft is saved. Paying sends the memorial for review.{' '}
          <Link href={`/memorial/${slug}/edit`} className={LINK}>Change the details</Link>
        </p>
      </div>
      {warning && <p role="alert" className={NOTICE_WARN}>{warning}</p>}
      <PlanCheckoutForm
        slug={slug}
        idPrefix="create-plan"
        initialPackage={initialPackage()}
        onAlreadyPaid={() => router.push('/dashboard')}
      >
        <Link href="/dashboard" className={BTN_SECONDARY}>
          Save draft and pay later
        </Link>
      </PlanCheckoutForm>
    </div>
  );
};
