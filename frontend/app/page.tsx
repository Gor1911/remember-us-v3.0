import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { ModalProvider } from '@/app/context/ModalContext';
import {
  LivingPortraitSection,
  FeaturesSection,
  QrSection,
  CtaBanner,
} from '@/components/landing/PlaceholderSections';

export default function LandingPage() {
  return (
    <ModalProvider>
      <Header />
      <main className="bg-[#0D1117]">
        <HeroSection />
        <LivingPortraitSection />
        <FeaturesSection />
        <QrSection />
        <CtaBanner />
      </main>
      <Footer />
      <CreateMemorialModal />
    </ModalProvider>
  );
}
