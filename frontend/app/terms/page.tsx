import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { TERMS_SECTIONS } from '@/components/legal/termsContent';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" sections={TERMS_SECTIONS} />;
}
