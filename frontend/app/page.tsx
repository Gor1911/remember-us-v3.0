import type { Metadata } from 'next';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { ModalProvider } from '@/app/context/ModalContext';
import { LivingPortraitSection } from '@/components/landing/LivingPortraitSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { QrSection } from '@/components/landing/QrSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { AccountDeletedNotice } from '@/components/landing/AccountDeletedNotice';
import { CtaBanner } from '@/components/landing/CtaBanner';

export const metadata: Metadata = {
  title: { absolute: 'Remember US — Digital Memorial' },
  description:
    'A private digital memorial with a living animated portrait, biography timeline and photo gallery. Shared only through a personal QR code.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Remember US',
    title: 'Remember US — Digital Memorial',
    description:
      'A private digital memorial with a living animated portrait, biography timeline and photo gallery. Shared only through a personal QR code.',
    images: [{ url: '/images/arlington.jpg', alt: 'Remember US' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remember US — Digital Memorial',
    description: 'A private digital memorial shared only through a personal QR code.',
    images: ['/images/arlington.jpg'],
  },
};

export default function LandingPage() {
  return (
    <ModalProvider>
      <Header />
      <AccountDeletedNotice />
      <main className="bg-[#FAF8F5]">
        <HeroSection />
        <LivingPortraitSection />
        <FeaturesSection />
        <HowItWorksSection />
        <QrSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <Footer />
      <CreateMemorialModal />
    </ModalProvider>
  );
}
