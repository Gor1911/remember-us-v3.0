import type { LegalSection } from '@/components/legal/legalTypes';

export const TERMS_SECTIONS: LegalSection[] = [
  { id: 'acceptance', title: 'Acceptance of terms', summary: 'How using Remember US constitutes agreement to these terms.' },
  { id: 'service', title: 'The service', summary: 'A description of the private digital memorial service provided by [Company legal name].' },
  { id: 'accounts', title: 'Accounts', summary: 'Rules for creating and keeping an account.' },
  { id: 'content', title: 'Memorial content and moderation', summary: 'Every memorial is reviewed by our team before it becomes visible.' },
  { id: 'payments', title: 'Payments and refunds', summary: 'Pricing, one-time payments and refund conditions.' },
  { id: 'termination', title: 'Account deletion and termination', summary: 'How an account can be deleted and when it may be terminated.' },
  { id: 'ip', title: 'Intellectual property', summary: 'Ownership of the service and of content you upload.' },
  { id: 'liability', title: 'Disclaimers and limitation of liability', summary: 'The limits of what the service promises and is responsible for.' },
  { id: 'law', title: 'Governing law', summary: 'The laws and courts that apply, in [Jurisdiction].' },
  { id: 'changes', title: 'Changes to these terms', summary: 'How updates to these terms are made and communicated.' },
  { id: 'contact', title: 'Contact', summary: 'How to reach us at [Contact email].' },
];
