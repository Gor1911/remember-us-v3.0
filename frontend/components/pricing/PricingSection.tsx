'use client';

import { useRouter } from 'next/navigation';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import type { PackageType } from '@/app/lib/types';
import { PLANS, LIFETIME_FOOTNOTE, PRICE_NOTE } from '@/components/pricing/plans';
import { PlanCard } from '@/components/pricing/PlanCard';
import { useReveal } from '@/components/landing/useReveal';
import { SWIPE_ITEM, SWIPE_ROW } from '@/components/ui/styles';
import { ClockIcon, QrIcon, SparkIcon } from '@/components/ui/icons';

const AFTER_PAYMENT = [
  { Icon: ClockIcon, when: 'Within 24 hours', what: 'Our team reviews your memorial and publishes it.' },
  { Icon: QrIcon, when: 'Right after approval', what: 'You receive the private link and a high-resolution QR code for engraving.' },
  { Icon: SparkIcon, when: 'Premium', what: 'Your Living Portrait is ready within 24 hours of approval, once a clear portrait photo is provided.' },
];

/** Canvas chapter: two full plan cards, then what happens after payment. */
export function PricingSection() {
  const ref = useReveal<HTMLElement>();
  const router = useRouter();
  const { openAuth } = useModal();
  const { isAuthenticated } = useAuth();

  const select = (id: PackageType) => {
    const target = `/memorial/new?package=${id}`;
    if (isAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('access'))) {
      router.push(target);
    } else {
      openAuth(target);
    }
  };

  return (
    <section ref={ref} id="pricing" aria-labelledby="pricing-title" className="scroll-mt-16 bg-canvas text-ink py-chapter">
      <div className="content-1000">
        <div className="text-center flex flex-col items-center">
          <h2 id="pricing-title" data-reveal className="type-heading">One payment. No renewals.</h2>
          <p data-reveal className="type-support text-muted max-w-[560px] mt-4">
            Drafts are free. You pay once, when you send the memorial to our team for review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 md:mt-10 rounded-[24px] bg-sand p-4 md:p-6">
          {PLANS.map((plan) => (
            <div key={plan.id} data-reveal>
              <PlanCard plan={plan} onSelect={select} />
            </div>
          ))}
        </div>
        <p className="type-caption text-muted text-center mt-5">{PRICE_NOTE}</p>

        <h3 data-reveal className="type-card-heading mt-12 md:mt-14">What happens after you pay</h3>
        <ol className={`${SWIPE_ROW} md:grid-cols-3 gap-3 md:gap-4 mt-5 list-none`} tabIndex={0} aria-label="After payment">
          {AFTER_PAYMENT.map(({ Icon, when, what }) => (
            <li key={when} data-reveal className={`${SWIPE_ITEM} bg-soft rounded-tile p-6 flex flex-col gap-2`}>
              <Icon className="w-8 h-8 text-bronze mb-2" />
              <p className="type-action text-bronze-deep">{when}</p>
              <p className="type-body text-muted">{what}</p>
            </li>
          ))}
        </ol>

        <p className="type-utility text-muted mt-6">{LIFETIME_FOOTNOTE}</p>
      </div>
    </section>
  );
}
