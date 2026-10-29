import type { PackageType } from '@/app/lib/types';

/** Marketing copy for the plans. Prices are confirmed by the API (`payments.plans()`). */
export interface PlanCopy {
  id: PackageType;
  name: string;
  priceLabel: string;
  tagline: string;
  features: string[];
  highlight?: string;
}

export const PLANS: PlanCopy[] = [
  {
    id: 'standard',
    name: 'Standard',
    priceLabel: '$99',
    tagline: 'A private memorial for the family.',
    features: [
      'Biography and life timeline',
      'Photo gallery',
      'Private access by QR code and link',
      'Downloadable archive of everything',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceLabel: '$149',
    tagline: 'Everything in Standard, with a Living Portrait.',
    features: [
      'Everything in Standard',
      'Living Portrait — AI animation of the main portrait, prepared by our team',
      'Portrait ready within 24 hours of approval, once a clear portrait photo is provided',
    ],
    highlight: 'Most Popular',
  },
];

export const PRICE_NOTE = 'One-time payment. No hidden fees. Lifetime access*';
export const LIFETIME_FOOTNOTE =
  '*For as long as Remember US operates. Download a full archive at any time.';

export const AI_CONSENT_TEXT =
  'I confirm I have the right to use the portrait photo and agree to it being animated with AI.';
