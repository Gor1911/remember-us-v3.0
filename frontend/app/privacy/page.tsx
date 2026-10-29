import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { PRIVACY_SECTIONS } from '@/components/legal/privacyContent';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={PRIVACY_SECTIONS} />;
}
