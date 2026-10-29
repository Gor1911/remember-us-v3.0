export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Who can see a memorial?',
    a: 'Only people who scan its QR code or have its private link. Memorials are never listed publicly and are hidden from search engines.',
  },
  {
    q: 'How much does it cost?',
    a: 'Standard is $99 and Premium is $149, each a single one-time payment. Premium adds a Living Portrait prepared by our team. No subscriptions and no hidden fees. Drafts are free until you submit.',
  },
  {
    q: 'How long will the memorial stay online?',
    a: 'Your one-time payment has no renewals. Your memorial stays online for as long as Remember US operates, and you can download a full archive of it at any time.',
  },
  {
    q: 'How do I put the QR code on a headstone?',
    a: 'Once your memorial is approved, you receive a high-resolution QR code. It can be engraved on a metal plaque or stone, or printed for a frame at home.',
  },
  {
    q: 'Who can edit a memorial?',
    a: 'Only the person who created it. Every change is reviewed by our team before it becomes visible.',
  },
  {
    q: 'How long does the review take?',
    a: 'Usually within 24 hours. You can follow the status of each memorial in your dashboard.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. You can delete your account at any time from your dashboard. This permanently removes all memorials you created.',
  },
];
